import { uploadToR2 } from './src/lib/r2';

export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    switch (pattern) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(40);
        break;
      case 'heavy':
        navigator.vibrate(70);
        break;
      case 'success':
        navigator.vibrate([30, 50, 30]);
        break;
    }
  }
};

export const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, 'image/jpeg', 0.7); // 0.7 quality
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Upload an image to Cloudflare R2.
 * Bucket name maps to an R2 folder path. Maintains backward-compatible signature.
 */
export const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
  // Map old Supabase bucket names to R2 folder names
  const folderMap: Record<string, string> = {
    'avatars': 'avatars',
    'covers': 'covers',
    'story-content': 'story-content',
    'images': 'images',
    'campuseats-assets': 'campuseats-assets',
    'unicampus-papers': 'unicampus-papers',
  };

  const folder = folderMap[bucket] || bucket;

  try {
    // PDFs should not be compressed
    const skipCompression = file.type === 'application/pdf';
    const url = await uploadToR2(file, folder as any, { skipCompression });
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const parseDateSafe = (dateString: string | number | Date | null | undefined): Date | null => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  if (typeof dateString === 'number') return new Date(dateString);

  // Handle SQL timestamps (YYYY-MM-DD HH:MM:SS) which Safari hates
  // Replace space with T to make it ISO-8601 compliant
  const safeString = dateString.replace(' ', 'T');
  const date = new Date(safeString);

  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return null;
  }
  return date;
};