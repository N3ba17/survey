import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    FileText,
    Inbox,
    Users,
    Sparkles,
    TrendingUp,
    Clock,
    ChevronRight,
    BarChart3,
    Layers,
    Activity,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as reportsRoute } from '@/routes/reports';
import {
    index as respondentsRoute,
    show as respondentRoute,
} from '@/routes/reports/respondents';
import type { Breakdown, SurveyResponse, SurveyTotals } from '@/types';

type Props = {
    totals: SurveyTotals;
    breakdowns: Breakdown[];
    recent: SurveyResponse[];
};

function formatDate(value: string | null): string {
    if (!value) return '—';

    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function StatCard({
    label,
    value,
    hint,
    icon,
}: {
    label: string;
    value: string | number;
    hint?: string;
    icon: ReactNode;
}) {
    return (
        <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-muted/20 transition-all duration-300 hover:border-[#00515f]/40 hover:shadow-xl hover:shadow-[#00515f]/5">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-[#00515f]/5 transition-transform duration-500 group-hover:scale-125" />
            <CardContent className="flex items-start justify-between gap-4 p-6">
                <div className="min-w-0 space-y-1.5">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="text-3xl font-extrabold tracking-tight text-foreground">
                        {value}
                    </p>
                    {hint && (
                        <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                            <TrendingUp className="size-3.5 text-[#00515f]" />
                            <span className="font-semibold text-[#00515f]">
                                {hint}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#00515f]/10 text-[#00515f] ring-1 ring-[#00515f]/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00515f] group-hover:text-white">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

function BreakdownCard({ breakdown }: { breakdown: Breakdown }) {
    const empty = breakdown.total === 0;
    const isWide = breakdown.options.length > 6;

    return (
        <Card
            className={`border-border/60 bg-card/75 backdrop-blur-md transition-all duration-300 hover:border-[#00515f]/30 hover:shadow-lg ${isWide ? 'md:col-span-2' : ''}`}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/40 p-6 pb-4">
                <div className="space-y-0.5">
                    <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
                        <span className="size-2 rounded-full bg-[#00515f]" />
                        {breakdown.label}
                    </CardTitle>
                    <p className="text-xs font-medium text-muted-foreground">
                        <span className="font-semibold text-[#00515f]">
                            {breakdown.area}
                        </span>
                        {' · '}
                        {empty
                            ? 'No answers recorded yet'
                            : `${breakdown.total} answered`}
                    </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#00515f]/10 px-3 py-1 text-xs font-semibold text-[#00515f] ring-1 ring-[#00515f]/20">
                    Evidence seen
                </span>
            </CardHeader>

            <CardContent className="grid gap-5 p-6 pt-5">
                {empty ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
                        <div className="mb-3 rounded-2xl bg-[#00515f]/10 p-4 text-[#00515f] ring-1 ring-[#00515f]/20">
                            <BarChart3 className="size-6" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                            Awaiting initial submissions
                        </p>
                        <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                            Responses will automatically populate and visualize
                            here in real-time once participants complete the
                            survey.
                        </p>
                    </div>
                ) : (
                    breakdown.options.map((option) => (
                        <div key={option.key} className="group/bar grid gap-2">
                            <div className="flex items-baseline justify-between gap-3 text-sm">
                                <span className="truncate font-semibold text-foreground/90">
                                    {option.label}
                                </span>
                                <div className="flex shrink-0 items-center gap-2 text-xs">
                                    <span className="font-bold text-foreground">
                                        {option.count}
                                    </span>
                                    <span className="font-medium text-muted-foreground">
                                        ({option.percent}%)
                                    </span>
                                </div>
                            </div>
                            <div
                                className="h-3 w-full overflow-hidden rounded-full bg-muted/80 p-0.5 shadow-inner"
                                role="progressbar"
                                aria-valuenow={option.percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={option.label}
                            >
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#00515f] to-[#000adc5] shadow-sm transition-all duration-700 ease-out group-hover/bar:brightness-110"
                                    style={{ width: `${option.percent}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export default function ReportsIndex({ totals, breakdowns, recent }: Props) {
    const orderedBreakdowns = [...breakdowns].sort(
        (a, b) => a.options.length - b.options.length,
    );

    return (
        <>
            <Head title="Survey Reports & Analytics" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
                {/* Modern Header Section */}
                <div className="flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#00515f]/10 px-3.5 py-1.5 text-xs font-bold text-[#00515f] ring-1 ring-[#00515f]/20">
                            <Sparkles className="size-3.5 animate-pulse" />
                            <span>Enterprise Survey Intelligence</span>
                        </div>
                        <Heading
                            title="Survey reports & analytics"
                            description="Deep-dive comprehensive metrics, live response breakdowns, and recent submission logs."
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            className="h-11 rounded-xl bg-[#00515f] px-5 py-2.5 font-semibold text-white shadow-md shadow-[#00515f]/20 transition-all hover:scale-[1.02] hover:bg-[#00515f]/90 active:scale-[0.98]"
                        >
                            <Link href={respondentsRoute.url()}>
                                <Users className="mr-2 size-4" />
                                View All Respondents
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Elevated Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Respondents"
                        value={totals.respondents}
                        hint={`${totals.thisWeek} joined this week`}
                        icon={<Users className="size-5" />}
                    />
                    <StatCard
                        label="Total Attachments"
                        value={totals.attachments}
                        hint="Secure file uploads"
                        icon={<FileText className="size-5" />}
                    />
                    <StatCard
                        label="Weekly Activity"
                        value={totals.thisWeek}
                        hint="New submissions"
                        icon={<Activity className="size-5" />}
                    />
                    <StatCard
                        label="Last Submission"
                        value={
                            totals.lastResponseAt
                                ? formatDate(totals.lastResponseAt)
                                : '—'
                        }
                        hint="Most recent activity"
                        icon={<Clock className="size-5" />}
                    />
                </div>

                {/* Breakdowns Section */}
                <div className="space-y-5 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground">
                                <Layers className="size-5 text-[#00515f]" />
                                Response Breakdowns
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Evidence-seen verdicts (Yes / No / Pending) for
                                every supplier question
                            </p>
                        </div>
                        <span className="rounded-full bg-[#00515f]/10 px-3 py-1 text-xs font-semibold text-[#00515f]">
                            {breakdowns.length} active metrics
                        </span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {orderedBreakdowns.map((breakdown) => (
                            <BreakdownCard
                                key={breakdown.key}
                                breakdown={breakdown}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent Respondents Section */}
                <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/90 shadow-lg shadow-black/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 bg-muted/20 p-6">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                                Recent respondents
                            </CardTitle>
                            <p className="text-xs font-medium text-muted-foreground">
                                Real-time feed of latest candidate submissions
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-1.5 rounded-xl border-border/80 font-semibold transition-all hover:border-[#00515f]/30 hover:bg-[#00515f]/10 hover:text-[#00515f]"
                        >
                            <Link href={respondentsRoute.url()}>
                                View all
                                <ChevronRight className="size-4" />
                            </Link>
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        {recent.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-4 rounded-2xl bg-[#00515f]/10 p-5 text-[#00515f] ring-1 ring-[#00515f]/20">
                                    <Inbox className="size-8" />
                                </div>
                                <p className="text-base font-bold text-foreground">
                                    No responses recorded yet
                                </p>
                                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                                    Share
                                    <Link
                                        href="/survey"
                                        className="mx-1.5 font-bold text-[#00515f] underline underline-offset-4 hover:text-[#00515f]/80"
                                    >
                                        your dedicated survey link
                                    </Link>
                                    with your audience to start collecting
                                    valuable insights.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40 overflow-x-auto">
                                {recent.map((response) => (
                                    <Link
                                        key={response.id}
                                        href={respondentRoute({
                                            response: response.id,
                                        })}
                                        className="group flex items-center justify-between gap-4 px-6 py-4.5 transition-all duration-200 hover:bg-[#00515f]/5"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00515f]/15 to-[#000adc5]/10 text-sm font-bold text-[#00515f] ring-1 ring-[#00515f]/20 transition-transform group-hover:scale-105">
                                                {response.company_name
                                                    ? response.company_name
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : '?'}
                                            </div>
                                            <div className="min-w-0 space-y-0.5">
                                                <span className="block truncate text-sm font-bold text-foreground transition-colors group-hover:text-[#00515f]">
                                                    {response.company_name}
                                                </span>
                                                <span className="block truncate text-xs font-medium text-muted-foreground">
                                                    {response.contact_person}
                                                    {' · '}
                                                    {response.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-4">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {formatDate(
                                                    response.submitted_at,
                                                )}
                                            </span>
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground shadow-sm transition-all group-hover:bg-[#00515f] group-hover:text-white">
                                                <ArrowUpRight className="size-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: reportsRoute.url(),
        },
    ],
};
