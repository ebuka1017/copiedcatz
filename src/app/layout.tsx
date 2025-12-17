import type { Metadata } from "next";
import localFont from "next/font/local";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/Poppins/Poppins-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../public/fonts/Poppins/Poppins-Black.ttf", weight: "900", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Copiedcatz - Visual DNA Extractor",
  description: "Extract and remix the style of any image.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-sans bg-background text-foreground`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
