import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ChevronRight,
    ClipboardCheck,
    FileText,
    Lightbulb,
    MapPinned,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { show as respondentRoute } from '@/routes/reports/respondents';
import { index as reportsRoute } from '@/routes/reports';
import { cn } from '@/lib/utils';
import type { DashboardData } from '@/types';

const PALETTE = [
    '#00515f',
    '#0e7490',
    '#14b8a6',
    '#5eead4',
    '#0f766e',
    '#134e4a',
    '#99f6e4',
    '#115e59',
];

type TooltipRow = {
    label?: string;
    count?: number;
    percent?: number;
};

function BreakdownTooltip(props: {
    active?: boolean;
    payload?: ReadonlyArray<{ payload?: TooltipRow }>;
}) {
    const row = props.payload?.[0]?.payload;

    if (!props.active || !row) return null;

    return (
        <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs shadow-md">
            <p className="font-semibold text-foreground">{row.label}</p>
            <p className="text-muted-foreground">
                {row.count ?? 0} supplier{(row.count ?? 0) === 1 ? '' : 's'}
                {typeof row.percent === 'number' ? ` · ${row.percent}%` : ''}
            </p>
        </div>
    );
}

function KpiCard({
    label,
    value,
    hint,
    icon,
}: {
    label: string;
    value: string | number;
    hint: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="group border-border/60 bg-card/90 shadow-sm transition-all hover:border-[#00515f]/30 hover:shadow-lg">
            <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                        {value}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-[#00515f]">
                        {hint}
                    </p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#00515f]/10 text-[#00515f] ring-1 ring-[#00515f]/20 transition-all group-hover:bg-[#00515f] group-hover:text-white">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

function ScoreBadge({ score }: { score: number }) {
    return (
        <span
            className={cn(
                'inline-flex w-14 shrink-0 justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1',
                score >= 90
                    ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30'
                    : score >= 70
                      ? 'bg-amber-500/10 text-amber-600 ring-amber-500/30'
                      : 'bg-red-500/10 text-red-600 ring-red-500/30',
            )}
        >
            {score}%
        </span>
    );
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function SectionCard({
    title,
    subtitle,
    icon,
    children,
}: {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Card className="border-border/60 bg-card/90 shadow-sm">
            <CardHeader className="border-b border-border/40 p-5 pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
                    <span className="text-[#00515f]">{icon}</span>
                    {title}
                </CardTitle>
                {subtitle && (
                    <p className="text-xs font-medium text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-5">{children}</CardContent>
        </Card>
    );
}

export default function Dashboard({
    kpis,
    companyTypes,
    countries,
    experience,
    activity,
    compliance,
    insights,
    attention,
}: DashboardData) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#00515f]/10 px-3.5 py-1.5 text-xs font-bold text-[#00515f] ring-1 ring-[#00515f]/20">
                            <Sparkles className="size-3.5 animate-pulse" />
                            <span>Live supplier insights</span>
                        </div>
                        <Heading
                            title="Qualification dashboard"
                            description="Breakdowns, compliance and follow-ups across every supplier submission."
                        />
                    </div>
                    <Button
                        asChild
                        className="h-11 rounded-xl bg-[#00515f] px-5 font-semibold text-white shadow-md shadow-[#00515f]/20 transition-all hover:scale-[1.02] hover:bg-[#00515f]/90 active:scale-[0.98]"
                    >
                        <Link href={reportsRoute.url()}>
                            <FileText className="mr-2 size-4" />
                            Open reports
                        </Link>
                    </Button>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Total respondents"
                        value={kpis.respondents}
                        hint={`${kpis.thisWeek} joined this week`}
                        icon={<Users className="size-5" />}
                    />
                    <KpiCard
                        label="Submissions this week"
                        value={kpis.thisWeek}
                        hint="Rolling from Monday"
                        icon={<Activity className="size-5" />}
                    />
                    <KpiCard
                        label="Document compliance"
                        value={`${kpis.compliancePercent}%`}
                        hint={`${compliance.readyCount} fully compliant`}
                        icon={<ClipboardCheck className="size-5" />}
                    />
                    <KpiCard
                        label="Avg. experience"
                        value={
                            kpis.averageYears === null
                                ? '—'
                                : `${kpis.averageYears} yrs`
                        }
                        hint={`${experience.answered} answered`}
                        icon={<TrendingUp className="size-5" />}
                    />
                </div>

                {/* Insights */}
                <Card className="border-border/60 bg-card/90 shadow-sm">
                    <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
                        {insights.map((insight) => (
                            <div
                                key={insight}
                                className="flex items-start gap-2.5 rounded-xl bg-[#00515f]/5 p-3 text-sm text-foreground ring-1 ring-[#00515f]/10"
                            >
                                <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#00515f]" />
                                <span>{insight}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Supplier landscape */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <SectionCard
                        title="Company type"
                        subtitle="Self-declared on the qualification form"
                        icon={<Users className="size-4" />}
                    >
                        {kpis.respondents === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No responses to chart yet.
                            </p>
                        ) : (
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                <ChartContainer
                                    config={{}}
                                    className="mx-auto aspect-square w-full max-w-[240px]"
                                >
                                    <PieChart>
                                        <Tooltip
                                            cursor={false}
                                            content={(props) => (
                                                <BreakdownTooltip {...props} />
                                            )}
                                        />
                                        <Pie
                                            data={companyTypes}
                                            dataKey="count"
                                            nameKey="label"
                                            innerRadius={58}
                                            outerRadius={92}
                                            paddingAngle={2}
                                            strokeWidth={2}
                                        >
                                            {companyTypes.map(
                                                (slice, index) => (
                                                    <Cell
                                                        key={slice.label}
                                                        fill={
                                                            PALETTE[
                                                                index %
                                                                    PALETTE.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <ul className="w-full space-y-2">
                                    {companyTypes.map((slice, index) => (
                                        <li
                                            key={slice.label}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        PALETTE[
                                                            index %
                                                                PALETTE.length
                                                        ],
                                                }}
                                            />
                                            <span className="min-w-0 flex-1 truncate text-foreground">
                                                {slice.label}
                                            </span>
                                            <span className="font-semibold text-foreground tabular-nums">
                                                {slice.count}
                                            </span>
                                            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                                                {slice.percent}%
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Countries of origin"
                        subtitle="Top source markets across all submissions"
                        icon={<MapPinned className="size-4" />}
                    >
                        {countries.length === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No responses to chart yet.
                            </p>
                        ) : (
                            <ChartContainer
                                config={{}}
                                className="h-[260px] w-full"
                            >
                                <BarChart
                                    data={countries}
                                    layout="vertical"
                                    margin={{ left: 4, right: 16 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        width={104}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,81,95,0.06)' }}
                                        content={(props) => (
                                            <BreakdownTooltip {...props} />
                                        )}
                                    />
                                    <Bar
                                        dataKey="count"
                                        radius={[0, 6, 6, 0]}
                                        maxBarSize={22}
                                    >
                                        {countries.map((slice, index) => (
                                            <Cell
                                                key={slice.label}
                                                fill={
                                                    PALETTE[
                                                        index % PALETTE.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        )}
                    </SectionCard>
                </div>

                {/* Experience + activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <SectionCard
                        title="Experience profile"
                        subtitle={
                            experience.average === null
                                ? 'Years in manufacturing & exporting'
                                : `Average ${experience.average} years across ${experience.answered} respondents`
                        }
                        icon={<TrendingUp className="size-4" />}
                    >
                        <ChartContainer
                            config={{}}
                            className="h-[240px] w-full"
                        >
                            <BarChart data={experience.buckets}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,81,95,0.06)' }}
                                    content={(props) => (
                                        <BreakdownTooltip {...props} />
                                    )}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#00515f"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={56}
                                />
                            </BarChart>
                        </ChartContainer>
                    </SectionCard>

                    <SectionCard
                        title="Submission activity"
                        subtitle="New responses per week over the last 10 weeks"
                        icon={<Activity className="size-4" />}
                    >
                        <ChartContainer
                            config={{}}
                            className="h-[240px] w-full"
                        >
                            <AreaChart data={activity}>
                                <defs>
                                    <linearGradient
                                        id="activity-fill"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#00515f"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#00515f"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 10 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    width={24}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{
                                        stroke: '#00515f',
                                        strokeWidth: 1,
                                    }}
                                    content={(props) => (
                                        <BreakdownTooltip {...props} />
                                    )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#00515f"
                                    strokeWidth={2}
                                    fill="url(#activity-fill)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </SectionCard>
                </div>

                {/* Document compliance */}
                <SectionCard
                    title="Document compliance"
                    subtitle={`${compliance.readyCount} of ${kpis.respondents} suppliers uploaded every required document`}
                    icon={<ClipboardCheck className="size-4" />}
                >
                    {compliance.questions.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No questions currently require a document.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {compliance.questions.map((question) => (
                                <div key={question.id} className="grid gap-1.5">
                                    <div className="flex items-baseline justify-between gap-3 text-sm">
                                        <span className="min-w-0 truncate font-medium text-foreground">
                                            {question.label}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                            {question.attached}/{question.total}{' '}
                                            · {question.percent}%
                                        </span>
                                    </div>
                                    <div
                                        className="h-2 w-full overflow-hidden rounded-full bg-muted"
                                        role="progressbar"
                                        aria-valuenow={question.percent}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={question.label}
                                    >
                                        <div
                                            className="h-full rounded-full bg-[#00515f] transition-all duration-500"
                                            style={{
                                                width: `${question.percent}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Attention list */}
                <Card className="border-border/60 bg-card/90 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/40 p-5 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
                                <span className="text-[#00515f]">
                                    <ClipboardCheck className="size-4" />
                                </span>
                                Needs attention
                            </CardTitle>
                            <p className="text-xs font-medium text-muted-foreground">
                                Lowest readiness first — missing documents or
                                incomplete answers
                            </p>
                        </div>
                    </CardHeader>

                    {attention.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                            {kpis.respondents === 0
                                ? 'No responses yet — this list fills in as suppliers submit.'
                                : 'Every supplier has complete answers and required documents.'}
                        </p>
                    ) : (
                        <div>
                            {attention.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-wrap items-center gap-3 border-b border-border/40 px-5 py-3.5 last:border-0"
                                >
                                    <ScoreBadge score={item.readiness.score} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {item.company_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.readiness.answered}/
                                            {item.readiness.total_answers}{' '}
                                            answers · {item.readiness.documents}
                                            /{item.readiness.total_documents}{' '}
                                            required documents
                                        </p>
                                    </div>
                                    <span className="hidden text-xs text-muted-foreground sm:inline">
                                        {formatDate(item.submitted_at)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="rounded-lg font-semibold transition-all hover:border-[#00515f]/30 hover:bg-[#00515f]/10 hover:text-[#00515f]"
                                    >
                                        <Link
                                            href={respondentRoute({
                                                response: item.id,
                                            })}
                                        >
                                            Review
                                            <ChevronRight className="ml-1 size-3" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
