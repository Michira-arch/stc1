// Edge Function: r2-upload
// Generates presigned URLs for uploading media to Cloudflare R2.
// Validates user auth and file metadata before granting upload access.
/*
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generatePresignedUrl } from "./s3.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Allowed folders and their constraints
const FOLDER_CONFIG: Record<string, { maxSizeMB: number; allowedTypes: string[] }> = {
    avatars: { maxSizeMB: 5, allowedTypes: ["image/jpeg", "image/png", "image/webp"] },
    covers: { maxSizeMB: 5, allowedTypes: ["image/jpeg", "image/png", "image/webp"] },
    "story-content": { maxSizeMB: 10, allowedTypes: ["image/jpeg", "image/png", "image/webp"] },
    images: { maxSizeMB: 5, allowedTypes: ["image/jpeg", "image/png", "image/webp"] },
    "campuseats-assets": { maxSizeMB: 10, allowedTypes: ["image/jpeg", "image/png", "image/webp"] },
    "unicampus-papers": { maxSizeMB: 20, allowedTypes: ["application/pdf"] },
    videos: { maxSizeMB: 100, allowedTypes: ["video/mp4", "video/webm", "video/quicktime"] },
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Verify auth
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Parse request
        const body = await req.json();
        const { folder, fileName, contentType, fileSize } = body as {
            folder: string;
            fileName: string;
            contentType: string;
            fileSize: number; // in bytes
        };

        // 3. Validate folder
        const config = FOLDER_CONFIG[folder];
        if (!config) {
            return new Response(JSON.stringify({ error: `Invalid folder: ${folder}` }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. Validate content type
        if (!config.allowedTypes.includes(contentType)) {
            return new Response(JSON.stringify({
                error: `File type ${contentType} not allowed for ${folder}. Allowed: ${config.allowedTypes.join(", ")}`,
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 5. Validate file size
        const maxBytes = config.maxSizeMB * 1024 * 1024;
        if (fileSize > maxBytes) {
            return new Response(JSON.stringify({
                error: `File too large. Max ${config.maxSizeMB}MB for ${folder}`,
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 6. Generate unique object key
        const timestamp = Date.now();
        const uniqueId = crypto.randomUUID().replace(/-/g, "").substring(0, 12);
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const objectKey = `${folder}/${timestamp}_${uniqueId}_${sanitizedName}`;

        // 7. Generate presigned PUT URL
        const accountId = Deno.env.get("R2_ACCOUNT_ID")!;
        const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID")!;
        const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
        const bucketName = Deno.env.get("R2_BUCKET_NAME") || "stc-media";
        const publicDomain = Deno.env.get("R2_PUBLIC_DOMAIN") || "https://media.dispatch.bld.co.ke";

        const uploadUrl = await generatePresignedUrl({
            accountId,
            accessKeyId,
            secretAccessKey,
            bucket: bucketName,
            key: objectKey,
            method: "PUT",
            contentType,
            expiresIn: 600, // 10 minutes to complete upload
        });

        const publicUrl = `${publicDomain}/${objectKey}`;

        return new Response(JSON.stringify({ uploadUrl, publicUrl, objectKey }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("r2-upload error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
*/