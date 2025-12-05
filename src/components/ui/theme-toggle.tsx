'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Check local storage or system preference
        if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'dark') {
            setTheme('light');
            localStorage.theme = 'light';
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            setTheme('dark');
            localStorage.theme = 'dark';
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
