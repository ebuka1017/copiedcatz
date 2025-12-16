'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { UploadModal } from "@/components/dashboard/upload-modal";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { UsageStats } from "@/components/dashboard/usage-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Template {
  id: string;
  name: string;
  original_image_url: string;
  updated_at: string;
  variations?: { created_at: string }[];
}

export default function Dashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) {
        if (res.status === 401) {
          // Redirect to login or handle unauthorized
          window.location.href = '/login'; // Assuming there is a login page
          return;
        }
        throw new Error('Failed to fetch templates');
      }
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete template');

      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete template');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">My Templates</h1>
              <p className="text-muted-foreground">Manage your visual DNA collection</p>
            </div>
            <UploadModal>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" />
                New Template
              </button>
            </UploadModal>
          </div>

          <UsageStats />

          {/* // ... inside component ... */}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-full flex flex-col">
                  <Skeleton className="aspect-video mb-4 rounded-xl" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorDisplay
              message={error}
            />
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
              <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center text-slate-300">
                <Plus size={32} />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold text-white">No templates yet</h3>
                <p className="text-slate-300">Create your first template to start generating variations.</p>
              </div>
              <div className="pt-2">
                <UploadModal>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold flex items-center gap-2 text-white text-sm transition-colors">
                    <Plus className="w-4 h-4" />
                    Create Template
                  </button>
                </UploadModal>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {templates.map((template) => (
                <motion.div key={template.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col p-0 overflow-hidden group hover:border-blue-500/30 transition-colors bg-slate-900 border-slate-800">
                    <div className="relative aspect-video bg-slate-800">
                      <Image
                        src={template.original_image_url}
                        alt={template.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Link href={`/editor/${template.id}`}>
                          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors" title="Edit" aria-label={`Edit ${template.name}`}>
                            <Edit className="w-5 h-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full backdrop-blur-sm transition-colors"
                          title="Delete"
                          aria-label={`Delete ${template.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-lg mb-1 truncate">{template.name}</h3>
                      <p className="text-sm text-slate-300 mb-4">
                        Last updated: {new Date(template.updated_at).toLocaleDateString()}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs text-slate-400">
                        <span>{template.variations?.length || 0} variations</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main >

      <Footer />
    </div >
  );
}
