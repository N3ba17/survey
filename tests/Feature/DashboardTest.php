<?php

use App\Models\SurveyAttachment;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\User;
use Database\Seeders\SurveySeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->seed(SurveySeeder::class));

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('the dashboard breaks down responses into insights', function () {
    $complete = SurveyResponse::factory()->create([
        'country' => 'Kenya',
        'submitted_at' => now()->subWeeks(2),
    ]);
    $partial = SurveyResponse::factory()->create([
        'country' => 'Kenya',
        'submitted_at' => now()->subWeek()->subDay(),
    ]);
    SurveyResponse::factory()->create([
        'country' => 'India',
        'submitted_at' => now()->subWeeks(3),
    ]);

    $required = SurveyQuestion::query()
        ->active()
        ->where('attachment_requirement', SurveyQuestion::ATTACHMENT_REQUIRED)
        ->get();

    foreach ($required as $question) {
        SurveyAttachment::factory()
            ->for($complete, 'response')
            ->for($question, 'question')
            ->create();
    }

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('kpis.respondents', 3)
            ->where('kpis.thisWeek', 0)
            ->where('kpis.compliancePercent', 33)
            ->whereNotNull('kpis.averageYears')
            ->where(
                'companyTypes',
                fn ($types) => collect($types)->sum('count') === 3,
            )
            ->where('countries.0.label', 'Kenya')
            ->where('countries.0.count', 2)
            ->where('countries.1.label', 'India')
            ->where('experience.answered', 3)
            ->where(
                'experience.buckets',
                fn ($buckets) => collect($buckets)->sum('count') === 3,
            )
            ->has('activity', 10)
            ->where(
                'activity',
                fn ($weeks) => collect($weeks)->sum('count') === 3,
            )
            ->where('compliance.readyCount', 1)
            ->has('compliance.questions', $required->count())
            ->has('insights')
            ->where('attention', fn ($rows) => count($rows) === 2)
            ->where('attention.0.id', $partial->id)
            ->where('attention.0.readiness.score', 50));
});

test('the dashboard shows an empty state before any responses', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('kpis.respondents', 0)
            ->where('kpis.compliancePercent', 0)
            ->where('kpis.averageYears', null)
            ->where('companyTypes.0.count', 0)
            ->where('countries', [])
            ->where('compliance.readyCount', 0)
            ->has('insights', 1)
            ->where('attention', []));
});

test('the respondent detail shows the readiness score', function () {
    $response = SurveyResponse::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('reports.respondents.show', $response))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/respondents/show')
            ->where('readiness.answered', SurveyQuestion::query()->active()->count())
            ->where('readiness.total_answers', SurveyQuestion::query()->active()->count())
            ->where('readiness.documents', 0)
            ->where('readiness.total_documents', 6)
            ->where('readiness.score', 50));
});
