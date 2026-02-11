// Cloudflare R2 Upload Client
// Handles presigned URL acquisition from edge function + direct upload to R2
// Used by all media upload paths in the app.

import { supabase } from '../../store/supabaseClient';
import { compressImage } from '../../utils';

const R2_PUBLIC_DOMAIN = import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://media.dispatch.bld.co.ke';

type MediaFolder =
    | 'avatars'
    | 'covers'
    | 'story-content'
    | 'images'
    | 'campuseats-assets'
    | 'unicampus-papers'
    | 'videos';

interface UploadOptions {
    /** Skip image compression (for PDFs, already-compressed files) */
    skipCompression?: boolean;
    /** Override content type detection */
    contentType?: string;
    /** Progress callback (0-1) for large uploads */
    onProgress?: (progress: number) => void;
}

interface PresignedResponse {
    uploadUrl: string;
    publicUrl: string;
    objectKey: string;
}

/**
 * Compress video on client side to reduce upload size.
 * Uses canvas + MediaRecorder to re-encode at lower bitrate.
 * Falls back to original file if compression fails.
 */
export async function compressVideo(file: File, onProgress?: (p: number) => void): Promise<File> {
    // If file is under 10MB, skip compression
    if (file.size < 10 * 1024 * 1024) return file;

    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;

        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;

        video.onloadedmetadata = () => {
            // Target: max 720p, cap at 30fps
            const maxWidth = 720;
            const maxHeight = 1280;
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;

            const stream = canvas.captureStream(30);

            // Try to get audio track from the video
            try {
                const audioCtx = new AudioContext();
                const source = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                source.connect(dest);
                source.connect(audioCtx.destination);
                dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
            } catch {
                // No audio or audio context not available — that's fine
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                    ? 'video/webm;codecs=vp9'
                    : 'video/webm',
                videoBitsPerSecond: 1_500_000, // 1.5 Mbps target
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                URL.revokeObjectURL(objectUrl);
                const blob = new Blob(chunks, { type: 'video/webm' });

                // Only use compressed version if it's actually smaller
                if (blob.size < file.size) {
                    const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
                        type: 'video/webm',
                        lastModified: Date.now(),
                    });
                    resolve(compressed);
                } else {
                    resolve(file);
                }
            };

            let currentTime = 0;
            const duration = video.duration;

            const drawFrame = () => {
                if (video.ended || video.paused) {
                    mediaRecorder.stop();
                    return;
                }
                ctx.drawImage(video, 0, 0, width, height);
                currentTime = video.currentTime;
                if (onProgress) onProgress(Math.min(currentTime / duration, 0.99));
                requestAnimationFrame(drawFrame);
            };

            mediaRecorder.start();
            video.play();
            drawFrame();

            // Safety timeout: max 2x video duration
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    video.pause();
                    mediaRecorder.stop();
                }
            }, (duration * 2000) + 5000);
        };

        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file); // Fallback to original
        };
    });
}

/**
 * Upload a file to Cloudflare R2 via presigned URL.
 * 
 * Flow:
 * 1. (Optional) Compress the file client-side
 * 2. Call edge function to get presigned PUT URL
 * 3. PUT file directly to R2
 * 4. Return the public CDN URL
 */
export async function uploadToR2(
    file: File,
    folder: MediaFolder,
    options: UploadOptions = {}
): Promise<string | null> {
    try {
        let processedFile = file;
        let contentType = options.contentType || file.type;

        // Compress images (unless skipped)
        if (!options.skipCompression && file.type.startsWith('image/')) {
            processedFile = await compressImage(file);
            contentType = 'image/jpeg'; // compressImage always outputs JPEG
        }

        // Compress videos
        if (!options.skipCompression && file.type.startsWith('video/')) {
            processedFile = await compressVideo(file, options.onProgress);
            contentType = processedFile.type;
        }

        // 1. Get presigned URL from edge function
        // Explicitly get the session token to avoid functions.invoke()
        // falling back to the anon key (which fails getUser in the edge fn)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            console.error('R2 Upload: No active session — user must be logged in');
            return null;
        }

        const { data, error: fnError } = await supabase.functions.invoke('r2-upload', {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            body: {
                folder,
                fileName: processedFile.name,
                contentType,
                fileSize: processedFile.size,
            },
        });

        if (fnError) {
            // Extract actual error body from FunctionsHttpError
            let detail = fnError.message;
            try {
                if (fnError.context && typeof fnError.context.json === 'function') {
                    const body = await fnError.context.json();
                    detail = JSON.stringify(body);
                }
            } catch { /* ignore parse errors */ }
            console.error('R2 presign error:', detail, fnError);
            return null;
        }

        if (!data) {
            console.error('R2 presign error: no data returned');
            return null;
        }

        const { uploadUrl, publicUrl } = data as PresignedResponse;

        // 2. Upload directly to R2
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
            body: processedFile,
        });

        if (!uploadResponse.ok) {
            console.error('R2 upload failed:', uploadResponse.status, await uploadResponse.text());
            return null;
        }

        return publicUrl;

    } catch (error) {
        console.error('R2 upload error:', error);
        return null;
    }
}

/**
 * Upload an image to R2 — convenience wrapper matching old `uploadImage` signature.
 */
export async function uploadImageToR2(file: File, folder: MediaFolder): Promise<string | null> {
    return uploadToR2(file, folder);
}

/**
 * Upload a video to R2 with compression.
 */
export async function uploadVideoToR2(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string | null> {
    return uploadToR2(file, 'videos', { onProgress });
}
