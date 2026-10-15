<?php

namespace App\Http\Controllers;

use App\Models\SurveyAnswer;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Support\Readiness;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Recent weeks plotted on the submission activity chart. */
    private const int ACTIVITY_WEEKS = 10;

    /** Countries beyond this rank are folded into a single "Other" slice. */
    private const int COUNTRY_LIMIT = 8;

    /** Suppliers shown on the attention list. */
    private const int ATTENTION_LIMIT = 8;

    /**
     * Supplier pre-qualification insights: breakdowns, compliance and attention list.
     */
    public function __invoke(): Response
    {
        $questions = SurveyQuestion::query()->active()->get();
        $responses = SurveyResponse::query()
            ->with(['answers', 'attachments'])
            ->latest('submitted_at')
            ->get();

        $total = $responses->count();
        $thisWeek = $responses->filter(
            fn (SurveyResponse $response) => $response->submitted_at >= now()->startOfWeek(),
        )->count();

        $readinessByResponse = $responses->mapWithKeys(fn (SurveyResponse $response) => [
            $response->id => Readiness::for($response, $questions),
        ]);

        /* ---------------------------------------------------------------- */
        /* Supplier landscape: company type + country distribution */
        /* ---------------------------------------------------------------- */

        $answersByQuestion = $responses
            ->flatMap(fn (SurveyResponse $response) => $response->answers)
            ->groupBy('survey_question_id');

        $radio = $questions->first(
            fn (SurveyQuestion $question) => $question->answer_type === SurveyQuestion::ANSWER_RADIO,
        );

        $typeCounts = $radio instanceof SurveyQuestion
            ? $answersByQuestion->get($radio->id)?->countBy('answer') ?? collect()
            : collect();

        $companyTypes = collect($radio instanceof SurveyQuestion ? $radio->answer_options ?? [] : [])
            ->map(fn (string $option) => [
                'label' => $option,
                'count' => $typeCounts->get($option) ?? 0,
                'percent' => $this->percent($typeCounts->get($option) ?? 0, $total),
            ])
            ->values()
            ->all();

        $countryCounts = $responses
            ->countBy(fn (SurveyResponse $response) => $response->country ?: 'Unspecified')
            ->sortDesc();

        $countries = $countryCounts
            ->take(self::COUNTRY_LIMIT)
            ->map(fn (int $count, string $label) => [
                'label' => $label,
                'count' => $count,
                'percent' => $this->percent($count, $total),
            ])
            ->values();

        $otherCount = (int) $countryCounts->slice(self::COUNTRY_LIMIT)->sum();

        if ($otherCount > 0) {
            $countries->push([
                'label' => 'Other',
                'count' => $otherCount,
                'percent' => $this->percent($otherCount, $total),
            ]);
        }

        $countries = $countries->all();

        /* ---------------------------------------------------------------- */
        /* Experience profile: buckets + average from the number question */
        /* ---------------------------------------------------------------- */

        $number = $questions->first(
            fn (SurveyQuestion $question) => $question->answer_type === SurveyQuestion::ANSWER_NUMBER,
        );

        $years = ($number instanceof SurveyQuestion
            ? $answersByQuestion->get($number->id) ?? collect()
            : collect())
            ->map(fn (SurveyAnswer $answer) => $answer->answer)
            ->filter(fn (?string $answer) => is_numeric($answer))
            ->map(fn (?string $answer) => (int) $answer);

        $experience = [
            'average' => $years->isNotEmpty() ? round($years->avg(), 1) : null,
            'answered' => $years->count(),
            'buckets' => [
                ['label' => '0–4 yrs', 'count' => $years->filter(fn (int $years) => $years <= 4)->count()],
                ['label' => '5–9 yrs', 'count' => $years->filter(fn (int $years) => $years >= 5 && $years <= 9)->count()],
                ['label' => '10–19 yrs', 'count' => $years->filter(fn (int $years) => $years >= 10 && $years <= 19)->count()],
                ['label' => '20+ yrs', 'count' => $years->filter(fn (int $years) => $years >= 20)->count()],
            ],
        ];

        /* ---------------------------------------------------------------- */
        /* Submission activity over the recent weeks */
        /* ---------------------------------------------------------------- */

        $submissionsByWeek = $responses->countBy(
            fn (SurveyResponse $response) => $response->submitted_at->copy()->startOfWeek()->toDateString(),
        );

        $activity = collect(range(self::ACTIVITY_WEEKS - 1, 0))
            ->map(fn (int $offset) => now()->startOfWeek()->subWeeks($offset))
            ->map(fn ($start) => [
                'week' => $start->toDateString(),
                'label' => $start->format('M j'),
                'count' => (int) $submissionsByWeek->get($start->toDateString(), 0),
            ])
            ->values()
            ->all();

        /* ---------------------------------------------------------------- */
        /* Document compliance: overall + per required question */
        /* ---------------------------------------------------------------- */

        $readyCount = $responses->filter(
            fn (SurveyResponse $response) => $readinessByResponse[$response->id]['documents']
                === $readinessByResponse[$response->id]['total_documents'],
        )->count();

        $complianceQuestions = $questions
            ->filter(fn (SurveyQuestion $question) => $question->requiresAttachment())
            ->map(fn (SurveyQuestion $question) => [
                'id' => $question->id,
                'label' => $question->attachment_label ?? $question->question,
                'attached' => $responses->filter(
                    fn (SurveyResponse $response) => $response->attachments
                        ->where('survey_question_id', $question->id)
                        ->isNotEmpty(),
                )->count(),
                'total' => $total,
            ])
            ->map(fn (array $item) => $item + [
                'percent' => $this->percent($item['attached'], $item['total']),
            ])
            ->values()
            ->all();

        /* ---------------------------------------------------------------- */
        /* Attention list: lowest readiness first */
        /* ---------------------------------------------------------------- */

        $attention = $responses
            ->filter(
                fn (SurveyResponse $response) => $readinessByResponse[$response->id]['score'] < 100,
            )
            ->sortBy([
                fn (SurveyResponse $a, SurveyResponse $b) => $readinessByResponse[$a->id]['score']
                    <=> $readinessByResponse[$b->id]['score'],
                fn (SurveyResponse $a, SurveyResponse $b) => $b->submitted_at <=> $a->submitted_at,
            ])
            ->take(self::ATTENTION_LIMIT)
            ->map(fn (SurveyResponse $response) => [
                'id' => $response->id,
                'company_name' => $response->company_name,
                'readiness' => $readinessByResponse[$response->id],
                'submitted_at' => $response->submitted_at->toIso8601String(),
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'kpis' => [
                'respondents' => $total,
                'thisWeek' => $thisWeek,
                'compliancePercent' => $this->percent($readyCount, $total),
                'averageYears' => $experience['average'],
            ],
            'companyTypes' => $companyTypes,
            'countries' => $countries,
            'experience' => $experience,
            'activity' => $activity,
            'compliance' => [
                'readyCount' => $readyCount,
                'questions' => $complianceQuestions,
            ],
            'insights' => $this->insights(
                total: $total,
                thisWeek: $thisWeek,
                companyTypes: $companyTypes,
                experience: $experience,
                topCountries: array_slice($countries, 0, 2),
                readyCount: $readyCount,
            ),
            'attention' => $attention,
        ]);
    }

    /**
     * Whole-number percentage, safe against an empty population.
     */
    private function percent(int $part, int $whole): int
    {
        return $whole > 0 ? (int) round($part / $whole * 100) : 0;
    }

    /**
     * Plain-language highlights derived from the aggregates above.
     *
     * @param  array<int, array{label: string, count: int, percent: int}>  $companyTypes
     * @param  array{average: float|null, answered: int, buckets: array<int, array{label: string, count: int}>}  $experience
     * @param  array<int, array{label: string, count: int, percent: int}>  $topCountries
     * @return list<string>
     */
    private function insights(
        int $total,
        int $thisWeek,
        array $companyTypes,
        array $experience,
        array $topCountries,
        int $readyCount,
    ): array {
        if ($total === 0) {
            return ['No submissions yet — insights will appear once the first supplier responds.'];
        }

        $insights = [];

        $dominant = collect($companyTypes)->sortByDesc('count')->first();

        if (is_array($dominant) && $dominant['count'] > 0) {
            $insights[] = "{$dominant['percent']}% of respondents identify as {$dominant['label']}";
        }

        if ($experience['average'] !== null) {
            $insights[] = "Average experience is {$experience['average']} years across {$experience['answered']} respondents";
        }

        if ($topCountries !== []) {
            $places = collect($topCountries)
                ->map(fn (array $country) => "{$country['label']} ({$country['count']})")
                ->implode(', ');
            $insights[] = "Top source countries: {$places}";
        }

        $insights[] = "{$readyCount} of {$total} suppliers have uploaded every required document";

        if ($thisWeek > 0) {
            $insights[] = "{$thisWeek} new ".str('submission')->plural($thisWeek).' this week';
        }

        return $insights;
    }
}
