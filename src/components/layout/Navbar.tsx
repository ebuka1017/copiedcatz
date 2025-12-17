'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Home, Mail, LogIn, UserPlus, LayoutDashboard, Store } from "lucide-react";

export function Navbar() {
    const { user, loading } = useAuth();

    return (
        <nav className="w-full h-20 px-6 md:px-12 flex justify-between items-center z-50 fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 transition-all duration-300">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-sm border border-slate-700 group-hover:shadow-md transition-all">
                    <Image
                        src="/logo.png"
                        alt="CopiedCatz Logo"
                        fill={true}
                        className="object-cover"
                        sizes="36px"
                    />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                    CopiedCatz
                </span>
            </Link>

            <div className="flex items-center gap-8">
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                    <Link href="/marketplace" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Store size={16} />
                        Marketplace
                    </Link>
                    <Link href="/#use-cases" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Home size={16} />
                        Use Cases
                    </Link>
                    <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Mail size={16} />
                        Contact
                    </Link>
                </div>

                {!loading && (
                    <div className="flex gap-3 items-center">
                        {user ? (
                            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:flex px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors items-center gap-2">
                                    <LogIn size={16} />
                                    Login
                                </Link>
                                <Link href="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5">
                                    <UserPlus size={16} />
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
