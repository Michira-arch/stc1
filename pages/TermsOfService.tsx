import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, AlertCircle, Shield, Ban, Scale, RefreshCw } from 'lucide-react';
import { CarvedButton } from '../components/CarvedButton';
import { useApp } from '../store/AppContext';

interface Props {
    onBack: () => void;
}

export const TermsOfService: React.FC<Props> = ({ onBack }) => {
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-ceramic-base dark:bg-obsidian-base overflow-y-auto pt-safe pb-safe"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-4 flex items-center bg-ceramic-base/90 dark:bg-obsidian-base/90 backdrop-blur-lg">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full mr-4">
                    <ArrowLeft size={20} />
                </CarvedButton>
                <h1 className="text-xl font-bold">Terms of Service</h1>
            </div>

            {/* Content */}
            <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">

                {/* Last Updated */}
                <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Last Updated: February 10, 2026
                    </p>
                </div>

                {/* Acceptance */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <FileText size={24} />
                        <h2 className="font-bold text-lg">Acceptance of Terms</h2>
                    </div>
                    <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                        <p>
                            Welcome to Student Center. By accessing or using our application, website, or services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
                        </p>
                        <p>
                            These Terms constitute a legally binding agreement between you and Student Center. We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
                        </p>
                    </div>
                </section>

                {/* Eligibility */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <Shield size={24} />
                        <h2 className="font-bold text-lg">Eligibility</h2>
                    </div>
                    <div className="space-y-3 text-slate-700 dark:text-slate-300">
                        <p>To use our Service, you must:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Be at least 13 years of age</li>
                            <li>Have the legal capacity to enter into a binding agreement</li>
                            <li>Not be prohibited from using the Service under applicable laws</li>
                            <li>Provide accurate and complete registration information</li>
                        </ul>
                        <p className="mt-3">
                            By creating an account, you represent and warrant that you meet these eligibility requirements.
                        </p>
                    </div>
                </section>

                {/* User Accounts */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <FileText size={24} />
                        <h2 className="font-bold text-lg">User Accounts</h2>
                    </div>
                    <div className="space-y-3 text-slate-700 dark:text-slate-300">
                        <div>
                            <h3 className="font-bold mb-2">Account Security</h3>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                <li>You are responsible for all activities that occur under your account</li>
                                <li>You must notify us immediately of any unauthorized access or security breach</li>
                                <li>We are not liable for any loss or damage arising from your failure to protect your account</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Account Information</h3>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>You must provide accurate, current, and complete information</li>
                                <li>You must update your information to keep it accurate and current</li>
                                <li>We reserve the right to suspend or terminate accounts with false or misleading information</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* User Content & Conduct */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <FileText size={24} />
                        <h2 className="font-bold text-lg">User Content & Conduct</h2>
                    </div>
                    <div className="space-y-3 text-slate-700 dark:text-slate-300">
                        <div>
                            <h3 className="font-bold mb-2">Your Content</h3>
                            <p>
                                You retain ownership of content you create ("User Content"). By posting, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the Service.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-red-600 dark:text-red-400">Zero Tolerance for Objectionable Content</h3>
                            <p>
                                We maintain a <strong>ZERO TOLERANCE</strong> policy for objectionable content. You agree NOT to post content that:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                                <li>Is defamatory, obscene, pornographic, or offensive</li>
                                <li>Promotes violence, discrimination, racism, or hatred</li>
                                <li>Harasses, bullies, or threatens any individual or group</li>
                                <li>Involves illegal activities or goods</li>
                                <li>Infringes on any third party's intellectual property rights</li>
                            </ul>
                            <p className="mt-2 font-bold">
                                Violation of these standards will result in immediate account termination and content removal without prior notice.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Copyright Policy (DMCA) */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <Shield size={24} />
                        <h2 className="font-bold text-lg">Copyright Policy (DMCA)</h2>
                    </div>
                    <div className="space-y-3 text-slate-700 dark:text-slate-300">
                        <p>
                            We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on the Service infringes on the copyright or other intellectual property rights of any person or entity.
                        </p>
                        <p>
                            If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement, please submit your claim via email to <a href="mailto:dispatchatstc@gmail.com" className="font-bold underline">dispatchatstc@gmail.com</a>, with the subject line: "Copyright Infringement".
                        </p>
                    </div>
                </section>

                {/* Indemnification */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <Scale size={24} />
                        <h2 className="font-bold text-lg">Indemnification</h2>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        You agree to defend, indemnify, and hold harmless Student Center and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms, or c) Content posted on the Service.
                    </p>
                </section>

                {/* Governing Law */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <Scale size={24} />
                        <h2 className="font-bold text-lg">Governing Law</h2>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of Kenya</strong>, without regard to its conflict of law provisions.
                    </p>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">
                        Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                    </p>
                </section>

                {/* Contact */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <FileText size={24} />
                        <h2 className="font-bold text-lg">Contact Information</h2>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 space-y-2">
                        <p>If you have questions about these Terms, please contact us:</p>
                        <ul className="space-y-1 ml-2">
                            <li><strong>Email:</strong> dispatchatstc@gmail.com</li>
                            <li><strong>In-App:</strong> Use the feedback feature in Settings</li>
                        </ul>
                    </div>
                </section>

                {/* Severability */}
                <section className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                        <FileText size={24} />
                        <h2 className="font-bold text-lg">Severability</h2>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                    </p>
                </section>

            </div>
        </motion.div>
    );
};
