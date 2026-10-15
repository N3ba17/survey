<?php

namespace Database\Factories;

use App\Models\SurveyAttachment;
use App\Models\SurveyResponse;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SurveyAttachment>
 */
class SurveyAttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'survey_response_id' => SurveyResponse::factory(),
            'path' => 'surveys/'.Str::uuid().'.pdf',
            'original_name' => fake()->word().'-document.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => fake()->numberBetween(10_000, 5_000_000),
        ];
    }
}
