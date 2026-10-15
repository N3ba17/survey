<?php

namespace App\Actions\Survey;

use App\Models\SurveyResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreSurveySubmission
{
    /**
     * Persist a validated supplier submission: the company details, one
     * answer row per question and any documents uploaded per question.
     *
     * @param  array<string, mixed>  $data
     */
    public function handle(array $data): SurveyResponse
    {
        $uploads = config('survey.uploads');
        $disk = is_array($uploads) && is_string($uploads['disk'] ?? null)
            ? $uploads['disk']
            : 'local';
        $directory = is_array($uploads) && is_string($uploads['directory'] ?? null)
            ? $uploads['directory']
            : 'surveys';

        return DB::transaction(function () use ($data, $disk, $directory): SurveyResponse {
            $response = SurveyResponse::create([
                'company_name' => $data['company_name'],
                'contact_person' => $data['contact_person'],
                'job_title' => $data['job_title'] ?? null,
                'email' => $data['email'],
                'country' => $data['country'],
                'website' => $data['website'] ?? null,
                'submitted_at' => now(),
            ]);

            $answers = is_array($data['answers'] ?? null) ? $data['answers'] : [];

            foreach ($answers as $questionId => $answer) {
                $response->answers()->create([
                    'survey_question_id' => (int) $questionId,
                    'answer' => $answer,
                ]);
            }

            $attachments = is_array($data['attachments'] ?? null) ? $data['attachments'] : [];

            foreach ($attachments as $questionId => $files) {
                if (! is_array($files)) {
                    continue;
                }

                foreach ($files as $file) {
                    if (! $file instanceof UploadedFile) {
                        continue;
                    }

                    $response->attachments()->create([
                        'survey_question_id' => (int) $questionId,
                        'path' => $file->store($directory, $disk),
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
                        'size_bytes' => (int) $file->getSize(),
                    ]);
                }
            }

            return $response;
        });
    }
}
