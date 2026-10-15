import { Check, CheckCircle2, ChevronDown } from 'lucide-react';
import FileUpload from '@/components/file-upload';
import FieldError from '@/components/survey/field-error';
import { cn } from '@/lib/utils';
import type { SurveyQuestion, SurveyUploads } from '@/types';

const controlClasses = (hasError: boolean) =>
    cn(
        'w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm transition-all outline-none',
        'text-slate-800 dark:text-slate-100 placeholder:text-slate-400',
        hasError
            ? 'border-red-500 bg-red-50/20 focus:ring-3 focus:ring-red-400/20 dark:bg-red-950/20'
            : 'border-slate-300 bg-white focus:border-[#00ADC5] focus:ring-3 focus:ring-[#00ADC5]/20 dark:border-slate-700 dark:bg-slate-800/90',
    );

const QC_STEPS_OPTIONS = [
    { value: 'IncomingInProcessFinal', label: 'IncomingInProcessFinal (All Three Stages)' },
    { value: 'IncomingQualityControl', label: 'IncomingQualityControl (Raw Materials & Components)' },
    { value: 'InProcessQualityControl', label: 'InProcessQualityControl (In-Line Assembly & Production)' },
    { value: 'FinalInspection', label: 'FinalInspection (Pre-Shipment & Packaging Inspection)' },
    { value: 'IncomingAndInProcess', label: 'IncomingAndInProcess (IQC & IPQC Stages)' },
    { value: 'InProcessAndFinal', label: 'InProcessAndFinal (IPQC & Final Inspection)' },
];

const PAYMENT_TERMS_OPTIONS = [
    { value: 'LC at Sight', label: 'LC at Sight (Irrevocable Letter of Credit)' },
    { value: 'T/T 30% Deposit, 70% against B/L Copy', label: 'T/T 30% Deposit, 70% against B/L Copy (Standard)' },
    { value: 'T/T 20% Deposit, 80% against B/L Copy', label: 'T/T 20% Deposit, 80% against B/L Copy' },
    { value: 'CAD (Cash Against Documents)', label: 'CAD (Cash Against Documents / D/P)' },
    { value: 'Usance LC (30/60/90 Days)', label: 'Usance LC (Deferred 30/60/90 Days)' },
    { value: 'LC at Sight or T/T 30/70', label: 'LC at Sight or T/T 30/70 (Flexible Options)' },
    { value: '100% T/T Advance', label: '100% T/T Advance' },
    { value: 'Open Account (O/A)', label: 'Open Account (O/A)' },
    { value: 'Custom Negotiable Payment Terms', label: 'Custom Negotiable Payment Terms' },
];

function isQcStepsQuestion(questionText: string): boolean {
    return questionText.toLowerCase().includes('qc steps');
}

function isPaymentTermsQuestion(questionText: string): boolean {
    return questionText.toLowerCase().includes('payment terms');
}

function cleanQuestionText(rawQuestion: string): string {
    if (isQcStepsQuestion(rawQuestion)) {
        return rawQuestion
            .replace(/\?\s*Can I see a QC report\??/i, '?')
            .replace(/Can I see a QC report\??/i, '')
            .trim();
    }
    return rawQuestion;
}

