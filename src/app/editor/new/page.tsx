'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { upload } from '@vercel/blob/client'; // Keep for now if needed, or remove? Better remove
import { useExtraction } from '@/lib/hooks/use-extraction';
import { ExtractionProgress } from '@/components/extraction-progress';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
    const router = useRouter();
    const { user } = useAuth();
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

        // Since we are using Supabase storage client-side, we should probably do the upload here
        // But wait, the previous code I wrote used verifyAuth on server.
        // Let's us the supabase client upload pattern I wrote in Step 276.
        // Wait, I need to make sure I have the imports.
        // I see createClient and useAuth imported.

        if (!user) {
            alert("Please log in to upload.");
            return;
        }

        try {
            // 1. Upload to Supabase Storage
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('uploads')
                .upload(fileName, file);

            if (error) {
                console.error('Supabase upload error:', error);
                throw error;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);

            // 3. Start extraction with the public URL
            await startExtraction(publicUrl);

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + (error as any).message);
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
            <Card className="max-w-2xl w-full p-12 text-center bg-slate-900 border-slate-800">
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

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
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
            </Card>
        </div>
    );
}
