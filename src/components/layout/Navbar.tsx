'use client';

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Home, Mail, LogIn, UserPlus, LayoutDashboard, Store } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
    const { user, loading } = useAuth();

    return (
        <nav className="w-full p-6 flex justify-between items-center z-10 absolute top-0 left-0 right-0">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                    <img src="/logo.png" alt="CopiedCatz Logo" className="object-cover w-full h-full" />
                </div>
                <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                    CopiedCatz
                </span>
            </Link>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
                    <Link href="/marketplace" className="hover:text-white transition-colors flex items-center gap-1">
                        <Store size={16} />
                        Marketplace
                    </Link>
                    <Link href="/#use-cases" className="hover:text-white transition-colors flex items-center gap-1">
                        <Home size={16} />
                        Use Cases
                    </Link>
                    <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1">
                        <Mail size={16} />
                        Contact
                    </Link>
                </div>

                {!loading && (
                    <div className="flex gap-4 items-center">
                        {user ? (
                            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all flex items-center gap-2">
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                                    <LogIn size={16} />
                                    Login
                                </Link>
                                <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all flex items-center gap-2">
                                    <UserPlus size={16} />
                                    Sign Up
                                </Link>
                            </>
                        )}
                        <ThemeToggle />
                    </div>
                )}
            </div>
        </nav>
    );
}
