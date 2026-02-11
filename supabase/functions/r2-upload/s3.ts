// S3-compatible presigned URL generator for Cloudflare R2
// Uses AWS Signature V4 — no external dependencies needed in Deno.
/*
const encoder = new TextEncoder();

async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
        "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

async function sha256Hex(data: string): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function toHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getSignatureKey(
    secretKey: string, dateStamp: string, region: string, service: string
): Promise<ArrayBuffer> {
    let key = await hmacSha256(encoder.encode("AWS4" + secretKey), dateStamp);
    key = await hmacSha256(key, region);
    key = await hmacSha256(key, service);
    key = await hmacSha256(key, "aws4_request");
    return key;
}

export interface PresignedUrlOptions {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    key: string;      // object key (path in bucket)
    method: "PUT" | "GET" | "DELETE";
    expiresIn?: number; // seconds, default 3600
    contentType?: string;
    region?: string;
}

export async function generatePresignedUrl(opts: PresignedUrlOptions): Promise<string> {
    const region = opts.region || "auto";
    const service = "s3";
    const expiresIn = opts.expiresIn || 3600;
    const host = `${opts.accountId}.r2.cloudflarestorage.com`;
    const endpoint = `https://${host}`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const dateStamp = amzDate.substring(0, 8);
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const credential = `${opts.accessKeyId}/${credentialScope}`;

    // Canonical query string (sorted)
    const queryParams: Record<string, string> = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": credential,
        "X-Amz-Date": amzDate,
        "X-Amz-Expires": String(expiresIn),
        "X-Amz-SignedHeaders": "host",
    };

    if (opts.contentType && opts.method === "PUT") {
        queryParams["X-Amz-SignedHeaders"] = "content-type;host";
    }

    const canonicalQueryString = Object.keys(queryParams)
        .sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
        .join("&");

    // Canonical headers
    let canonicalHeaders = `host:${host}\n`;
    let signedHeaders = "host";

    if (opts.contentType && opts.method === "PUT") {
        canonicalHeaders = `content-type:${opts.contentType}\nhost:${host}\n`;
        signedHeaders = "content-type;host";
    }

    const encodedKey = opts.key.split("/").map(encodeURIComponent).join("/");
    const canonicalUri = `/${opts.bucket}/${encodedKey}`;

    const canonicalRequest = [
        opts.method,
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
        "AWS4-HMAC-SHA256",
        amzDate,
        credentialScope,
        await sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = await getSignatureKey(opts.secretAccessKey, dateStamp, region, service);
    const signature = toHex(await hmacSha256(signingKey, stringToSign));

    return `${endpoint}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}
*/