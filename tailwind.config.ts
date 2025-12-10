import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                "card-foreground": "var(--card-foreground)",
                popover: "var(--popover)",
                "popover-foreground": "var(--popover-foreground)",
                primary: {
                    DEFAULT: "var(--primary-600)",
                    foreground: "#ffffff",
                    50: "var(--primary-50)",
                    100: "var(--primary-100)",
                    500: "var(--primary-500)",
                    600: "var(--primary-600)",
                    700: "var(--primary-700)",
                },
                secondary: {
                    DEFAULT: "var(--slate-100)",
                    foreground: "var(--slate-900)",
                },
                accent: {
                    DEFAULT: "var(--accent-500)",
                    foreground: "#ffffff",
                },
                destructive: {
                    DEFAULT: "#ef4444", // Red-500
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                border: "var(--border)",
                input: "var(--input)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["var(--font-body)", "sans-serif"],
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-out",
                "slide-up": "slide-up 0.5s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
