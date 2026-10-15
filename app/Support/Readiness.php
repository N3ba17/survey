<?php

namespace App\Support;

use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use Illuminate\Support\Collection;

/**
 * A transparent, derived readiness score for one supplier submission.
 *
 * Score = (answered questions % + required documents %) / 2.
 * Nothing is stored; it is recalculated from the current active question set.
 */
final class Readiness
{
    /**
     * @param  Collection<int, SurveyQuestion>  $questions  Every active question.
     * @return array{
     *     score: int,
     *     answered: int,
     *     total_answers: int,
     *     documents: int,
     *     total_documents: int,
     * }
     */
    public static function for(SurveyResponse $response, Collection $questions): array
    {
        $questionIds = $questions->pluck('id');
        $requiredIds = $questions
            ->filter(fn (SurveyQuestion $question) => $question->requiresAttachment())
            ->pluck('id');

        $answered = $response->answers
            ->whereIn('survey_question_id', $questionIds)
            ->count();
        $documents = $response->attachments
            ->whereIn('survey_question_id', $requiredIds)
            ->unique('survey_question_id')
            ->count();

        $totalAnswers = $questions->count();
        $totalDocuments = $requiredIds->count();

        $answerRate = $totalAnswers === 0 ? 1.0 : $answered / $totalAnswers;
        $documentRate = $totalDocuments === 0 ? 1.0 : $documents / $totalDocuments;

        return [
            'score' => (int) round(($answerRate + $documentRate) * 50),
            'answered' => $answered,
            'total_answers' => $totalAnswers,
            'documents' => $documents,
            'total_documents' => $totalDocuments,
        ];
    }
}
