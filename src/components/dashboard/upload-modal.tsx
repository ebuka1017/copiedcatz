'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useExtraction } from '@/lib/hooks/use-extraction';
import { ExtractionProgress } from '@/components/extraction-progress';
import { callEdgeFunction } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UploadModalProps {
    children: React.ReactNode;
}

export function UploadModal({ children }: UploadModalProps) {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [open, setOpen] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const {
        startExtraction,
        progress,
        status,
        currentCategory,
        reset
    } = useExtraction({
        onComplete: (templateId) => {
            setOpen(false);
            router.push(`/editor/${templateId}`);
        },
        onError: (error) => {
            console.error(error);
            setUploadError('Failed to process image');
        }
    });

    const handleFileSelect = async (file: File) => {
        if (!file) return;
        setUploadError(null);

        if (!user) {
            setUploadError("Please log in to upload.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Use callEdgeFunction which properly handles auth headers
            const uploadData = await callEdgeFunction('storage-upload', {
                body: formData,
                method: 'POST'
            });

            if (!uploadData || !uploadData.id) {
                throw new Error('Invalid response from upload service');
            }

            // Start extraction with the Upload ID
            await startExtraction(uploadData.id);

        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError('Upload failed: ' + (error as any).message);
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

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && status !== 'idle') {
            if (!confirm('Extraction is in progress. Are you sure you want to close?')) {
                return;
            }
            reset();
        }
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-card border-border text-foreground p-0 overflow-hidden">
                <DialogTitle className="sr-only">Upload Image</DialogTitle>
                <DialogDescription className="sr-only">Upload an image to extract its Visual DNA</DialogDescription>

                {status !== 'idle' ? (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                        <ExtractionProgress
                            progress={progress}
                            currentCategory={currentCategory}
                            status={status}
                        />
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                New Extraction
                            </h2>
                            <p className="text-muted-foreground">
                                Upload an image to decode its Visual DNA
                            </p>
                            {uploadError && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {uploadError}
                                </div>
                            )}
                        </div>

                        <div
                            className={`
                                border-2 border-dashed rounded-xl p-10 transition-all duration-200 text-center
                                ${isDragging
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                }
                            `}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 mb-2">
                                    <Upload className="w-8 h-8" />
                                </div>

                                <h3 className="text-lg font-medium text-slate-200">
                                    Drag & drop image here
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    JPG, PNG, WEBP up to 10MB
                                </p>

                                <div className="flex items-center gap-3 w-full justify-center">
                                    <div className="h-px bg-slate-800 flex-1" />
                                    <span className="text-xs text-slate-600 font-medium uppercase">or</span>
                                    <div className="h-px bg-slate-800 flex-1" />
                                </div>

                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 mt-2"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Browse Files
                                </Button>

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
                )}
            </DialogContent>
        </Dialog>
    );
}
