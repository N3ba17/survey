import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Paperclip,
    Search,
    Users,
    ArrowUpRight,
    Sparkles,
    Inbox,
    Filter,
    X,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { index as reportsRoute } from '@/routes/reports';
import {
    index as respondentsRoute,
    show as respondentRoute,
} from '@/routes/reports/respondents';
import type { Paginator, SurveyResponse } from '@/types';

type Props = {
    responses: Paginator<SurveyResponse>;
    filters: { q: string };
};

function formatDate(value: string): string {
    if (!value) return '—';

    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function Pagination({ paginator }: { paginator: Paginator<SurveyResponse> }) {
    if (paginator.last_page <= 1) {
        return (
            <div className="flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
                <span>
                    Showing{' '}
                    <strong className="text-foreground">
                        {paginator.total}
                    </strong>{' '}
                    total respondent{paginator.total === 1 ? '' : 's'}
                </span>
            </div>
        );
    }

    const numbers = paginator.links.slice(1, -1);

    return (
        <nav
            className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-4 sm:flex-row"
            aria-label="Pagination"
        >
            <p className="text-xs font-medium text-muted-foreground">
                Page{' '}
                <span className="font-bold text-foreground">
                    {paginator.current_page}
                </span>{' '}
                of{' '}
                <span className="font-bold text-foreground">
                    {paginator.last_page}
                </span>{' '}
                ·{' '}
                <span className="font-bold text-foreground">
                    {paginator.total}
                </span>{' '}
                total entries
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!paginator.prev_page_url}
                    onClick={() =>
                        paginator.prev_page_url &&
                        router.get(
                            paginator.prev_page_url,
                            {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                            },
                        )
                    }
                    className="h-9 rounded-xl border-border/80 px-3.5 font-semibold transition-all hover:border-[#00515f]/30 hover:bg-[#00515f]/10 hover:text-[#00515f] disabled:opacity-40"
                >
                    <ChevronLeft className="mr-1 size-4" />
                    Previous
                </Button>

                <div className="hidden items-center gap-1 sm:flex">
                    {numbers.map((link, index) => (
                        <Button
                            key={`${link.label}-${index}`}
                            variant={link.active ? 'default' : 'ghost'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            className={`h-9 min-w-9 rounded-xl font-semibold transition-all ${
                                link.active
                                    ? 'bg-[#00515f] text-white shadow-md shadow-[#00515f]/20 hover:bg-[#00515f]/90'
                                    : 'text-muted-foreground hover:bg-[#00515f]/10 hover:text-[#00515f]'
                            }`}
                        >
                            {link.label}
                        </Button>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!paginator.next_page_url}
                    onClick={() =>
                        paginator.next_page_url &&
                        router.get(
                            paginator.next_page_url,
                            {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                            },
                        )
                    }
                    className="h-9 rounded-xl border-border/80 px-3.5 font-semibold transition-all hover:border-[#00515f]/30 hover:bg-[#00515f]/10 hover:text-[#00515f] disabled:opacity-40"
                >
                    Next
                    <ChevronRight className="ml-1 size-4" />
                </Button>
            </div>
        </nav>
    );
}

export default function Respondents({ responses, filters }: Props) {
    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const query = new FormData(event.currentTarget).get('q');

        router.get(
            respondentsRoute.url(),
            { q: typeof query === 'string' ? query : '' },
            { preserveState: true, preserveScroll: true },
        );
    }

    function clearSearch() {
        router.get(
            respondentsRoute.url(),
            { q: '' },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Survey Respondents" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10">
                {/* Modern Header Section */}
                <div className="flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#00515f]/10 px-3.5 py-1.5 text-xs font-bold text-[#00515f] ring-1 ring-[#00515f]/20">
                            <Sparkles className="size-3.5 animate-pulse" />
                            <span>Participant Directory</span>
                        </div>
                        <Heading
                            title="Respondents"
                            description="Comprehensive logs and profile submissions from all survey participants."
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2 text-xs font-bold text-foreground shadow-sm">
                            <Users className="size-4 text-[#00515f]" />
                            <span>{responses.total} Total Submissions</span>
                        </span>
                    </div>
                </div>

                {/* Search and Filters Bar */}
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center">
                    <form
                        onSubmit={handleSearch}
                        role="search"
                        className="flex w-full items-center gap-2 sm:max-w-md"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                defaultValue={filters.q}
                                placeholder="Search by company, contact or email..."
                                aria-label="Search respondents"
                                className="h-11 rounded-xl border-border/80 bg-background/50 pl-10 text-sm font-medium focus-visible:border-[#00515f] focus-visible:ring-[#00515f]/20"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="h-11 shrink-0 rounded-xl bg-[#00515f] px-5 font-semibold text-white shadow-md shadow-[#00515f]/20 transition-all hover:bg-[#00515f]/90"
                        >
                            Search
                        </Button>
                        {filters.q && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearSearch}
                                className="h-11 shrink-0 rounded-xl border-border/80 px-3 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                title="Clear search"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </form>

                    {filters.q && (
                        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
                            <Filter className="size-3.5 text-[#00515f]" />
                            <span>
                                Filtered by:{' '}
                                <strong className="text-foreground">
                                    "{filters.q}"
                                </strong>
                            </span>
                        </div>
                    )}
                </div>

                {/* Respondents Card Table */}
                <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/90 shadow-lg shadow-black/5">
                    <CardContent className="p-0">
                        {responses.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                                <div className="mb-4 rounded-2xl bg-[#00515f]/10 p-5 text-[#00515f] ring-1 ring-[#00515f]/20">
                                    <Inbox className="size-8" />
                                </div>
                                <p className="text-base font-bold text-foreground">
                                    {filters.q
                                        ? `No respondents match “${filters.q}”.`
                                        : 'No responses recorded yet.'}
                                </p>
                                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                    {filters.q
                                        ? 'Try searching with a different keyword or clear your search filter.'
                                        : 'Responses will appear here automatically once participants submit the survey.'}
                                </p>
                                {filters.q && (
                                    <Button
                                        onClick={clearSearch}
                                        variant="outline"
                                        className="mt-5 rounded-xl border-border/80 font-semibold hover:bg-[#00515f]/10 hover:text-[#00515f]"
                                    >
                                        Clear Search Filter
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="hidden grid-cols-[1.5fr_2fr_1.2fr_auto] gap-4 border-b border-border/60 bg-muted/20 px-6 py-4 text-xs font-bold tracking-wider text-muted-foreground uppercase md:grid">
                                    <span>Company</span>
                                    <span>Email Address</span>
                                    <span>Submission Date</span>
                                    <span className="text-right">
                                        Attachments
                                    </span>
                                </div>

                                <ul className="divide-y divide-border/40">
                                    {responses.data.map((response) => (
                                        <li key={response.id}>
                                            <Link
                                                href={respondentRoute({
                                                    response: response.id,
                                                })}
                                                className="group grid gap-3 px-6 py-4.5 transition-all duration-200 hover:bg-[#00515f]/5 md:grid-cols-[1.5fr_2fr_1.2fr_auto] md:items-center md:gap-4"
                                            >
                                                <div className="flex min-w-0 items-center gap-3.5">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00515f]/15 to-[#000adc5]/10 text-xs font-bold text-[#00515f] ring-1 ring-[#00515f]/20 transition-transform group-hover:scale-105">
                                                        {response.company_name
                                                            ? response.company_name
                                                                  .charAt(0)
                                                                  .toUpperCase()
                                                            : '?'}
                                                    </div>
                                                    <div className="min-w-0 space-y-0.5">
                                                        <span className="block truncate text-sm font-bold text-foreground transition-colors group-hover:text-[#00515f]">
                                                            {
                                                                response.company_name
                                                            }
                                                        </span>
                                                        <span className="block truncate text-xs font-medium text-muted-foreground md:hidden">
                                                            {
                                                                response.contact_person
                                                            }
                                                            {' · '}
                                                            {response.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="hidden min-w-0 truncate text-sm font-medium text-muted-foreground md:block">
                                                    {response.email}
                                                </span>

                                                <span className="text-xs font-semibold text-muted-foreground md:text-sm">
                                                    {formatDate(
                                                        response.submitted_at,
                                                    )}
                                                </span>

                                                <div className="flex items-center justify-between gap-3 md:justify-end">
                                                    <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                                        <Paperclip className="size-3.5 text-[#00515f]" />
                                                        <span>
                                                            {response.attachments_count ??
                                                                0}
                                                        </span>
                                                    </div>
                                                    <div className="flex hidden size-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground shadow-sm transition-all group-hover:bg-[#00515f] group-hover:text-white md:flex">
                                                        <ArrowUpRight className="size-4" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination Section */}
                <Pagination paginator={responses} />
            </div>
        </>
    );
}

Respondents.layout = {
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
