'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { UsageStats } from "@/components/dashboard/usage-stats";
import { Plus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Add01Icon } from "@hugeicons/react";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Templates</h1>
              <p className="text-slate-400">Manage your visual DNA collection</p>
            </div>
            <Link href="/editor/new">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" />
                New Template
              </button>
            </Link>
          </div>

          <UsageStats />

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <ErrorDisplay
              message={error || 'Unknown error'}
              onRetry={fetchTemplates}
            />
          ) : templates.length === 0 ? (
            <EmptyState
              icon={Add01Icon}
              title="No templates yet"
              description="Create your first template to start generating variations."
              actionLabel="Create Template"
              actionHref="/editor/new"
            />
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {templates.map((template) => (
                <motion.div key={template.id} variants={itemVariants}>
                  <GlassCard className="h-full flex flex-col p-0 overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="relative aspect-video bg-slate-800">
                      <Image
                        src={template.original_image_url}
                        alt={template.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Link href={`/editor/${template.id}`}>
                          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors" title="Edit" aria-label={`Edit ${template.name}`}>
                            <Edit className="w-5 h-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg backdrop-blur-sm transition-colors"
                          title="Delete"
                          aria-label={`Delete ${template.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-lg mb-1 truncate">{template.name}</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Last updated: {new Date(template.updated_at).toLocaleDateString()}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                        <span>{template.variations?.length || 0} variations</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
