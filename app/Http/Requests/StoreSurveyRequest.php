<?php

namespace App\Http\Requests;

use App\Models\SurveyQuestion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSurveyRequest extends FormRequest
{
    /**
     * The survey form is public, so anyone may submit it.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Trim surrounding whitespace so " example.com " is stored as
     * "example.com" without any scheme being forced on the respondent.
     */
    public function prepareForValidation(): void
    {
        if (is_string($this->input('website'))) {
            $this->merge(['website' => trim($this->input('website'))]);
        }
    }

    /**
     * Rules are derived from the seeded questions so the form, its
     * validation and the report views can never drift apart.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $uploads = config('survey.uploads');

        $rules = [
            'company_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'country' => ['required', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
        ];

        foreach ($this->questions() as $question) {
            $rules["answers.{$question->id}"] = $this->answerRules($question);

            if ($question->acceptsAttachment()) {
                $rules["attachments.{$question->id}"] = [
                    $question->requiresAttachment() ? 'required' : 'nullable',
                    'array',
                    'max:'.(int) $uploads['max_files'],
                ];
                $rules["attachments.{$question->id}.*"] = [
                    'file',
                    'mimes:'.implode(',', $uploads['mimes']),
                    'max:'.(int) $uploads['max_kilobytes'],
                ];
            }
        }

        return $rules;
    }

    /**
     * @return array<int, mixed>
     */
    private function answerRules(SurveyQuestion $question): array
    {
        return match ($question->answer_type) {
            SurveyQuestion::ANSWER_NUMBER => [
                'required',
                'numeric',
                'integer',
                'min:0',
                'max:150',
            ],
            SurveyQuestion::ANSWER_RADIO => [
                'required',
                'string',
                Rule::in((array) $question->answer_options),
            ],
            SurveyQuestion::ANSWER_TEXT => ['required', 'string', 'max:1000'],
            default => ['required', 'string', 'max:5000'],
        };
    }

    /**
     * @return Collection<int, SurveyQuestion>
     */
    private function questions(): Collection
    {
        return SurveyQuestion::query()->active()->get();
    }
}
