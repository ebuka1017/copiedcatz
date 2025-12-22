'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="flex-grow p-6 pt-24 pb-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                            Privacy Policy
                        </h1>
                        <p className="text-slate-400">
                            Last updated: December 2024
                        </p>
                    </div>

                    <div className="space-y-8 text-slate-300">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
                            <p>
                                At CopiedCatz, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">2. Your Content Ownership</h2>
                            <p>
                                <strong className="text-white">Your creations are yours.</strong> We do not claim any ownership rights over the images you upload or the variations you generate. All content you create belongs exclusively to you.
                            </p>
                            <p>
                                You may use, distribute, sell, or modify your creations in any way you choose. We will never use your creations for our own purposes without your explicit consent.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">3. Information We Collect</h2>
                            <p>We collect the following types of information:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-white">Account Information:</strong> Email address and authentication data when you create an account</li>
                                <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our Service, including features used and generation history</li>
                                <li><strong className="text-white">Uploaded Content:</strong> Images you upload for template extraction (processed and stored securely)</li>
                                <li><strong className="text-white">Payment Information:</strong> Processed securely through third-party payment providers; we do not store your payment details</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">4. How We Use Your Information</h2>
                            <p>We use your information to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide and improve our Service</li>
                                <li>Process your image generation requests</li>
                                <li>Manage your account and credits</li>
                                <li>Communicate with you about updates and support</li>
                                <li>Ensure the security and integrity of our platform</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">5. Data Storage and Security</h2>
                            <p>
                                Your data is stored securely using industry-standard encryption and security practices. We use trusted third-party services (such as Supabase) for data storage and authentication.
                            </p>
                            <p>
                                Images you upload and generate are stored securely and are only accessible to you unless you choose to make them public.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">6. Data Sharing</h2>
                            <p>
                                We do not sell your personal data. We may share data with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-white">Service Providers:</strong> Third-party services that help us operate (e.g., image processing APIs, hosting providers)</li>
                                <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">7. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your account and data</li>
                                <li>Export your data</li>
                                <li>Opt out of marketing communications</li>
                            </ul>
                            <p>
                                To exercise these rights, please contact us through our{" "}
                                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
                                    contact page
                                </Link>.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">8. Cookies</h2>
                            <p>
                                We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">9. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our Service or sending you an email.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">10. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy or your data, please contact us at{" "}
                                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
                                    our contact page
                                </Link>.
                            </p>
                        </section>
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center">
                        <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                            View our Terms of Service
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