function AnswerControl({
    question,
    answer,
    answerError,
    onAnswer,
    onBlur,
    disabled,
}: {
    question: SurveyQuestion;
    answer: string;
    answerError?: string;
    onAnswer: (value: string) => void;
    onBlur: (key: string) => void;
    disabled: boolean;
}) {
    const controlId = `question-${question.id}`;

    // Custom Dropdown for QC Steps (Requirement 5)
    if (isQcStepsQuestion(question.question)) {
        return (
            <div className="relative">
                <select
                    id={controlId}
                    value={answer}
                    disabled={disabled}
                    onChange={(event) => onAnswer(event.target.value)}
                    onBlur={() => onBlur(`answers.${question.id}`)}
                    className={cn(controlClasses(Boolean(answerError)), 'appearance-none pr-10 cursor-pointer')}
                    aria-invalid={answerError ? true : undefined}
                >
                    <option value="">Select QC procedure (CamelCased)…</option>
                    {QC_STEPS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <ChevronDown className="size-4" />
                </div>
            </div>
        );
    }

    // Custom Dropdown for Payment Terms (Requirement 7)
    if (isPaymentTermsQuestion(question.question)) {
        return (
            <div className="relative">
                <select
                    id={controlId}
                    value={answer}
                    disabled={disabled}
                    onChange={(event) => onAnswer(event.target.value)}
                    onBlur={() => onBlur(`answers.${question.id}`)}
                    className={cn(controlClasses(Boolean(answerError)), 'appearance-none pr-10 cursor-pointer')}
                    aria-invalid={answerError ? true : undefined}
                >
                    <option value="">Select accepted standard payment terms…</option>
                    {PAYMENT_TERMS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <ChevronDown className="size-4" />
                </div>
            </div>
        );
    }

    if (question.answer_type === 'radio') {
        const options = question.answer_options ?? [];

        return (
            <div
                role="radiogroup"
                aria-label={question.question}
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
            >
                {options.map((option) => {
                    const isSelected = answer === option;
                    return (
                        <label
                            key={option}
                            className={cn(
                                'group relative flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-sm transition-all select-none',
                                isSelected
                                    ? 'border-[#00ADC5] bg-[#00ADC5]/8 font-medium text-slate-900 shadow-xs ring-1 ring-[#00ADC5] dark:bg-[#00ADC5]/15 dark:text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800',
                                disabled && 'cursor-not-allowed opacity-60',
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all',
                                        isSelected
                                            ? 'border-[#00ADC5] bg-[#00ADC5] text-white shadow-xs'
                                            : 'border-slate-300 bg-white group-hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800',
                                    )}
                                >
                                    {isSelected && <Check className="size-3 stroke-[3]" />}
                                </span>
                                <input
                                    type="radio"
                                    name={`answers[${question.id}]`}
                                    value={option}
                                    checked={isSelected}
                                    disabled={disabled}
                                    onChange={() => onAnswer(option)}
                                    onBlur={() => onBlur(`answers.${question.id}`)}
                                    className="sr-only"
                                />
                                <span className="text-sm font-medium leading-snug">{option}</span>
                            </span>
                        </label>
                    );
                })}
            </div>
        );
    }

    if (question.answer_type === 'number') {
        return (
            <div className="relative">
                <input
                    id={controlId}
                    type="number"
                    min={0}
                    max={150}
                    value={answer}
                    placeholder="e.g. 12"
                    required
                    disabled={disabled}
                    onChange={(event) => onAnswer(event.target.value)}
                    onBlur={() => onBlur(`answers.${question.id}`)}
                    className={controlClasses(Boolean(answerError))}
                    aria-invalid={answerError ? true : undefined}
                />
            </div>
        );
    }

    if (question.answer_type === 'text') {
        return (
            <input
                id={controlId}
                type="text"
                value={answer}
                placeholder="Enter your detailed response"
                required
                disabled={disabled}
                onChange={(event) => onAnswer(event.target.value)}
                onBlur={() => onBlur(`answers.${question.id}`)}
                className={controlClasses(Boolean(answerError))}
                aria-invalid={answerError ? true : undefined}
            />
        );
    }

    return (
        <textarea
            id={controlId}
            rows={3}
            value={answer}
            placeholder="Type your detailed response here..."
            required
            disabled={disabled}
            onChange={(event) => onAnswer(event.target.value)}
            onBlur={() => onBlur(`answers.${question.id}`)}
            className={controlClasses(Boolean(answerError))}
            aria-invalid={answerError ? true : undefined}
        />
    );
}

export default function QuestionField({
    number,
    question,
    answer,
    files,
    uploads,
    answerError,
    filesError,
    onAnswer,
    onFiles,
    onBlur,
    disabled = false,
}: {
    number: number;
    question: SurveyQuestion;
    answer: string;
    files: File[];
    uploads: SurveyUploads;
    answerError?: string;
    filesError?: string;
    onAnswer: (value: string) => void;
    onFiles: (files: File[]) => void;
    onBlur: (key: string) => void;
    disabled?: boolean;
}) {
    const acceptsAttachment = question.attachment_requirement !== 'none';
    const requiresAttachment = question.attachment_requirement === 'required';
    const hasAnswer = (answer ?? '').trim().length > 0;
    const hasAttachedFile = files.length > 0;
    const displayText = cleanQuestionText(question.question);

    return (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4.5 sm:p-5 shadow-xs transition-shadow hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
            <div>
                <div className="mb-2.5 flex items-start justify-between gap-3">
                    <label
                        htmlFor={`question-${question.id}`}
                        className="block text-sm font-bold text-slate-800 sm:text-base dark:text-slate-100"
                    >
                        <span className="mr-2 inline-flex items-center justify-center rounded-lg bg-[#00ADC5]/15 px-2 py-0.5 text-xs font-bold text-[#005577] dark:text-[#00ADC5]">
                            Q{number}
                        </span>
                        {displayText}{' '}
                        <span className="text-red-500" aria-hidden>
                            *
                        </span>
                    </label>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {hasAttachedFile && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#00ADC5]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#005577] dark:text-[#00ADC5]">
                                <CheckCircle2 className="size-3" /> Document Uploaded
                            </span>
                        )}
                        {hasAnswer && !answerError && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#00ADC5]/10 px-2 py-0.5 text-xs font-semibold text-[#00ADC5]">
                                <Check className="size-3 stroke-[3]" />
                                <span className="hidden sm:inline">Answered</span>
                            </span>
                        )}
                    </div>
                </div>

                <AnswerControl
                    question={question}
                    answer={answer}
                    answerError={answerError}
                    onAnswer={onAnswer}
                    onBlur={onBlur}
                    disabled={disabled}
                />

                <FieldError message={answerError} />
            </div>

            {acceptsAttachment && (
                <div className="pt-2">
                    <FileUpload
                        uploads={uploads}
                        label={question.attachment_label ?? 'Supporting document'}
                        required={requiresAttachment}
                        files={files}
                        onChange={onFiles}
                        error={filesError}
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
}
