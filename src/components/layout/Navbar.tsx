import Link from "next/link";

export function Navbar() {
    return (
        <nav className="w-full p-6 flex justify-between items-center z-10 absolute top-0 left-0 right-0">
            <Link href="/" className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                CopiedCatz
            </Link>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
                    <Link href="/#use-cases" className="hover:text-white transition-colors">Use Cases</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
                <div className="flex gap-4">
                    <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all">
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
}
