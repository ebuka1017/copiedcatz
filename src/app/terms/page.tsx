'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="flex-grow p-6 pt-24 pb-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                            Terms of Service
                        </h1>
                        <p className="text-slate-400">
                            Last updated: December 2024
                        </p>
                    </div>

                    <div className="space-y-8 text-slate-300">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using CopiedCatz ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">2. Ownership of Your Creations</h2>
                            <p>
                                <strong className="text-white">You own everything you create.</strong> All images, variations, and content you generate using CopiedCatz belong entirely to you. You retain full ownership and intellectual property rights to all your creations.
                            </p>
                            <p>
                                You are free to use your creations for any purpose, including but not limited to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Commercial use and products</li>
                                <li>Marketing and advertising</li>
                                <li>Personal projects</li>
                                <li>Resale or distribution</li>
                                <li>Any other lawful purpose</li>
                            </ul>
                            <p>
                                We claim no ownership, licensing rights, or control over the content you create using our platform.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">3. Your Responsibilities</h2>
                            <p>When using CopiedCatz, you agree to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate account information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Not use the Service for any illegal or unauthorized purpose</li>
                                <li>Not upload content that infringes on others' intellectual property rights</li>
                                <li>Not attempt to reverse engineer or exploit the Service</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">4. Service Credits</h2>
                            <p>
                                CopiedCatz operates on a credit-based system. Credits are used to generate image variations. Credits may be purchased or earned through the platform. Unused credits do not expire unless otherwise stated.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
                            <p>
                                CopiedCatz is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">6. Modifications to Service</h2>
                            <p>
                                We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will make reasonable efforts to notify users of significant changes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">7. Termination</h2>
                            <p>
                                We may terminate or suspend your account at our discretion if you violate these Terms. Upon termination, your right to use the Service will cease immediately, but your ownership of previously created content remains intact.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">8. Contact</h2>
                            <p>
                                For questions about these Terms, please contact us at{" "}
                                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
                                    our contact page
                                </Link>.
                            </p>
                        </section>
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center">
                        <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                            View our Privacy Policy
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
