import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertCircle,
    Award,
    Building2,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    DollarSign,
    Factory,
    Globe2,
    Loader2,
    ShieldCheck,
    Ship,
    Wrench,
} from 'lucide-react';
import FieldError from '@/components/survey/field-error';
import QuestionField from '@/components/survey/question-field';
import { show as surveyRoute, store as surveyStore } from '@/routes/survey';
import { login } from '@/routes';
import { cn } from '@/lib/utils';
import type {
    EvidenceSeen,
    SurveyArea,
    SurveyMeta,
    SurveyQuestion,
    SurveyUploads,
    User,
} from '@/types';

type FormState = {
    company_name: string;
    contact_person: string;
    job_title: string;
    email: string;
    phone: string;
    country: string;
    website: string;
    company_info: string;
    answers: Record<string, string>;
    evidence: Record<string, string>;
    attachments: Record<string, File[]>;
};

type Props = {
    survey: SurveyMeta;
    areas: SurveyArea[];
    uploads: SurveyUploads;
    auth: { user: User | null };
};

type SectionMeta = {
    icon: LucideIcon;
    shortTitle: string;
    subtitle: string;
};

const SECTION_META: Record<string, SectionMeta> = {
    company: {
        icon: Building2,
        shortTitle: 'Company',
        subtitle:
            'Provide general information regarding your business entity and licensing.',
    },
    'manufacturing-capacity': {
        icon: Factory,
        shortTitle: 'Capacity',
        subtitle:
            'Detail your production capabilities, facility size, and turnaround expectations.',
    },
    'quality-control': {
        icon: ShieldCheck,
        shortTitle: 'Quality',
        subtitle:
            'Detail your quality assurance methodologies and inspection willingness.',
    },
    'certifications-standards': {
        icon: Award,
        shortTitle: 'Certifications',
        subtitle:
            'Upload safety, management, and product specific conformity certificates.',
    },
    'project-references': {
        icon: Globe2,
        shortTitle: 'Projects',
        subtitle:
            'Demonstrate track record and familiarity with East African customs and logistics.',
    },
    'after-sales-warranty': {
        icon: Wrench,
        shortTitle: 'Warranty',
        subtitle:
            'Define warranty duration, replacement policy, and technical assistance options.',
    },
    'export-logistics': {
        icon: Ship,
        shortTitle: 'Export',
        subtitle:
            'Confirm your shipping experience to Djibouti port and transit into Ethiopia.',
    },
    'commercial-terms': {
        icon: DollarSign,
        shortTitle: 'Commercial',
        subtitle:
            'Specify minimum order quantity (MOQ) and preferred payment methods.',
    },
};

const DEFAULT_META: SectionMeta = {
    icon: ClipboardList,
    shortTitle: 'Section',
    subtitle: '',
};

const controlClasses = (hasError: boolean) =>
    cn(
        'w-full rounded-lg border px-3 py-2 transition-all outline-none',
        'text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        hasError
            ? 'border-red-500 focus:ring-2 focus:ring-red-400'
            : 'border-slate-300 focus:ring-2 focus:ring-[#00515f] dark:border-slate-700',
    );

function metaFor(area: SurveyArea): SectionMeta {
    return SECTION_META[area.slug] ?? DEFAULT_META;
}

