import Link from "next/link";

export function Footer() {
    return (
        <footer className="py-8 px-6 border-t border-white/5 bg-slate-950">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                <div>© 2025 CopiedCatz. All rights reserved.</div>
                <div className="flex gap-6">
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="https://x.com/nothiro__" target="_blank" className="hover:text-white transition-colors">Twitter</Link>
                </div>
            </div>
        </footer>
    );
}
