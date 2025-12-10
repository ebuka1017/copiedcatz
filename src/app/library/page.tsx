'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Code, Loader2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Template {
    id: string;
    name: string;
    original_image_url: string;
    structured_prompt: any;
    created_at: string;
}

export default function LibraryPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase.functions.invoke('database-access', {
                body: {
                    table: 'Template',
                    query: '*' // Fetch all fields including structured_prompt
                }
            });

            if (error) throw new Error(error.message);
            if (data.error) throw new Error(data.error);

            setTemplates(data.data || []);
        } catch (err) {
            console.error('Library fetch error:', err);
            setError('Failed to load library');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />

            <main className="flex-grow pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Visual DNA Library</h1>
                        <p className="text-muted-foreground">View your extracted styles and their raw JSON DNA</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {templates.map((template) => (
                                <Card key={template.id} className="overflow-hidden group hover:border-blue-500 transition-colors bg-card border-border">
                                    <div className="relative aspect-square">
                                        <Image
                                            src={template.original_image_url}
                                            alt={template.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex items-center gap-2"
                                                onClick={() => setSelectedTemplate(template)}
                                            >
                                                <Code className="w-4 h-4" />
                                                View DNA
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium truncate">{template.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(template.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-card text-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5 text-blue-500" />
                            Visual DNA
                        </DialogTitle>
                        <DialogDescription>
                            Raw JSON structure extracted from {selectedTemplate?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-grow mt-4 border rounded-md bg-slate-950 p-4">
                        <pre className="text-xs font-mono text-green-400">
                            {JSON.stringify(selectedTemplate?.structured_prompt, null, 2)}
                        </pre>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
