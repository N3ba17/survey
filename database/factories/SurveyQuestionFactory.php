<?php

namespace Database\Factories;

use App\Models\SurveyArea;
use App\Models\SurveyQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SurveyQuestion>
 */
class SurveyQuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $question = ucfirst(fake()->unique()->sentence());

        return [
            'survey_area_id' => SurveyArea::factory(),
            'slug' => str($question)->slug()->limit(60)->rtrim('-', '.')->toString(),
            'position' => fake()->numberBetween(1, 20),
            'priority' => fake()->boolean(),
            'question' => $question,
            'guidance' => fake()->sentence(),
            'answer_type' => SurveyQuestion::ANSWER_TEXTAREA,
            'answer_options' => null,
            'attachment_requirement' => SurveyQuestion::ATTACHMENT_NONE,
            'attachment_label' => null,
            'active' => true,
        ];
    }

    /**
     * A question that requires a document upload.
     */
    public function requiresAttachment(): static
    {
        return $this->state(fn (array $attributes) => [
            'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
            'attachment_label' => 'Supporting document',
        ]);
    }
}
