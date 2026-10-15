<?php

use App\Models\SurveyArea;
use App\Models\SurveyAttachment;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\User;
use Database\Seeders\SurveySeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->seed(SurveySeeder::class));

test('guests are redirected to the login page', function () {
    foreach ([
        'reports.index',
        'reports.respondents.index',
    ] as $route) {
        $this->get(route($route))->assertRedirect(route('login'));
    }

    $response = SurveyResponse::factory()->create();

    $this->get(route('reports.respondents.show', $response))
        ->assertRedirect(route('login'));
});

test('the overview shows totals and recent respondents', function () {
    Storage::fake('local');

    SurveyResponse::factory()->count(2)->create();
    SurveyAttachment::factory()
        ->for(SurveyResponse::first(), 'response')
        ->create();

    $this->actingAs(User::factory()->create())
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('totals.respondents', 2)
            ->where('totals.attachments', 1)
            ->has('recent', 2));
});

test('the overview shows an empty state before any responses', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('totals.respondents', 0)
            ->where('recent', []));
});

test('respondents are listed newest first and can be searched', function () {
    $old = SurveyResponse::factory()->create([
        'company_name' => 'Alice Outlier Ltd',
        'submitted_at' => now()->subDay(),
    ]);
    $new = SurveyResponse::factory()->create([
        'company_name' => 'Bob Latest Ltd',
        'submitted_at' => now(),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.respondents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/respondents')
            ->where('responses.data.0.id', $new->id)
            ->where('responses.data.1.id', $old->id));

    $this->actingAs($user)
        ->get(route('reports.respondents.index', ['q' => 'Alice']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('responses.data', 1)
            ->where('responses.data.0.id', $old->id));
});

test('a respondents detail page shows grouped answers and guidance', function () {
    Storage::fake('local');

    $response = SurveyResponse::factory()->create();
    $question = SurveyQuestion::query()
        ->where('slug', 'years-manufacturing-exporting')
        ->first();
    $area = SurveyArea::query()->where('slug', 'company')->first();

    $response->answers()
        ->where('survey_question_id', $question->id)
        ->update(['answer' => '12 years of exporting.']);

    $attachment = SurveyAttachment::factory()
        ->for($response, 'response')
        ->create(['survey_question_id' => $question->id]);

    $areaIndex = SurveyArea::query()->orderBy('position')->pluck('id')
        ->search($area->id);
    $questionIndex = $area->questions()->pluck('id')->search($question->id);

    $this->actingAs(User::factory()->create())
        ->get(route('reports.respondents.show', $response))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/respondents/show')
            ->where('response.id', $response->id)
            ->where('response.company_name', $response->company_name)
            ->has('sections', SurveyArea::count())
            ->where("sections.$areaIndex.area", 'Company')
            ->where("sections.$areaIndex.questions.$questionIndex.answer", '12 years of exporting.')
            ->where("sections.$areaIndex.questions.$questionIndex.guidance", $question->guidance)
            ->has("sections.$areaIndex.questions.$questionIndex.attachments", 1)
            ->has('response.attachments', 1)
            ->where('response.attachments.0.id', $attachment->id));
});

test('attachments can be downloaded by an authenticated user', function () {
    Storage::fake('local');
    Storage::disk('local')->put('surveys/document.pdf', '%PDF-1.4 test');

    $attachment = SurveyAttachment::factory()->create([
        'path' => 'surveys/document.pdf',
        'original_name' => 'original-name.pdf',
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('reports.attachments.download', $attachment))
        ->assertOk()
        ->assertDownload('original-name.pdf');
});

test('a missing attachment returns a 404', function () {
    Storage::fake('local');

    $attachment = SurveyAttachment::factory()->create([
        'path' => 'surveys/missing.pdf',
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('reports.attachments.download', $attachment))
        ->assertNotFound();
});
