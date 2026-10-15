import FileUpload from '@/components/file-upload';
import FieldError from '@/components/survey/field-error';
import { cn } from '@/lib/utils';
import type { SurveyQuestion, SurveyUploads } from '@/types';

const controlClasses = (hasError: boolean) =>
    cn(
        'w-full rounded-lg border px-3 py-2 transition-all outline-none',
        'text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        hasError
            ? 'border-red-500 focus:ring-2 focus:ring-red-400'
            : 'border-slate-300 focus:ring-2 focus:ring-[#00515f] dark:border-slate-700',
    );

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

    if (question.answer_type === 'radio') {
        const options = question.answer_options ?? [];

        return (
            <div
                role="radiogroup"
                aria-label={question.question}
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
                {options.map((option) => (
                    <label
                        key={option}
                        className={cn(
                            'flex cursor-pointer items-center rounded-xl border p-3 transition-all',
                            answer === option
                                ? 'border-[#00515f] bg-[#00515f]/5 font-medium text-[#00515f]'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={`answers[${question.id}]`}
                                value={option}
                                checked={answer === option}
                                disabled={disabled}
                                onChange={() => onAnswer(option)}
                                onBlur={() =>
                                    onBlur(`answers.${question.id}`)
                                }
                                className="size-3.5 shrink-0 accent-[#00515f]"
                            />
                            <span className="text-sm">{option}</span>
                        </span>
                    </label>
                ))}
            </div>
        );
    }

    if (question.answer_type === 'number') {
        return (
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
        );
    }

    if (question.answer_type === 'text') {
        return (
            <input
                id={controlId}
                type="text"
                value={answer}
                placeholder="Your answer"
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
            placeholder="Your answer"
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

    return (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {number}. {question.question}{' '}
                    <span className="text-red-500" aria-hidden>
                        *
                    </span>
                </label>

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
                <FileUpload
                    uploads={uploads}
                    label={question.attachment_label ?? 'Supporting document'}
                    required={requiresAttachment}
                    files={files}
                    onChange={onFiles}
                    error={filesError}
                    disabled={disabled}
                />
            )}
        </div>
    );
}
