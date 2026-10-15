<?php

namespace App\Http\Controllers;

use App\Actions\Survey\StoreSurveySubmission;
use App\Http\Requests\StoreSurveyRequest;
use App\Models\SurveyArea;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class SurveyController extends Controller
{
    /**
     * Show the public supplier survey form.
     */
    public function show(): Response
    {
        return Inertia::render('survey', [
            'survey' => Arr::only(config('survey'), ['title', 'thanks_message']),
            'areas' => $this->areas(),
            'uploads' => config('survey.uploads'),
        ]);
    }

    /**
     * Store a survey submission.
     */
    public function store(
        StoreSurveyRequest $request,
        StoreSurveySubmission $submission,
    ): RedirectResponse {
        $submission->handle($request->validated());

        Inertia::flash('submitted', true);

        return redirect()->route('survey.show');
    }

    /**
     * Areas with their active questions. Evaluation guidance stays internal,
     * so it is deliberately not part of the payload.
     *
     * @return list<array{id: int, name: string, slug: string, questions: list<array{id: int, priority: bool, question: string, answer_type: string, answer_options: list<string>|null, attachment_requirement: string, attachment_label: string|null}>}>
     */
    private function areas(): array
    {
        $areas = SurveyArea::query()
            ->with(['questions' => fn ($query) => $query->where('active', true)])
            ->orderBy('position')
            ->get();

        $payload = [];

        foreach ($areas as $area) {
            $questions = [];

            foreach ($area->questions as $question) {
                $questions[] = [
                    'id' => $question->id,
                    'priority' => $question->priority,
                    'question' => $question->question,
                    'answer_type' => $question->answer_type,
                    'answer_options' => $question->answer_options,
                    'attachment_requirement' => $question->attachment_requirement,
                    'attachment_label' => $question->attachment_label,
                ];
            }

            $payload[] = [
                'id' => $area->id,
                'name' => $area->name,
                'slug' => $area->slug,
                'questions' => $questions,
            ];
        }

        return $payload;
    }
}
