import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertCircle,
    Building2,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Factory,
    FileCheck2,
    Globe2,
    ExternalLink,
    Layers,
    Loader2,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import CompanyLogo from '@/components/company-logo';
import { COUNTRIES } from '@/lib/countries';
import FieldError from '@/components/survey/field-error';
import QuestionField from '@/components/survey/question-field';
import { show as surveyRoute, store as surveyStore } from '@/routes/survey';
import { cn } from '@/lib/utils';
import type {
    SurveyArea,
    SurveyMeta,
    SurveyQuestion,
    SurveyUploads,
} from '@/types';

type FormState = {
    company_name: string;
    contact_person: string;
    job_title: string;
    email: string;
    country: string;
    website: string;
    answers: Record<string, string>;
    attachments: Record<string, File[]>;
};

type Props = {
    survey: SurveyMeta;
    areas: SurveyArea[];
    uploads: SurveyUploads;
};

type TabDefinition = {
    id: string;
    title: string;
    shortTitle: string;
    subtitle: string;
    icon: LucideIcon;
    areaSlugs: string[];
};

// 5 combined categories (Requirement 6)
const TABS: TabDefinition[] = [
    {
        id: 'company',
        title: 'Company Details & Profile',
        shortTitle: 'Company Profile',
        subtitle: 'General information regarding your business entity and legal registration.',
        icon: Building2,
        areaSlugs: ['company'],
    },
    {
        id: 'manufacturing',
        title: 'Manufacturing Capacity & Lead Times',
        shortTitle: 'Production & Capacity',
        subtitle: 'Detail your production facility, monthly volume capabilities, and lead times.',
        icon: Factory,
        areaSlugs: ['manufacturing-capacity'],
    },
    {
        id: 'quality-standards',
        title: 'Quality Control & Certifications',
        shortTitle: 'Quality & Standards',
        subtitle: 'Quality assurance methodologies, inspection willingness, and international standards conformity.',
        icon: ShieldCheck,
        areaSlugs: ['quality-control', 'certifications-standards'],
    },
    {
        id: 'experience-warranty',
        title: 'Regional Experience & Warranty',
        shortTitle: 'Experience & Warranty',
        subtitle: 'Track record in Ethiopia / East Africa and after-sales technical warranty coverage.',
        icon: Globe2,
        areaSlugs: ['project-references', 'after-sales-warranty'],
    },
    {
        id: 'commercial-logistics',
        title: 'Commercial Terms & Shipping Logistics',
        shortTitle: 'Commercial & Logistics',
        subtitle: 'Djibouti shipping experience, minimum order quantities (MOQ), and accepted payment terms.',
        icon: DollarSign,
        areaSlugs: ['export-logistics', 'commercial-terms'],
    },
];

