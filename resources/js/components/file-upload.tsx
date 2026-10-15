import { useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
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

    return (
        <div className="mt-2">
            <div className="mb-1 flex items-center justify-between gap-2">
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
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
                        'rounded px-2 py-0.5 text-xs font-medium',
                        required
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    )}
                >
                    {required ? 'Attachment Required' : 'Optional Attachment'}
                </span>
            </div>

            <p className="mb-2 text-xs text-slate-500">{uploads.hint}</p>

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
                    'relative rounded-xl border-2 border-dashed p-4 text-center transition-all',
                    'bg-slate-50/50 dark:bg-slate-800/50',
                    message
                        ? 'border-red-400 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-300 hover:border-[#00515f] dark:border-slate-700 dark:hover:border-[#00515f]',
                    dragging && 'border-[#00515f] bg-[#00515f]/5',
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
                            'rounded-full p-2',
                            message
                                ? 'bg-red-100 text-red-600'
                                : 'bg-[#00515f]/10 text-[#00515f]',
                        )}
                    >
                        <Upload className="size-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Click to upload or drag & drop file
                    </p>
                    <p className="text-xs text-slate-400">
                        {uploads.mimes
                            .map((m) => m.toUpperCase())
                            .slice(0, -1)
                            .join(', ')}{' '}
                        or{' '}
                        {uploads.mimes[uploads.mimes.length - 1].toUpperCase()}{' '}
                        (Max {Math.round(maxBytes / (1024 * 1024))}MB)
                    </p>
                </div>
            </div>

            <FieldError message={message} id={`${inputId}-error`} />

            {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {files.map((file, index) => (
                        <li
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                                <FileText className="size-4 shrink-0 text-[#00515f]" />
                                <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                                    {file.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    ({formatBytes(file.size)})
                                </span>
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
                                className="rounded-md p-1 text-slate-400 transition-colors hover:text-red-500"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
