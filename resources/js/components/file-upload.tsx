import { useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { CheckCircle2, FileCheck2, Trash2, Upload } from 'lucide-react';
import FieldError from '@/components/survey/field-error';
import { cn } from '@/lib/utils';
import type { SurveyUploads } from '@/types';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(name: string): string {
    return name.split('.').pop()?.toLowerCase() ?? '';
}

export default function FileUpload({
    uploads,
    label,
    required = false,
    files,
    onChange,
    error,
    disabled = false,
}: {
    uploads: SurveyUploads;
    label: string;
    required?: boolean;
    files: File[];
    onChange: (files: File[]) => void;
    error?: string;
    disabled?: boolean;
}) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>(undefined);

    const maxBytes = uploads.max_kilobytes * 1024;

    function addFiles(incoming: FileList | null): void {
        if (!incoming || disabled) return;

        const accepted: File[] = [];
        let failure: string | undefined;

        for (const file of Array.from(incoming)) {
            if (files.length + accepted.length >= uploads.max_files) {
                failure = `You can attach up to ${uploads.max_files} files.`;
                break;
            }

            if (file.size > maxBytes) {
                failure = `"${file.name}" is larger than ${Math.round(maxBytes / (1024 * 1024))} MB.`;
                continue;
            }

            if (!uploads.mimes.includes(extensionOf(file.name))) {
                failure = `"${file.name}" must be ${uploads.mimes.map((m) => m.toUpperCase()).join(', ')}.`;
                continue;
            }

            accepted.push(file);
        }

        if (accepted.length > 0) {
            onChange([...files, ...accepted]);
        }

        setLocalError(failure);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function handleInput(event: ChangeEvent<HTMLInputElement>): void {
        addFiles(event.target.files);
    }

    const message = error ?? localError;
    const hasFiles = files.length > 0;

    return (
        <div className="mt-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                    htmlFor={inputId}
                    className="block text-xs font-bold text-slate-700 sm:text-sm dark:text-slate-200"
                >
                    {label}{' '}
                    {required ? (
                        <span className="text-red-500">*</span>
                    ) : (
                        <span className="text-xs font-normal text-slate-400">
                            (Optional)
                        </span>
                    )}
                </label>
                <span
                    className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        hasFiles
                            ? 'bg-[#00ADC5]/15 text-[#005577] dark:bg-[#00ADC5]/20 dark:text-[#00ADC5]'
                            : required
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    )}
                >
                    {hasFiles
                        ? `${files.length} Attached`
                        : required
                          ? 'Attachment Required'
                          : 'Optional Attachment'}
                </span>
            </div>

            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{uploads.hint}</p>

            {/* Clear, Prominent Uploaded Documents Display */}
            {hasFiles && (
                <div className="mb-3 space-y-2.5 rounded-2xl border-2 border-[#00ADC5] bg-gradient-to-r from-[#00ADC5]/8 to-[#005577]/5 p-3.5 shadow-sm dark:bg-[#00ADC5]/10">
                    <div className="flex items-center justify-between pb-1 text-xs font-bold text-[#005577] dark:text-[#00ADC5]">
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-[#00ADC5]" />
                            {files.length === 1 ? '1 Document Attached & Verified' : `${files.length} Documents Attached`}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Ready for submission
                        </span>
                    </div>

                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li
                                key={`${file.name}-${file.size}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-xl border border-[#00ADC5]/30 bg-white p-3 text-sm shadow-xs dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#00ADC5]/15 text-[#005577] dark:text-[#00ADC5]">
                                        <FileCheck2 className="size-5 stroke-[2.2]" />
                                    </div>
                                    <div className="truncate">
                                        <p className="truncate font-bold text-slate-900 text-xs sm:text-sm dark:text-slate-100">
                                            {file.name}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            {formatBytes(file.size)} • {extensionOf(file.name).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Remove ${file.name}`}
                                    disabled={disabled}
                                    onClick={() =>
                                        onChange(
                                            files.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                                >
                                    <Trash2 className="size-3.5" />
                                    <span className="hidden sm:inline">Remove</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Upload Dropzone (compact if file is already uploaded) */}
            {files.length < uploads.max_files && (
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        addFiles(event.dataTransfer.files);
                    }}
                    className={cn(
                        'relative rounded-2xl border-2 border-dashed p-4 text-center transition-all cursor-pointer',
                        hasFiles
                            ? 'border-slate-200 bg-slate-50/50 hover:border-[#00ADC5] dark:border-slate-800'
                            : 'border-slate-300 bg-slate-50/70 hover:border-[#00ADC5] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40',
                        message
                            ? 'border-red-400 bg-red-50/40 dark:bg-red-950/20'
                            : '',
                        dragging && 'border-[#00ADC5] bg-[#00ADC5]/10 scale-[1.01] shadow-lg shadow-[#00ADC5]/10',
                        disabled && 'pointer-events-none opacity-60',
                    )}
                >
                    <input
                        ref={inputRef}
                        id={inputId}
                        type="file"
                        multiple={uploads.max_files > 1}
                        accept={uploads.mimes.map((m) => `.${m}`).join(',')}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        disabled={disabled}
                        onChange={handleInput}
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5">
                        <div
                            className={cn(
                                'rounded-xl p-2 transition-transform group-hover:scale-105',
                                message
                                    ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                                    : 'bg-[#00ADC5]/15 text-[#005577] dark:text-[#00ADC5]',
                            )}
                        >
                            <Upload className="size-4.5 stroke-[2.2]" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {hasFiles ? 'Attach an additional file' : 'Tap to upload or drag & drop document'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                                {uploads.mimes.map((m) => m.toUpperCase()).join(', ')} (Max {Math.round(maxBytes / (1024 * 1024))}MB)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <FieldError message={message} id={`${inputId}-error`} />
        </div>
    );
}