export default function Survey({ survey, areas, uploads }: Props) {
    const { flash } = usePage();
    const [activeStep, setActiveStep] = useState(0);
    const [touched, setTouched] = useState<Record<string, true>>({});
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const initialValues: FormState = {
        company_name: '',
        contact_person: '',
        job_title: '',
        email: '',
        country: '',
        website: '',
        answers: {},
        attachments: {},
    };

    for (const area of areas) {
        for (const question of area.questions) {
            initialValues.answers[question.id] = '';
            initialValues.attachments[question.id] = [];
        }
    }

    const form = useForm<FormState>(initialValues);
    const errors = form.errors as Record<string, string | undefined>;

    const [initialLoading, setInitialLoading] = useState(true);
    const [fadeLoading, setFadeLoading] = useState(false);
    const [loadProgress, setLoadProgress] = useState(25);

    // Initial splash loading screen timer with progress animation
    useEffect(() => {
        const t1 = setTimeout(() => setLoadProgress(60), 200);
        const t2 = setTimeout(() => setLoadProgress(90), 500);
        const t3 = setTimeout(() => setLoadProgress(100), 800);
        const t4 = setTimeout(() => setFadeLoading(true), 1100);
        const t5 = setTimeout(() => setInitialLoading(false), 1400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, []);

    // Restore draft from localStorage on mount
    useEffect(() => {
        try {
            const rawDraft = localStorage.getItem('supplier_survey_draft_v1');
            if (rawDraft) {
                const parsed = JSON.parse(rawDraft);
                if (parsed.company_name) form.setData('company_name', parsed.company_name);
                if (parsed.contact_person) form.setData('contact_person', parsed.contact_person);
                if (parsed.job_title) form.setData('job_title', parsed.job_title);
                if (parsed.email) form.setData('email', parsed.email);
                if (parsed.country) form.setData('country', parsed.country);
                if (parsed.website) form.setData('website', parsed.website);
                if (parsed.answers) {
                    form.setData('answers', {
                        ...form.data.answers,
                        ...parsed.answers,
                    });
                }
                setLastSaved('Restored draft');
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    // Auto-save draft changes to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const draft = {
                    company_name: form.data.company_name,
                    contact_person: form.data.contact_person,
                    job_title: form.data.job_title,
                    email: form.data.email,
                    country: form.data.country,
                    website: form.data.website,
                    answers: form.data.answers,
                };
                localStorage.setItem('supplier_survey_draft_v1', JSON.stringify(draft));
                const now = new Date();
                setLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
            } catch {
                // Ignore storage quota
            }
        }, 750);

        return () => clearTimeout(timer);
    }, [form.data.company_name, form.data.contact_person, form.data.job_title, form.data.email, form.data.country, form.data.website, form.data.answers]);

    /* ------------------------------------------------------------------ */
    /* Validation                                                         */
    /* ------------------------------------------------------------------ */

    function validate(): Record<string, string> {
        const found: Record<string, string> = {};
        const data = form.data;

        if (!data.company_name.trim()) {
            found.company_name = 'Company legal name is required';
        }

        if (!data.contact_person.trim()) {
            found.contact_person = 'Contact person is required';
        }

        if (!data.email.trim()) {
            found.email = 'Company email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            found.email = 'Please enter a valid email address';
        }

        if (!data.country.trim()) {
            found.country = 'Country of origin is required';
        }

        for (const area of areas) {
            for (const question of area.questions) {
                const key = `answers.${question.id}`;
                const answer = (data.answers[question.id] ?? '').trim();

                if (!answer) {
                    found[key] = 'An answer is required for this question';
                } else if (
                    question.answer_type === 'radio' &&
                    !(question.answer_options ?? []).includes(answer)
                ) {
                    found[key] = 'Please select one of the options';
                } else if (
                    question.answer_type === 'number' &&
                    (!/^\d+$/.test(answer) ||
                        Number(answer) < 0 ||
                        Number(answer) > 150)
                ) {
                    found[key] =
                        'Please enter a whole number of years between 0 and 150';
                }

                if (
                    question.attachment_requirement === 'required' &&
                    (data.attachments[question.id] ?? []).length === 0
                ) {
                    found[`attachments.${question.id}`] =
                        'This document is required';
                }
            }
        }

        return found;
    }

    const clientErrors = validate();

    function visibleError(key: string): string | undefined {
        return errors[key] ?? (touched[key] ? clientErrors[key] : undefined);
    }

    function isFieldValid(key: string): boolean {
        return Boolean(touched[key]) && !clientErrors[key] && !errors[key];
    }

    /* ---------------------- */
    /* Tab helpers (5 steps)  */
    /* ---------------------- */

    function questionKeys(question: SurveyQuestion): string[] {
        return [`answers.${question.id}`, `attachments.${question.id}`];
    }

    function keysForTab(tabIndex: number): string[] {
        const tab = TABS[tabIndex];
        if (!tab) return [];

        const respondentKeys =
            tabIndex === 0
                ? [
                      'company_name',
                      'contact_person',
                      'email',
                      'country',
                      'website',
                  ]
                : [];

        const tabAreas = areas.filter((area) => tab.areaSlugs.includes(area.slug));
        const questionKeysList = tabAreas.flatMap((area) =>
            area.questions.flatMap((q) => questionKeys(q)),
        );

        return [...respondentKeys, ...questionKeysList];
    }

    function tabForKey(key: string): number {
        if (
            [
                'company_name',
                'contact_person',
                'email',
                'country',
                'website',
                'job_title',
            ].includes(key)
        ) {
            return 0;
        }

        const match = key.match(/^(?:answers|attachments)\.(\d+)$/);
        if (!match) return 0;

        const id = Number(match[1]);
        const area = areas.find((a) => a.questions.some((q) => q.id === id));
        if (!area) return 0;

        const tabIndex = TABS.findIndex((t) => t.areaSlugs.includes(area.slug));
        return tabIndex === -1 ? 0 : tabIndex;
    }

    function isTabValid(tabIndex: number): boolean {
        return keysForTab(tabIndex).every(
            (key) => !clientErrors[key] && !errors[key],
        );
    }

    function touch(keys: string[]): void {
        setTouched((previous) => {
            const next = { ...previous };

            for (const key of keys) {
                next[key] = true;
            }

            return next;
        });
    }

    function scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleNext(): void {
        const keys = keysForTab(activeStep);
        touch(keys);

        if (keys.some((key) => clientErrors[key] || errors[key])) return;

        setActiveStep((previous) => Math.min(previous + 1, TABS.length - 1));
        scrollToTop();
    }

    function handlePrevious(): void {
        setActiveStep((previous) => Math.max(previous - 1, 0));
        scrollToTop();
    }

    function handleTabClick(index: number): void {
        setActiveStep(index);
        setMobileDrawerOpen(false);
        scrollToTop();
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const allKeys = TABS.flatMap((_, index) => keysForTab(index));
        touch(allKeys);

        const firstInvalid = allKeys.find((key) => clientErrors[key]);

        if (firstInvalid) {
            setActiveStep(tabForKey(firstInvalid));
            scrollToTop();

            return;
        }

        form.post(surveyStore.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                try {
                    localStorage.removeItem('supplier_survey_draft_v1');
                } catch {
                    // Ignore
                }
            },
            onError: (serverErrors) => {
                const firstKey = Object.keys(serverErrors)[0];

                if (firstKey) {
                    setActiveStep(tabForKey(firstKey));
                    scrollToTop();
                }
            },
        });
    }

    /* ---------------------- */
    /* Progress               */
    /* ---------------------- */

    function progress(): number {
        const required: string[] = [
            'company_name',
            'contact_person',
            'email',
            'country',
        ];

        for (const area of areas) {
            for (const question of area.questions) {
                required.push(`answers.${question.id}`);

                if (question.attachment_requirement === 'required') {
                    required.push(`attachments.${question.id}`);
                }
            }
        }

        const filled = required.filter((key) => {
            if (key.startsWith('answers.')) {
                return (form.data.answers[key.slice(8)] ?? '').trim() !== '';
            }

            if (key.startsWith('attachments.')) {
                return (form.data.attachments[key.slice(12)] ?? []).length > 0;
            }

            return Boolean(
                form.data[key as keyof FormState] as string | undefined,
            );
        }).length;

        return Math.round((filled / required.length) * 100);
    }

    /* ---------------------- */
    /* Splash Screen          */
    /* ---------------------- */

    if (initialLoading) {
        return (
            <div
                className={cn(
                    'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/95 text-slate-900 backdrop-blur-xs transition-opacity duration-300 dark:bg-slate-950 dark:text-white',
                    fadeLoading ? 'opacity-0 pointer-events-none' : 'opacity-100',
                )}
            >
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute size-32 animate-ping rounded-full bg-[#00ADC5]/15 duration-1000" />
                    <div className="relative flex h-24 min-w-[200px] items-center justify-center rounded-3xl border border-slate-200/80 bg-white px-6 py-3 shadow-xl shadow-[#00ADC5]/10 ring-4 ring-[#00ADC5]/20 dark:border-slate-800 dark:ring-[#00ADC5]/50">
                        <CompanyLogo imageClassName="h-14 w-auto max-w-[220px]" />
                    </div>
                </div>

                <div className="text-center">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#00ADC5]/15 px-3 py-1 text-xs font-bold text-[#005577] uppercase tracking-wider dark:text-[#00ADC5]">
                        Official Procurement Portal
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-[#005577] sm:text-4xl dark:text-white">
                        EEC
                    </h1>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 sm:text-sm dark:text-slate-400">
                        Supplier Qualification Survey
                    </p>
                </div>

                <div className="mt-8 flex w-64 flex-col items-center gap-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/90 p-0.5 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#005577] to-[#00ADC5] transition-all duration-300 ease-out"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <div className="flex w-full items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>Initializing secure workspace…</span>
                        <span className="font-bold text-[#005577] dark:text-[#00ADC5]">{loadProgress}%</span>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------------- */
    /* Success screen         */
    /* ---------------------- */

    if (flash.submitted) {
        return (
            <>
                <Head title={survey.title} />
                <WizardShell>
                    <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-[#00ADC5]/10 text-[#00ADC5] shadow-inner">
                            <CheckCircle2 className="size-12 stroke-[2.2]" />
                        </div>

                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00ADC5]/15 px-3 py-1 text-xs font-bold text-[#005577] dark:text-[#00ADC5]">
                                <Sparkles className="size-3.5" /> EEC Submission Received
                            </span>
                            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
                                Survey Submitted!
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {survey.thanks_message}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2 font-bold text-[#005577] dark:text-[#00ADC5]">
                                <FileCheck2 className="size-4" />
                                EEC Vendor Verification
                            </div>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                                Your supplier qualification response and supporting documents have been registered. The EEC procurement committee will review your submission.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex justify-center">
                                <a
                                    href="https://eec.milkotech.et/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-[#005577] active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-[#00ADC5]"
                                >
                                    <Globe2 className="size-4" />
                                    <span>Visit Company Website</span>
                                    <ExternalLink className="size-3.5 opacity-60" />
                                </a>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.visit(surveyRoute.url())}
                                className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                Submit another response / Return to form
                            </button>
                        </div>
                    </div>
                </WizardShell>
            </>
        );
    }

    const activeTab = TABS[activeStep] ?? TABS[0];
    const ActiveIcon = activeTab.icon;
    const currentAreas = areas.filter((area) => activeTab.areaSlugs.includes(area.slug));

    return (
        <>
            <Head title={survey.title} />

            <WizardShell activeStep={activeStep} totalSteps={TABS.length} progressPct={progress()}>
                {/* Responsive Split Layout */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start pb-24 sm:pb-8">
                    
                    {/* LEFT SIDEBAR (Desktop 5-Step Stepper & Progress Card) */}
                    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3.5 space-y-5 sticky top-20">
                        
                        {/* Progress Card */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Overall Progress
                                </span>
                                <span className="text-sm font-extrabold text-[#005577] dark:text-[#00ADC5]">
                                    {progress()}%
                                </span>
                            </div>

                            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#005577] to-[#00ADC5] transition-all duration-500 ease-out"
                                    style={{ width: `${progress()}%` }}
                                />
                            </div>

                            <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="size-3.5 text-slate-400" />
                                    ~4 min remaining
                                </span>
                                {lastSaved && (
                                    <span className="flex items-center gap-1 text-[#005577] dark:text-[#00ADC5] font-semibold">
                                        <Check className="size-3 stroke-[2.5]" /> Draft Saved
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Interactive Vertical Stepper (5 Tabs) */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                Survey Tabs (5 Steps)
                            </div>

                            <nav className="space-y-1.5">
                                {TABS.map((tab, index) => {
                                    const Icon = tab.icon;
                                    const isActive = activeStep === index;
                                    const valid = isTabValid(index);
                                    const hasErrors = activeStep > index && !valid;

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => handleTabClick(index)}
                                            className={cn(
                                                'group flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-all',
                                                isActive
                                                    ? 'bg-gradient-to-r from-[#005577] to-[#00ADC5] text-white font-bold shadow-md shadow-[#00ADC5]/25'
                                                    : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80',
                                            )}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <div
                                                    className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                                                        isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-slate-100 text-[#005577] dark:bg-slate-800 dark:text-[#00ADC5]',
                                                    )}
                                                >
                                                    <Icon className="size-4 stroke-[2.2]" />
                                                </div>
                                                <div className="truncate">
                                                    <div className="truncate text-xs font-semibold tracking-tight">
                                                        {tab.shortTitle}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'text-[10px] leading-tight opacity-80',
                                                            isActive
                                                                ? 'text-white/90'
                                                                : 'text-slate-400',
                                                        )}
                                                    >
                                                        Tab {index + 1} of {TABS.length}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Pill */}
                                            {valid ? (
                                                <span
                                                    className={cn(
                                                        'flex size-5 shrink-0 items-center justify-center rounded-full',
                                                        isActive
                                                            ? 'bg-white text-[#005577]'
                                                            : 'bg-[#00ADC5] text-white',
                                                    )}
                                                    title="Tab complete"
                                                >
                                                    <Check className="size-3 stroke-[3]" />
                                                </span>
                                            ) : hasErrors ? (
                                                <span
                                                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
                                                    title="Incomplete required fields"
                                                >
                                                    <AlertCircle className="size-3 stroke-[2.5]" />
                                                </span>
                                            ) : (
                                                <span
                                                    className={cn(
                                                        'text-[11px] font-bold opacity-60',
                                                        isActive ? 'text-white' : 'text-slate-400',
                                                    )}
                                                >
                                                    {index + 1}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* MAIN RIGHT CONTAINER */}
                    <div className="lg:col-span-8 xl:col-span-8.5 space-y-4">
                        
                        {/* Mobile Stepper Pill & Drawer Trigger */}
                        <div className="lg:hidden">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setMobileDrawerOpen(true)}
                                        className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        <Layers className="size-3.5 text-[#00ADC5]" />
                                        Tab {activeStep + 1} of {TABS.length}: {activeTab.shortTitle}
                                    </button>
                                    <span className="text-xs font-extrabold text-[#005577] dark:text-[#00ADC5]">
                                        {progress()}% Completed
                                    </span>
                                </div>
                                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#005577] to-[#00ADC5] transition-all duration-300"
                                        style={{ width: `${progress()}%` }}
                                    />
                                </div>
                            </div>

                            {/* Mobile Horizontal 5-Step Tab Pills */}
                            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                                {TABS.map((tab, index) => {
                                    const isActive = activeStep === index;
                                    const valid = isTabValid(index);

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => handleTabClick(index)}
                                            className={cn(
                                                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all select-none',
                                                isActive
                                                    ? 'bg-gradient-to-r from-[#005577] to-[#00ADC5] text-white shadow-xs'
                                                    : 'bg-white border border-slate-200 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
                                            )}
                                        >
                                            {tab.shortTitle}
                                            {valid && <Check className="size-3 stroke-[3]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Survey Form Card */}
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                        >
                            <section className="space-y-6">
                                {/* Tab Header */}
                                <div className="flex items-start justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#00ADC5]/15 text-[#005577] ring-4 ring-[#00ADC5]/10 dark:text-[#00ADC5]">
                                            <ActiveIcon className="size-5 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#005577] dark:text-[#00ADC5]">
                                                Tab {activeStep + 1} of {TABS.length}
                                            </span>
                                            <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                                                {activeTab.title}
                                            </h2>
                                            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                                                {activeTab.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 0 Company Details */}
                                {activeStep === 0 && (
                                    <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4.5 sm:p-6 dark:border-slate-800/80 dark:bg-slate-800/30">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            <Building2 className="size-4 text-[#00ADC5]" />
                                            Business Registration Details
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <TextField
                                                id="company_name"
                                                label="Company Legal Name"
                                                required
                                                placeholder="e.g. Acme Manufacturing Ltd."
                                                value={form.data.company_name}
                                                isValid={isFieldValid('company_name')}
                                                onChange={(value) =>
                                                    form.setData('company_name', value)
                                                }
                                                onBlur={() => touch(['company_name'])}
                                                error={visibleError('company_name')}
                                                disabled={form.processing}
                                            />
                                            <CountrySelect
                                                value={form.data.country}
                                                isValid={isFieldValid('country')}
                                                onChange={(value) =>
                                                    form.setData('country', value)
                                                }
                                                onBlur={() => touch(['country'])}
                                                error={visibleError('country')}
                                                disabled={form.processing}
                                            />
                                            <TextField
                                                id="contact_person"
                                                label="Contact Person Name"
                                                required
                                                placeholder="Sales Manager / Representative"
                                                autoComplete="name"
                                                value={form.data.contact_person}
                                                isValid={isFieldValid('contact_person')}
                                                onChange={(value) =>
                                                    form.setData('contact_person', value)
                                                }
                                                onBlur={() => touch(['contact_person'])}
                                                error={visibleError('contact_person')}
                                                disabled={form.processing}
                                            />
                                            <TextField
                                                id="email"
                                                label="Official Email Address"
                                                type="email"
                                                required
                                                placeholder="sales@company.com"
                                                autoComplete="email"
                                                value={form.data.email}
                                                isValid={isFieldValid('email')}
                                                onChange={(value) =>
                                                    form.setData('email', value)
                                                }
                                                onBlur={() => touch(['email'])}
                                                error={visibleError('email')}
                                                disabled={form.processing}
                                            />
                                            <TextField
                                                id="job_title"
                                                label="Job Title"
                                                placeholder="e.g. Export Director"
                                                value={form.data.job_title}
                                                isValid={Boolean(form.data.job_title.trim())}
                                                onChange={(value) =>
                                                    form.setData('job_title', value)
                                                }
                                                onBlur={() => touch(['job_title'])}
                                                error={visibleError('job_title')}
                                                disabled={form.processing}
                                            />
                                            <TextField
                                                id="website"
                                                label="Company Website"
                                                placeholder="example.com"
                                                value={form.data.website}
                                                isValid={isFieldValid('website')}
                                                onChange={(value) =>
                                                    form.setData('website', value)
                                                }
                                                onBlur={() => touch(['website'])}
                                                error={visibleError('website')}
                                                disabled={form.processing}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Areas & Questions within this Tab */}
                                <div className="space-y-6">
                                    {currentAreas.map((area) => {
                                        const areaOffset = areas
                                            .slice(0, areas.findIndex((a) => a.id === area.id))
                                            .reduce((tot, a) => tot + a.questions.length, 0);

                                        return (
                                            <div key={area.id} className="space-y-4">
                                                {currentAreas.length > 1 && (
                                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-[#005577] dark:border-slate-800 dark:text-[#00ADC5]">
                                                        <span className="size-2 rounded-full bg-[#00ADC5]" />
                                                        {area.name}
                                                    </div>
                                                )}

                                                {area.questions.map((question, index) => {
                                                    const key = String(question.id);

                                                    return (
                                                        <QuestionField
                                                            key={question.id}
                                                            number={areaOffset + index + 1}
                                                            question={question}
                                                            answer={form.data.answers[key] ?? ''}
                                                            files={form.data.attachments[key] ?? []}
                                                            uploads={uploads}
                                                            answerError={visibleError(
                                                                `answers.${question.id}`,
                                                            )}
                                                            filesError={visibleError(
                                                                `attachments.${question.id}`,
                                                            )}
                                                            onAnswer={(value) =>
                                                                form.setData('answers', {
                                                                    ...form.data.answers,
                                                                    [question.id]: value,
                                                                })
                                                            }
                                                            onFiles={(files) =>
                                                                form.setData('attachments', {
                                                                    ...form.data.attachments,
                                                                    [question.id]: files,
                                                                })
                                                            }
                                                            onBlur={(field) => touch([field])}
                                                            disabled={form.processing}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Desktop Navigation Row (Hidden on mobile) */}
                            <div className="mt-8 hidden items-center justify-between border-t border-slate-100 pt-6 sm:flex dark:border-slate-800">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Tab {activeStep + 1} of {TABS.length}:{' '}
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {activeTab.title}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={activeStep === 0}
                                        onClick={handlePrevious}
                                        className={cn(
                                            'inline-flex h-11 items-center gap-1.5 rounded-xl border px-5 text-sm font-semibold transition-all',
                                            activeStep === 0
                                                ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700'
                                                : 'border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
                                        )}
                                    >
                                        <ChevronLeft className="size-4" /> Previous Tab
                                    </button>

                                    {activeStep < TABS.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#005577] to-[#00ADC5] px-6 text-sm font-semibold text-white shadow-md shadow-[#00ADC5]/25 transition-all hover:opacity-95 active:scale-[0.98]"
                                        >
                                            Next Tab <ChevronRight className="size-4" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            data-test="submit-survey-button"
                                            className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#005577] to-[#00ADC5] px-7 text-sm font-semibold text-white shadow-md shadow-[#00ADC5]/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
                                        >
                                            {form.processing ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="size-4" />
                                            )}
                                            Submit Qualification
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Uploading progress bar */}
                            {form.progress && (
                                <div className="mt-4">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#005577] to-[#00ADC5] transition-[width]"
                                            style={{
                                                width: `${form.progress.percentage}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Uploading documents… {form.progress.percentage}%
                                    </p>
                                </div>
                            )}

                            {/* MOBILE FIXED BOTTOM ACTION DOCK (Thumb Zone) */}
                            <div className="fixed inset-x-0 bottom-0 z-40 block border-t border-slate-200/90 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md sm:hidden dark:border-slate-800 dark:bg-slate-900/95">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={activeStep === 0}
                                        onClick={handlePrevious}
                                        className={cn(
                                            'flex h-12 w-14 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-all active:scale-[0.97]',
                                            activeStep === 0
                                                ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700'
                                                : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200',
                                        )}
                                        aria-label="Previous tab"
                                    >
                                        <ChevronLeft className="size-5" />
                                    </button>

                                    {activeStep < TABS.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#005577] to-[#00ADC5] px-4 text-base font-bold text-white shadow-lg shadow-[#00ADC5]/25 transition-all active:scale-[0.98]"
                                        >
                                            Next Tab ({activeStep + 1}/{TABS.length})
                                            <ChevronRight className="size-5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            data-test="submit-survey-button"
                                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#005577] to-[#00ADC5] px-4 text-base font-bold text-white shadow-lg shadow-[#00ADC5]/25 transition-all active:scale-[0.98] disabled:opacity-60"
                                        >
                                            {form.processing ? (
                                                <Loader2 className="size-5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="size-5" />
                                            )}
                                            Submit Qualification
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Mobile Section Drawer Modal */}
                {mobileDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs lg:hidden">
                        <div
                            className="fixed inset-0"
                            onClick={() => setMobileDrawerOpen(false)}
                        />
                        <div className="relative max-h-[80vh] w-full overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Survey Tabs (5 Steps)
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                {TABS.map((tab, index) => {
                                    const Icon = tab.icon;
                                    const isActive = activeStep === index;
                                    const valid = isTabValid(index);

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => handleTabClick(index)}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-2xl p-3.5 text-left transition-all',
                                                isActive
                                                    ? 'bg-gradient-to-r from-[#005577] to-[#00ADC5] text-white font-bold shadow-md shadow-[#00ADC5]/20'
                                                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-200',
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="size-5" />
                                                <span className="text-sm">{tab.title}</span>
                                            </div>
                                            {valid && (
                                                <span
                                                    className={cn(
                                                        'rounded-full p-1 text-white',
                                                        isActive ? 'bg-white/20' : 'bg-[#00ADC5]',
                                                    )}
                                                >
                                                    <Check className="size-3.5 stroke-[3]" />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </WizardShell>
        </>
    );
}

function TextField({
    id,
    label,
    value,
    onChange,
    onBlur,
    error,
    isValid = false,
    required = false,
    type = 'text',
    placeholder,
    autoComplete,
    disabled = false,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    isValid?: boolean;
    required?: boolean;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label
                    htmlFor={id}
                    className="block text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
                >
                    {label}{' '}
                    {required && (
                        <span className="text-red-500" aria-hidden>
                            *
                        </span>
                    )}
                </label>
                {isValid && !error && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005577] dark:text-[#00ADC5]">
                        <Check className="size-3 stroke-[3]" /> Valid
                    </span>
                )}
            </div>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    className={cn(
                        'w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm transition-all outline-none',
                        'text-slate-800 placeholder:text-slate-400 dark:text-slate-100',
                        error
                            ? 'border-red-500 bg-red-50/20 focus:ring-3 focus:ring-red-400/20 dark:bg-red-950/20'
                            : 'border-slate-300 bg-white focus:border-[#00ADC5] focus:ring-3 focus:ring-[#00ADC5]/20 dark:border-slate-700 dark:bg-slate-800/90',
                    )}
                    aria-invalid={error ? true : undefined}
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}

function CountrySelect({
    value,
    onChange,
    onBlur,
    error,
    isValid = false,
    disabled = false,
}: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    isValid?: boolean;
    disabled?: boolean;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
                >
                    Country / Region of Origin{' '}
                    <span className="text-red-500" aria-hidden>
                        *
                    </span>
                </label>
                {isValid && !error && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005577] dark:text-[#00ADC5]">
                        <Check className="size-3 stroke-[3]" /> Selected
                    </span>
                )}
            </div>
            <div className="relative">
                <select
                    id="country"
                    name="country"
                    value={value}
                    required
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    className={cn(
                        'w-full appearance-auto rounded-xl border px-3.5 py-2.5 text-base sm:text-sm transition-all outline-none cursor-pointer',
                        'text-slate-800 dark:text-slate-100',
                        error
                            ? 'border-red-500 bg-red-50/20 focus:ring-3 focus:ring-red-400/20 dark:bg-red-950/20'
                            : 'border-slate-300 bg-white focus:border-[#00ADC5] focus:ring-3 focus:ring-[#00ADC5]/20 dark:border-slate-700 dark:bg-slate-800/90',
                    )}
                    aria-invalid={error ? true : undefined}
                >
                    <option value="">Select country of manufacture…</option>
                    {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>
            <FieldError message={error} />
        </div>
    );
}

function WizardShell({
    children,
    activeStep,
    totalSteps,
    progressPct,
}: {
    children: ReactNode;
    activeStep?: number;
    totalSteps?: number;
    progressPct?: number;
}) {
    return (
        <div className="min-h-dvh bg-slate-50/80 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            {/* Header Navbar */}
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs dark:border-slate-800 dark:bg-slate-900/95">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    
                    {/* EEC Brand Header */}
                    <div className="flex items-center gap-3">
                        <CompanyLogo imageClassName="h-10 w-auto object-contain rounded-md" />
                        <div className="border-l border-slate-200 pl-3 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black text-[#005577] leading-tight tracking-tight sm:text-lg dark:text-white">
                                    EEC
                                </h1>
                                <span className="rounded-md bg-[#00ADC5]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#005577] uppercase tracking-wider dark:text-[#00ADC5]">
                                    PORTAL
                                </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Supplier Qualification Survey
                            </p>
                        </div>
                    </div>

                    {/* Step & Progress Indicator on Desktop */}
                    {activeStep !== undefined && totalSteps !== undefined && (
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xs font-bold text-[#005577] dark:text-[#00ADC5]">
                                    Tab {activeStep + 1} of {totalSteps}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {progressPct}% Completed
                                </div>
                            </div>
                            <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
                            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#005577] to-[#00ADC5] text-xs font-bold text-white shadow-sm shadow-[#00ADC5]/20">
                                {progressPct}%
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Application Container */}
            <main className="mx-auto w-full max-w-7xl px-3.5 pt-5 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
