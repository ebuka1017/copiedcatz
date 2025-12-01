'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { useExtraction } from '@/lib/hooks/use-extraction';
import { ExtractionProgress } from '@/components/extraction-progress';
import cardStyles from '@/components/ui/glass-card.module.css';
import buttonStyles from '@/components/ui/glass-button.module.css';

export default function NewProjectPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const {
        startExtraction,
        progress,
        status,
        currentCategory
    } = useExtraction({
        onComplete: (templateId) => {
            router.push(`/editor/${templateId}`);
        },
        onError: (error) => {
            console.error(error);
            alert('Failed to process image');
        }
    });

    const handleFileSelect = async (file: File) => {
        if (!file) return;

        try {
            // 1. Upload to Vercel Blob
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload/request',
            });

            // 2. Start extraction
            // We need to pass the blob URL because we don't have the DB ID yet.
            // The server will need to look up the upload by URL or create it if missing (but onUploadCompleted should handle creation).
            // However, onUploadCompleted is async and might race.
            // Ideally, we wait for onUploadCompleted? No, we can't.

            // Actually, if we pass the URL to extract, extract can look it up.
            // But we need to update extract route to accept url.
            await startExtraction(newBlob.url);

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    };

    if (status !== 'idle') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <ExtractionProgress
                    progress={progress}
                    currentCategory={currentCategory}
                    status={status}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className={`${cardStyles.card} max-w-2xl w-full p-12 text-center`}>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Create New Template
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Upload an image to extract its Visual DNA
                    </p>
                </div>

                <div
                    className={`
            border-2 border-dashed rounded-2xl p-12 transition-all duration-200
            ${isDragging
                            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                        }
          `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                            <Upload className="w-10 h-10" />
                        </div>

                        <h3 className="text-xl font-semibold text-slate-800">
                            Drag & drop your image here
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Supports JPG, PNG, WEBP up to 10MB
                        </p>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={buttonStyles.button}
                        >
                            <ImageIcon className="w-5 h-5" />
                            Browse Files
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(file);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
