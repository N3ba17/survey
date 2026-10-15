<?php

namespace Database\Factories;

use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SurveyResponse>
 */
class SurveyResponseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_name' => fake()->company(),
            'contact_person' => fake()->name(),
            'job_title' => fake()->jobTitle(),
            'email' => fake()->unique()->safeEmail(),
            'country' => fake()->country(),
            'website' => fake()->url(),
            'submitted_at' => now(),
        ];
    }

    /**
     * Answer every active question, as a completed submission would.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (SurveyResponse $response): void {
            $questions = SurveyQuestion::query()->active()->get();

            foreach ($questions as $question) {
                $response->answers()->create([
                    'survey_question_id' => $question->id,
                    'answer' => match ($question->answer_type) {
                        SurveyQuestion::ANSWER_NUMBER => (string) fake()->numberBetween(1, 30),
                        SurveyQuestion::ANSWER_RADIO => fake()->randomElement((array) $question->answer_options),
                        default => fake()->sentence(),
                    },
                ]);
            }
        });
    }

    /**
     * Indicate a response submitted at a specific time.
     */
    public function submittedAt(\DateTimeInterface $time): static
    {
        return $this->state(fn (array $attributes) => [
            'submitted_at' => $time,
        ]);
    }
}
