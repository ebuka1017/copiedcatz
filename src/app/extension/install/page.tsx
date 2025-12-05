'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Download, FolderOpen, Puzzle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function InstallExtensionPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-12">

                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold">Install CopiedCatz Extension</h1>
                        <p className="text-xl text-slate-400">Enable visual extraction functionalities in your browser.</p>
                    </div>

                    <Card className="p-8 md:p-12 bg-slate-900 border-slate-800">
                        <div className="space-y-12">

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-blue-400 font-bold text-xl">1</div>
                                <div className="space-y-4 flex-grow">
                                    <h3 className="text-2xl font-bold">Download the Extension</h3>
                                    <p className="text-slate-400">Get the latest version of the extension package.</p>
                                    <a href="/copiedcatz-extension.zip" download>
                                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                            <Download size={20} />
                                            Download .zip
                                        </button>
                                    </a>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-purple-400 font-bold text-xl">2</div>
                                <div className="space-y-4 flex-grow">
                                    <h3 className="text-2xl font-bold">Unzip the File</h3>
                                    <p className="text-slate-400">Extract the downloaded zip file to a folder on your computer. You should see a folder containing files like <code className="bg-slate-800 px-1 py-0.5 rounded">manifest.json</code>.</p>
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 font-mono text-sm text-slate-300">
                                        <FolderOpen size={16} className="inline mr-2" />
                                        /Downloads/copiedcatz-extension/
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex-shrink-0 flex items-center justify-center text-pink-400 font-bold text-xl">3</div>
                                <div className="space-y-4 flex-grow">
                                    <h3 className="text-2xl font-bold">Load in Chrome</h3>
                                    <ol className="list-disc pl-5 space-y-2 text-slate-400 marker:text-pink-500">
                                        <li>Open Chrome and navigate to <code className="text-white">chrome://extensions</code></li>
                                        <li>Toggle <strong className="text-white">Developer mode</strong> in the top right corner.</li>
                                        <li>Click <strong className="text-white">Load unpacked</strong> button.</li>
                                        <li>Select the folder you unzipped in Step 2.</li>
                                    </ol>
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-4">
                                        <Puzzle size={24} className="text-slate-500" />
                                        <span className="text-sm text-slate-400">You should now see the CopiedCatz extension in your list!</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Card>

                    <div className="text-center">
                        <Link href="/dashboard">
                            <button className="text-slate-400 hover:text-white flex items-center gap-2 mx-auto transition-colors">
                                <RefreshCcw size={16} />
                                Return to Dashboard
                            </button>
                        </Link>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
