'use client';

import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BatchPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setError(null);
        setResults([]);

        try {
            // In a real implementation, we would upload files to Supabase Storage first
            // then send the URLs to the batch API.
            // For this MVP, we'll simulate the process or handle one by one if the API supports it.

            // Placeholder for actual batch logic
            await new Promise(resolve => setTimeout(resolve, 2000));

            setResults(files.map(f => ({ name: f.name, status: 'success', id: Math.random().toString() })));

        } catch (err) {
            setError('Failed to process batch');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 text-white">
            <Navbar />

            <main className="flex-grow pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                            Batch Processing
                        </h1>
                        <p className="text-xl text-slate-400">
                            Extract Visual DNA from multiple images at once.
                        </p>
                    </div>

                    <Card className="p-8">
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-blue-500/50 transition-colors bg-slate-800/20">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="batch-upload"
                            />
                            <label htmlFor="batch-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium">Click to upload images</p>
                                    <p className="text-sm text-slate-400">JPG, PNG up to 10MB each</p>
                                </div>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{files.length} files selected</h3>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {uploading ? 'Processing...' : 'Start Batch Extraction'}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                                            {results[i] ? (
                                                <span className="text-green-400 flex items-center gap-1 text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Done
                                                </span>
                                            ) : uploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                            ) : (
                                                <span className="text-slate-500 text-sm">Pending</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && <div className="mt-6"><ErrorDisplay message={error} /></div>}
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
