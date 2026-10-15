<?php

namespace App\Http\Controllers;

use App\Models\SurveyAnswer;
use App\Models\SurveyArea;
use App\Models\SurveyAttachment;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Support\Readiness;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Supplier report overview: totals and recent submissions.
     */
    public function index(): Response
    {
        return Inertia::render('reports/index', [
            'totals' => [
                'respondents' => SurveyResponse::query()->count(),
                'attachments' => SurveyAttachment::query()->count(),
                'thisWeek' => SurveyResponse::query()
                    ->where('submitted_at', '>=', now()->startOfWeek())
                    ->count(),
                'lastResponseAt' => SurveyResponse::query()->value('submitted_at'),
            ],
            'recent' => SurveyResponse::query()
                ->withCount('attachments')
                ->latest('submitted_at')
                ->take(5)
                ->get(),
        ]);
    }

    /**
     * Paginated list of respondents with search.
     */
    public function respondents(Request $request): Response
    {
        $search = $request->string('q')->toString();

        return Inertia::render('reports/respondents', [
            'responses' => SurveyResponse::query()
                ->search($search)
                ->withCount('attachments')
                ->latest('submitted_at')
                ->paginate(10)
                ->withQueryString(),
            'filters' => ['q' => $search],
        ]);
    }

    /**
     * A single respondent's answers, documents and internal guidance.
     */
    public function show(SurveyResponse $response): Response
    {
        $answers = $response->answers()->get()->groupBy('survey_question_id');
        $documents = $response->attachments()
            ->whereNotNull('survey_question_id')
            ->get()
            ->groupBy('survey_question_id');

        $sections = SurveyArea::query()
            ->with(['questions' => fn ($query) => $query->where('active', true)])
            ->orderBy('position')
            ->get()
            ->map(fn (SurveyArea $area) => [
                'area' => $area->name,
                'questions' => $area->questions
                    ->map(fn (SurveyQuestion $question) => $this->answerFor(
                        $question,
                        $answers->get($question->id),
                        $documents->get($question->id),
                    ))
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('reports/respondents/show', [
            'response' => $response->load('attachments'),
            'sections' => $sections,
            'readiness' => Readiness::for($response, SurveyQuestion::query()->active()->get()),
        ]);
    }

    /**
     * Download an attachment from the private disk.
     */
    public function download(SurveyAttachment $attachment): \Symfony\Component\HttpFoundation\Response
    {
        $uploads = config('survey.uploads');
        $disk = Storage::disk(is_array($uploads) ? $uploads['disk'] : 'local');

        abort_unless($disk->exists($attachment->path), 404);

        return $disk->download($attachment->path, $attachment->original_name);
    }

    /**
     * One question's stored answer and documents.
     *
     * @param  Collection<int, SurveyAnswer>|null  $answerRows
     * @param  Collection<int, SurveyAttachment>|null  $documentRows
     * @return array<string, mixed>
     */
    private function answerFor(SurveyQuestion $question, ?Collection $answerRows, ?Collection $documentRows): array
    {
        $answer = $answerRows?->first();

        return [
            'id' => $question->id,
            'priority' => $question->priority,
            'question' => $question->question,
            'guidance' => $question->guidance,
            'attachment_requirement' => $question->attachment_requirement,
            'attachment_label' => $question->attachment_label,
            'answer' => $answer?->answer,
            'attachments' => $documentRows
                ?->map(fn (SurveyAttachment $attachment) => [
                    'id' => $attachment->id,
                    'original_name' => $attachment->original_name,
                    'mime_type' => $attachment->mime_type,
                    'size_bytes' => $attachment->size_bytes,
                ])
                ->values()
                ->all() ?? [],
        ];
    }
}
