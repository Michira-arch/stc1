import { useState, useRef } from "react";
import { Button } from "@marketplace/components/ui/button";
import { Input } from "@marketplace/components/ui/input";
import { uploadToR2 } from "../../../lib/r2";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface SupabaseImageUploadProps {
    onSuccess: (url: string) => void;
    className?: string;
    disabled?: boolean;
}

export function SupabaseImageUpload({
    onSuccess,
    className,
    disabled,
}: SupabaseImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic Validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);

            const publicUrl = await uploadToR2(file, 'images');

            if (!publicUrl) {
                throw new Error('Upload failed — no URL returned');
            }

            onSuccess(publicUrl);
            toast.success("Image uploaded successfully");

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Error uploading image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={className}>
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                disabled={disabled || isUploading}
            />
            <Button
                type="button"
                variant="outline"
                disabled={disabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex gap-2 items-center justify-center bg-primary hover:bg-market-accent text-white hover:text-white"
            >
                {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
        </div>
    );
}
