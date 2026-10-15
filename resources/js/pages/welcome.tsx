import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ExternalLink, Factory, FileCheck2, Globe, ShieldCheck } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Supplier Qualification Portal - Ethiopian Engineering Corporation (EEC)" />
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] dark:text-slate-100">
                <header className="mb-6 flex w-full max-w-[335px] items-center justify-between text-sm lg:max-w-4xl">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/eec-logo.jpg"
                            alt="EEC Logo"
                            className="h-8 w-auto rounded-md object-contain bg-white p-0.5"
                        />
                        <span className="hidden font-bold tracking-tight text-[#005577] sm:inline dark:text-[#00ADC5]">
                            EEC Portal
                        </span>
                    </div>

                    <nav className="flex items-center gap-3">
                        <a
                            href="https://eec.com.et"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-[#005577] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-[#00ADC5]"
                        >
                            <Globe className="size-3.5" />
                            <span>Company Website</span>
                            <ExternalLink className="size-3 opacity-60" />
                        </a>

                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-lg bg-[#005577] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#004460] dark:bg-[#00ADC5] dark:text-slate-950 dark:hover:bg-[#0099b0]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-block rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                                Staff Login
                            </Link>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow">
                    <main className="flex w-full max-w-[335px] flex-col-reverse shadow-xl rounded-2xl overflow-hidden border border-slate-200/80 bg-white lg:max-w-4xl lg:flex-row dark:border-slate-800 dark:bg-slate-900">
                        {/* Left Column: Portal Information */}
                        <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#00ADC5]/15 px-3 py-1 text-xs font-bold text-[#005577] dark:text-[#00ADC5]">
                                    <ShieldCheck className="size-3.5" />
                                    Official Procurement Portal
                                </div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                    Supplier Qualification Platform
                                </h1>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    Welcome to the Ethiopian Engineering Corporation (EEC) vendor evaluation portal. Prospective manufacturers, contractors, and suppliers can complete the pre-qualification survey and submit verification documents.
                                </p>

                                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex items-center gap-2.5">
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#00ADC5]/15 text-[#005577] dark:text-[#00ADC5]">
                                            <Factory className="size-3.5" />
                                        </div>
                                        <span>Manufacturing capacity & technical profile verification</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#00ADC5]/15 text-[#005577] dark:text-[#00ADC5]">
                                            <FileCheck2 className="size-3.5" />
                                        </div>
                                        <span>ISO standards, compliance audits & test report uploads</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#00ADC5]/15 text-[#005577] dark:text-[#00ADC5]">
                                            <CheckCircle2 className="size-3.5" />
                                        </div>
                                        <span>Regional delivery experience & commercial assessment</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <a
                                    href="/survey"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#005577] to-[#00ADC5] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#00ADC5]/25 transition hover:opacity-95"
                                >
                                    <span>Start Qualification Survey</span>
                                    <ArrowRight className="size-4" />
                                </a>

                                <a
                                    href="https://eec.com.et"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#005577] dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#00ADC5]"
                                >
                                    <Globe className="size-4" />
                                    <span>Company Website</span>
                                    <ExternalLink className="size-3.5 opacity-60" />
                                </a>
                            </div>
                        </div>

                        {/* Right Column: EEC Branding Panel */}
                        <div className="relative aspect-auto w-full shrink-0 bg-gradient-to-br from-[#005577]/10 via-slate-50 to-[#00ADC5]/15 p-8 flex flex-col items-center justify-center text-center lg:w-[380px] dark:from-slate-900 dark:via-slate-950 dark:to-[#005577]/30 border-b lg:border-b-0 lg:border-l border-slate-200/80 dark:border-slate-800">
                            <div className="relative z-10 flex flex-col items-center justify-center gap-5">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-[#00ADC5]/10 ring-4 ring-[#00ADC5]/10">
                                    <img
                                        src="/images/eec-logo.jpg"
                                        alt="Ethiopian Engineering Corporation (EEC) Logo"
                                        className="h-16 w-auto max-w-[240px] object-contain"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                        Ethiopian Engineering Corporation
                                    </h2>
                                    <p className="max-w-[260px] text-xs text-slate-500 dark:text-slate-400">
                                        Procurement & Supply Chain Management Division
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-left text-xs text-slate-600 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                                    <div className="font-bold text-[#005577] dark:text-[#00ADC5]">Notice to Vendors:</div>
                                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                        Ensure business license, QC certs, and factory profile are prepared before beginning.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Ethiopian Engineering Corporation (EEC). All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
