"use client";

import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import { useRef, useState } from "react";

const UploadExample = () => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const controller = new AbortController();
        setAbortController(controller);
        setProgress(0);
        setIsUploading(true);

        let authParams;
        try {
            const res = await fetch("/api/upload-auth");
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Request failed with status ${res.status}: ${errorText}`);
            }
            const data = await res.json();
            const { signature, expire, token, publicKey } = data;
            authParams = { signature, expire, token, publicKey };
        } catch (authError) {
            console.error("Authentication error:", authError);
            setIsUploading(false);
            return;
        }

        try {
            const response = await upload({
                file,
                fileName: file.name,
                ...authParams,
                abortSignal: controller.signal,
                onProgress: (event) => {
                    setProgress((event.loaded / event.total) * 100);
                },
            });
            console.log("Upload complete:", response);
        } catch (error) {
            if (error instanceof ImageKitAbortError) {
                console.warn("Upload aborted:", error.reason);
            } else if (error instanceof ImageKitInvalidRequestError) {
                console.error("Invalid request:", error.message);
            } else if (error instanceof ImageKitUploadNetworkError) {
                console.error("Network error:", error.message);
            } else if (error instanceof ImageKitServerError) {
                console.error("Server error:", error.message);
            } else {
                console.error("Upload error:", error);
            }
        } finally {
            setIsUploading(false);
            setAbortController(null);
        }
    };

    const cancelUpload = () => {
        abortController?.abort();
    };

    return (
        <div className="space-y-4">
            <input type="file" onChange={handleFileChange} disabled={isUploading} />

            {isUploading && (
                <div>
                    <progress value={progress} max={100} />
                    <span className="ml-2">{Math.round(progress)}%</span>
                </div>
            )}

            {isUploading && (
                <button onClick={cancelUpload} className="bg-red-500 text-white px-4 py-1 rounded">
                    Cancel Upload
                </button>
            )}
        </div>
    );
};

export default UploadExample;