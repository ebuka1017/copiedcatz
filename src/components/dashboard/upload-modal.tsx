'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
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

    // Image preview state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const {
        startExtraction,
        progress,
        status,
        currentCategory,
        reset
    } = useExtraction({
        onComplete: (templateId) => {
            // Clean up and redirect
            cleanupPreview();
            setOpen(false);
            router.push(`/editor/${templateId}`);
        },
        onError: (error) => {
            console.error(error);
            setUploadError(error.message || 'Failed to process image');
            setIsUploading(false);
        }
    });

    const cleanupPreview = useCallback(() => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setSelectedFile(null);
        setIsUploading(false);
    }, [imagePreview]);

    const handleFileSelect = useCallback((file: File) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file (JPG, PNG, WEBP)');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Image must be less than 10MB');
            return;
        }

        setUploadError(null);

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedFile(file);
    }, []);

    const handleUpload = async () => {
        if (!selectedFile) return;

        if (!user) {
            setUploadError("Please log in to upload.");
            return;
        }

        setUploadError(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Upload the file
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
            setIsUploading(false);
        }
    };

    const handleCancelPreview = () => {
        cleanupPreview();
        setUploadError(null);
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
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // If closing and there's activity, confirm
            if (status !== 'idle' || isUploading) {
                if (!confirm('Upload/extraction is in progress. Are you sure you want to close?')) {
                    return;
                }
            }
            // Cleanup on close
            cleanupPreview();
            reset();
            setUploadError(null);
        }
        setOpen(newOpen);
    };

    // Determine what to show
    const showProgress = status !== 'idle' || isUploading;
    const showPreview = imagePreview && !showProgress;
    const showDropzone = !imagePreview && !showProgress;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-700 text-white p-0 overflow-hidden">
                <DialogTitle className="sr-only">Upload Image</DialogTitle>
                <DialogDescription className="sr-only">Upload an image to extract its Visual DNA</DialogDescription>

                {/* Progress View - During Upload or Extraction */}
                {showProgress && (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                        {isUploading && status === 'idle' ? (
                            // Uploading state before extraction starts
                            <div className="w-full max-w-sm mx-auto text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Uploading Image...</h3>
                                <p className="text-sm text-slate-400">Please wait while we upload your image</p>

                                {/* Show small preview during upload */}
                                {imagePreview && (
                                    <div className="mt-6 flex justify-center">
                                        <img
                                            src={imagePreview}
                                            alt="Uploading"
                                            className="w-24 h-24 object-cover rounded-lg border-2 border-slate-700 opacity-50"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Extraction progress
                            <ExtractionProgress
                                progress={progress}
                                currentCategory={currentCategory}
                                status={status}
                            />
                        )}
                    </div>
                )}

                {/* Preview View - After selecting file, before upload */}
                {showPreview && (
                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Ready to Extract
                            </h2>
                            <p className="text-slate-400">
                                Preview your image and start extraction
                            </p>
                        </div>

                        {/* Image Preview */}
                        <div className="relative mb-6">
                            <div className="aspect-video relative rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* File info */}
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-slate-400 truncate max-w-xs">
                                    {selectedFile?.name}
                                </span>
                                <span className="text-slate-500">
                                    {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        </div>

                        {uploadError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {uploadError}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleCancelPreview}
                                variant="ghost"
                                className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Extract Visual DNA
                            </Button>
                        </div>
                    </div>
                )}

                {/* Dropzone View - Initial state */}
                {showDropzone && (
                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                New Extraction
                            </h2>
                            <p className="text-slate-400">
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
                                border-2 border-dashed rounded-xl p-10 transition-all duration-200 text-center cursor-pointer
                                ${isDragging
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                                }
                            `}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
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
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 mt-2"
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
                                        // Reset input so same file can be selected again
                                        e.target.value = '';
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
