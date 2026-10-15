import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    FileText,
    ImageIcon,
    Calendar,
    Paperclip,
    Mail,
    Sparkles,
    CheckCircle2,
    Building2,
    ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index as reportsRoute } from '@/routes/reports';
import { index as respondentsRoute } from '@/routes/reports/respondents';
import { download as downloadRoute } from '@/routes/reports/attachments';
import type { ReportAnswer, ReportSection, SurveyResponse } from '@/types';

type Props = {
    response: SurveyResponse;
    sections: ReportSection[];
};

function formatDate(value: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AnswerCard({ question }: { question: ReportAnswer }) {
    return (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 transition-all hover:border-[#00515f]/30">
            <p className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {question.question}
            </p>

            {question.answer ? (
                <p className="text-xs leading-snug font-semibold whitespace-pre-wrap text-foreground">
                    {question.answer}
                </p>
            ) : (
                <p className="text-[11px] text-muted-foreground italic">
                    Not answered
                </p>
            )}

            {question.guidance && (
                <div className="mt-2 rounded-md border border-dashed border-[#00515f]/30 bg-[#00515f]/5 p-2">
                    <p className="mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-wider text-[#00515f] uppercase">
                        <ClipboardCheck className="size-3" />
                        Evaluation note (internal)
                    </p>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                        {question.guidance}
                    </p>
                </div>
            )}

            {question.attachments.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                    {question.attachments.map((document) => (
                        <li key={document.id}>
                            <a
                                href={downloadRoute.url({
                                    attachment: document.id,
                                })}
                                className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-2 py-1 text-[10px] font-semibold text-foreground transition-colors hover:border-[#00515f]/40 hover:text-[#00515f]"
                            >
                                <FileText className="size-3" />
                                {document.original_name}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function RespondentShow({ response, sections }: Props) {
    const attachments = response.attachments ?? [];
    const questionCount = sections.reduce(
        (total, section) => total + section.questions.length,
        0,
    );

    return (
        <>
            <Head title={`Respondent: ${response.company_name}`} />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-hidden p-3 sm:p-4">
                {/* Top Navigation & Header Bar */}
                <div className="flex shrink-0 items-center justify-between pb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 rounded-lg border-border/80 px-3 text-xs font-medium hover:border-[#00515f]/30 hover:bg-[#00515f]/10 hover:text-[#00515f]"
                    >
                        <Link href={respondentsRoute.url()}>
                            <ArrowLeft className="mr-1 size-3.5" />
                            Back
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="hidden items-center gap-1.5 rounded-full bg-[#00515f]/10 px-3 py-1 text-[11px] font-semibold text-[#00515f] ring-1 ring-[#00515f]/20 sm:inline-flex">
                            <Sparkles className="size-3 animate-pulse" />
                            <span>Submission Report</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
                            <Paperclip className="size-3 text-[#00515f]" />
                            <span>
                                {attachments.length} file
                                {attachments.length === 1 ? '' : 's'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Compact Respondent Profile Card */}
                <Card className="mb-3 shrink-0 overflow-hidden rounded-xl border-border/60 bg-gradient-to-r from-card via-card to-muted/20 shadow-sm">
                    <CardContent className="flex flex-col justify-between gap-3 p-3.5 sm:flex-row sm:items-center sm:px-4 sm:py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00515f]/20 to-[#000adc5]/15 text-sm font-bold text-[#00515f] ring-1 ring-[#00515f]/30">
                                {response.company_name
                                    ? response.company_name
                                          .charAt(0)
                                          .toUpperCase()
                                    : '?'}
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
                                    {response.company_name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1 truncate text-foreground/80">
                                        <Building2 className="size-3 text-[#00515f]" />
                                        {response.contact_person}
                                        {response.job_title
                                            ? ` · ${response.job_title}`
                                            : ''}
                                    </span>
                                    <span className="flex items-center gap-1 truncate">
                                        <Mail className="size-3 text-[#00515f]" />
                                        {response.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3 text-[#00515f]" />
                                        {formatDate(response.submitted_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-1.5 text-[11px] font-semibold">
                            {response.country && (
                                <span className="rounded-full bg-muted px-2.5 py-1 ring-1 ring-border">
                                    {response.country}
                                </span>
                            )}
                            {response.website && (
                                <a
                                    href={response.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full bg-[#00515f]/10 px-2.5 py-1 text-[#00515f] ring-1 ring-[#00515f]/20 hover:bg-[#00515f]/20"
                                >
                                    Website
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Two-Column Viewport Fit Layout */}
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12">
                    {/* Answers Column, grouped by area */}
                    <Card className="flex min-h-0 flex-col overflow-hidden rounded-xl border-border/60 bg-card/90 shadow-sm lg:col-span-8">
                        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                <CheckCircle2 className="size-3.5 text-[#00515f]" />
                                Survey Results ({questionCount})
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                                Verified Response
                            </span>
                        </div>
                        <CardContent className="flex-1 space-y-4 overflow-y-auto p-3">
                            {sections.map((section) => (
                                <section
                                    key={section.area}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[11px] font-bold tracking-wider text-[#00515f] uppercase">
                                            {section.area}
                                        </h2>
                                        <span
                                            className="h-px flex-1 bg-border"
                                            aria-hidden
                                        />
                                    </div>

                                    {section.questions.map((question) => (
                                        <AnswerCard
                                            key={question.id}
                                            question={question}
                                        />
                                    ))}
                                </section>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Attachments Column */}
                    <Card className="flex min-h-0 flex-col overflow-hidden rounded-xl border-border/60 bg-card/90 shadow-sm lg:col-span-4">
                        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                <Paperclip className="size-3.5 text-[#00515f]" />
                                Uploaded Files
                            </span>
                            <span className="rounded-full bg-[#00515f]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00515f]">
                                {attachments.length}
                            </span>
                        </div>
                        <CardContent className="flex-1 overflow-y-auto p-3">
                            {attachments.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-4 text-center">
                                    <FileText className="mb-1.5 size-5 text-muted-foreground" />
                                    <p className="text-xs font-medium text-foreground">
                                        No files attached
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        No uploads submitted with this entry.
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {attachments.map((attachment) => (
                                        <li
                                            key={attachment.id}
                                            className="flex items-center justify-between gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 transition-all hover:border-[#00515f]/30"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#00515f]/10 text-[#00515f] ring-1 ring-[#00515f]/20">
                                                    {attachment.mime_type.startsWith(
                                                        'image/',
                                                    ) ? (
                                                        <ImageIcon className="size-3.5" />
                                                    ) : (
                                                        <FileText className="size-3.5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block truncate text-xs font-bold text-foreground">
                                                        {
                                                            attachment.original_name
                                                        }
                                                    </span>
                                                    <span className="block text-[10px] font-medium text-muted-foreground">
                                                        {formatBytes(
                                                            attachment.size_bytes,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="h-7 shrink-0 rounded-md border-border/80 px-2.5 text-[11px] font-semibold hover:border-[#00515f] hover:bg-[#00515f] hover:text-white"
                                            >
                                                <a
                                                    href={downloadRoute.url({
                                                        attachment:
                                                            attachment.id,
                                                    })}
                                                >
                                                    <Download className="mr-1 size-3" />
                                                    Save
                                                </a>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

RespondentShow.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: reportsRoute.url(),
        },
        {
            title: 'Respondents',
            href: respondentsRoute.url(),
        },
    ],
};
