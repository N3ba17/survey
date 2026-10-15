<?php

namespace Database\Factories;

use App\Models\SurveyArea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SurveyArea>
 */
class SurveyAreaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'position' => fake()->numberBetween(1, 20),
        ];
    }
}