export default function Survey({ survey, areas, uploads, auth }: Props) {
    const { flash } = usePage();
    const [activeStep, setActiveStep] = useState(0);
    const [touched, setTouched] = useState<Record<string, true>>({});

    const initialValues: FormState = {
        company_name: '',
        contact_person: '',
        job_title: '',
        email: '',
        phone: '',
        country: '',
        website: '',
        company_info: '',
        answers: {},
        evidence: {},
        attachments: {},
    };

    for (const area of areas) {
        for (const question of area.questions) {
            initialValues.answers[question.id] = '';
            initialValues.evidence[question.id] = '';
            initialValues.attachments[question.id] = [];
        }
    }

    const form = useForm<FormState>(initialValues);
    const errors = form.errors as Record<string, string | undefined>;

    /* ------------------------------------------------------------------ */
    /* Validation (mirrors StoreSurveyRequest so the wizard never bounces) */
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

        if (
            data.website.trim() &&
            !/^https?:\/\/[^\s.]+\.[^\s]{2,}$/.test(data.website.trim())
        ) {
            found.website = 'Please enter a valid URL (https://…)';
        }

        for (const area of areas) {
            for (const question of area.questions) {
                const key = `answers.${question.id}`;
                const answer = (data.answers[question.id] ?? '').trim();

                if (!answer) {
                    found[key] = 'An answer is required for this question';
                }

                const evidenceKey = `evidence.${question.id}`;

                if (!data.evidence[question.id]) {
                    found[evidenceKey] = 'Please select Yes, No or Pending';
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

    /* ---------------------- */
    /* Step helpers          */
    /* ---------------------- */

    function questionKeys(question: SurveyQuestion): string[] {
        return [
            `answers.${question.id}`,
            `evidence.${question.id}`,
            `attachments.${question.id}`,
        ];
    }

    function keysForStep(index: number): string[] {
        const area = areas[index];

        if (!area) return [];

        const respondentKeys =
            index === 0
                ? ['company_name', 'contact_person', 'email', 'website']
                : [];

        return [
            ...respondentKeys,
            ...area.questions.flatMap((question) => questionKeys(question)),
        ];
    }

    function stepForKey(key: string): number {
        const match = key.match(/^(?:answers|evidence|attachments)\.(\d+)$/);

        if (!match) return 0;

        const id = Number(match[1]);
        const index = areas.findIndex((area) =>
            area.questions.some((question) => question.id === id),
        );

        return index === -1 ? 0 : index;
    }

    function isStepValid(index: number): boolean {
        return keysForStep(index).every(
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
        const keys = keysForStep(activeStep);
        touch(keys);

        if (keys.some((key) => clientErrors[key] || errors[key])) return;

        setActiveStep((previous) => Math.min(previous + 1, areas.length - 1));
        scrollToTop();
    }

    function handlePrevious(): void {
        setActiveStep((previous) => Math.max(previous - 1, 0));
        scrollToTop();
    }

    function handleTabClick(index: number): void {
        setActiveStep(index);
        scrollToTop();
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const allKeys = areas.flatMap((_, index) => keysForStep(index));
        touch(allKeys);

        const firstInvalid = allKeys.find((key) => clientErrors[key]);

        if (firstInvalid) {
            setActiveStep(stepForKey(firstInvalid));
            scrollToTop();

            return;
        }

        form.post(surveyStore.url(), {
            forceFormData: true,
            preserveScroll: true,
            onError: (serverErrors) => {
                const firstKey = Object.keys(serverErrors)[0];

                if (firstKey) {
                    setActiveStep(stepForKey(firstKey));
                    scrollToTop();
                }
            },
        });
    }

    /* ---------------------- */
    /* Progress               */
    /* ---------------------- */

    function progress(): number {
        const required: string[] = ['company_name', 'contact_person', 'email'];

        for (const area of areas) {
            for (const question of area.questions) {
                required.push(`answers.${question.id}`);
                required.push(`evidence.${question.id}`);

                if (question.attachment_requirement === 'required') {
                    required.push(`attachments.${question.id}`);
                }
            }
        }

        const filled = required.filter((key) => {
            if (key.startsWith('answers.')) {
                return (form.data.answers[key.slice(8)] ?? '').trim() !== '';
            }

            if (key.startsWith('evidence.')) {
                return Boolean(form.data.evidence[key.slice(9)]);
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
    /* Success screen         */
    /* ---------------------- */

    if (flash.submitted) {
        return (
            <>
                <Head title={survey.title} />
                <WizardShell auth={auth}>
                    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#00515f]/10 text-[#00515f]">
                            <CheckCircle2 className="size-10" />
                        </div>
                        <h2 className="text-2xl font-bold">
                            Survey Submitted!
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {survey.thanks_message}
                        </p>
                        <div className="flex justify-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                            <button
                                onClick={() => router.visit(surveyRoute.url())}
                                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
                            >
                                Submit another response
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="rounded-lg bg-[#00515f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00515f]/90"
                            >
                                Print Response
                            </button>
                        </div>
                    </div>
                </WizardShell>
            </>
        );
    }

    const activeArea = areas[activeStep];

    if (!activeArea) {
        return (
            <>
                <Head title={survey.title} />
                <WizardShell auth={auth}>
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        No questions are configured for this survey yet.
                    </div>
                </WizardShell>
            </>
        );
    }

    const activeMeta = metaFor(activeArea);
    const ActiveIcon = activeMeta.icon;
    const questionOffset = areas
        .slice(0, activeStep)
        .reduce((total, area) => total + area.questions.length, 0);

    return (
        <>
            <Head title={survey.title} />

            <WizardShell auth={auth}>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    {survey.description}
                </p>

                {/* Progress */}
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Survey Completion Progress
                        </span>
                        <span className="text-xs font-bold text-[#00515f]">
                            {progress()}%
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-[#00515f] transition-all duration-300 ease-out"
                            style={{ width: `${progress()}%` }}
                        />
                    </div>
                </div>

                {/* Section tabs */}
                <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex min-w-max items-center space-x-2">
                        {areas.map((area, index) => {
                            const meta = metaFor(area);
                            const Icon = meta.icon;
                            const isActive = activeStep === index;
                            const valid = isStepValid(index);

                            const statusBadge = valid ? (
                                <span
                                    className="rounded-full bg-[#00515f] p-0.5 text-white"
                                    title="Section complete"
                                >
                                    <Check className="size-3 stroke-[3]" />
                                </span>
                            ) : activeStep > index ? (
                                <span
                                    className="rounded-full bg-red-500 p-0.5 text-white"
                                    title="Incomplete required fields"
                                >
                                    <AlertCircle className="size-3" />
                                </span>
                            ) : null;

                            return (
                                <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => handleTabClick(index)}
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all sm:text-sm',
                                        isActive
                                            ? 'bg-[#00515f] font-semibold text-white shadow-md shadow-[#00515f]/20'
                                            : 'border border-slate-200/60 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'size-4 shrink-0',
                                            isActive
                                                ? 'text-white'
                                                : 'text-[#00515f]',
                                        )}
                                    />
                                    <span className="whitespace-nowrap">
                                        {meta.shortTitle}
                                    </span>
                                    {statusBadge}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900"
                >
                    <section className="space-y-6">
                        <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
                                <ActiveIcon className="size-5 text-[#00515f]" />
                                {activeArea.name}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {activeMeta.subtitle}
                            </p>
                        </div>

                        {activeStep === 0 && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <TextField
                                    id="company_name"
                                    label="Company Legal Name"
                                    required
                                    placeholder="e.g. Acme Manufacturing Ltd."
                                    value={form.data.company_name}
                                    onChange={(value) =>
                                        form.setData('company_name', value)
                                    }
                                    onBlur={() => touch(['company_name'])}
                                    error={visibleError('company_name')}
                                    disabled={form.processing}
                                />
                                <TextField
                                    id="country"
                                    label="Country / Region of Origin"
                                    placeholder="e.g. China, Turkey, India, Vietnam"
                                    value={form.data.country}
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
                                    placeholder="Sales Manager / Key Account Representative"
                                    autoComplete="name"
                                    value={form.data.contact_person}
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
                                    placeholder="Sales manager"
                                    value={form.data.job_title}
                                    onChange={(value) =>
                                        form.setData('job_title', value)
                                    }
                                    onBlur={() => touch(['job_title'])}
                                    error={visibleError('job_title')}
                                    disabled={form.processing}
                                />
                                <TextField
                                    id="phone"
                                    label="Phone"
                                    type="tel"
                                    placeholder="+971 4 000 0000"
                                    autoComplete="tel"
                                    value={form.data.phone}
                                    onChange={(value) =>
                                        form.setData('phone', value)
                                    }
                                    onBlur={() => touch(['phone'])}
                                    error={visibleError('phone')}
                                    disabled={form.processing}
                                />
                                <TextField
                                    id="website"
                                    label="Company Website"
                                    placeholder="https://example.com"
                                    value={form.data.website}
                                    onChange={(value) =>
                                        form.setData('website', value)
                                    }
                                    onBlur={() => touch(['website'])}
                                    error={visibleError('website')}
                                    disabled={form.processing}
                                />
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="company_info"
                                        className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Anything else we should know?
                                    </label>
                                    <textarea
                                        id="company_info"
                                        rows={3}
                                        placeholder="Product range, factory locations, other notes…"
                                        value={form.data.company_info}
                                        disabled={form.processing}
                                        onChange={(event) =>
                                            form.setData(
                                                'company_info',
                                                event.target.value,
                                            )
                                        }
                                        className={controlClasses(
                                            Boolean(
                                                visibleError('company_info'),
                                            ),
                                        )}
                                    />
                                    <FieldError
                                        message={visibleError('company_info')}
                                    />
                                </div>
                            </div>
                        )}

                        {activeArea.questions.map((question, index) => {
                            const key = String(question.id);

                            return (
                                <QuestionField
                                    key={question.id}
                                    number={questionOffset + index + 1}
                                    question={question}
                                    answer={form.data.answers[key] ?? ''}
                                    evidence={form.data.evidence[key] ?? ''}
                                    files={form.data.attachments[key] ?? []}
                                    uploads={uploads}
                                    answerError={visibleError(
                                        `answers.${question.id}`,
                                    )}
                                    evidenceError={visibleError(
                                        `evidence.${question.id}`,
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
                                    onEvidence={(value: EvidenceSeen) =>
                                        form.setData('evidence', {
                                            ...form.data.evidence,
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
                    </section>

                    {/* Navigation */}
                    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Step {activeStep + 1} of {areas.length}:{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {activeArea.name}
                            </span>
                        </div>

                        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                            <button
                                type="button"
                                disabled={activeStep === 0}
                                onClick={handlePrevious}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors sm:flex-none',
                                    activeStep === 0
                                        ? 'cursor-not-allowed border-slate-200 text-slate-400 opacity-40'
                                        : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
                                )}
                            >
                                <ChevronLeft className="size-4" /> Previous
                                Section
                            </button>

                            {activeStep < areas.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#00515f] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00515f]/20 transition-colors hover:bg-[#00515f]/90 sm:flex-none"
                                >
                                    Next Section{' '}
                                    <ChevronRight className="size-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    data-test="submit-survey-button"
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#00515f] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00515f]/20 transition-colors hover:bg-[#00515f]/90 disabled:opacity-60 sm:flex-none"
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

                    {form.progress && (
                        <div className="mt-4">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-[#00515f] transition-[width]"
                                    style={{
                                        width: `${form.progress.percentage}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Uploading… {form.progress.percentage}%
                            </p>
                        </div>
                    )}

                    <p className="mt-3 text-center text-xs text-slate-400">
                        By submitting you agree that we may store your response
                        and any attached files. Your answers are confidential.
                    </p>
                </form>
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
    required?: boolean;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
                {label}{' '}
                {required && (
                    <span className="text-red-500" aria-hidden>
                        *
                    </span>
                )}
            </label>
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
                className={controlClasses(Boolean(error))}
                aria-invalid={error ? true : undefined}
            />
            <FieldError message={error} />
        </div>
    );
}

function WizardShell({
    auth,
    children,
}: {
    auth: { user: User | null };
    children: ReactNode;
}) {
    return (
        <div className="min-h-dvh bg-slate-50 pb-12 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-white shadow-md">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#00515f] p-2">
                            <ShieldCheck className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base leading-tight font-bold">
                                Supplier Qualification Survey
                            </h1>
                            <p className="text-xs text-slate-400">
                                Vendor Verification & Compliance
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                prefetch
                                className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login.url()}
                                prefetch
                                className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
