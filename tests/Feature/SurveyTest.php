<?php

use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use Database\Seeders\SurveySeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->seed(SurveySeeder::class));

function surveyPayload(array $overrides = []): array
{
    $payload = [
        'company_name' => 'Acme Manufacturing PLC',
        'contact_person' => 'Jane Doe',
        'job_title' => 'Sales manager',
        'email' => 'jane@example.com',
        'country' => 'United Arab Emirates',
        'website' => 'https://example.com',
        'answers' => [],
        'attachments' => [],
    ];

    foreach (SurveyQuestion::query()->active()->get() as $question) {
        $payload['answers'][$question->id] = match ($question->answer_type) {
            SurveyQuestion::ANSWER_NUMBER => 12,
            SurveyQuestion::ANSWER_RADIO => $question->answer_options[0],
            default => 'Sample supplier answer.',
        };

        if ($question->requiresAttachment()) {
            $payload['attachments'][$question->id] = [
                UploadedFile::fake()->create('document.pdf', 100),
            ];
        } elseif ($question->acceptsAttachment()) {
            $payload['attachments'][$question->id] = [];
        }
    }

    return array_merge($payload, $overrides);
}

test('the survey page is public and renders the seeded areas and questions', function () {
    $questions = SurveyQuestion::query()->active()->get();

    $this->get(route('survey.show'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('survey')
            ->has('areas', 8)
            ->where('areas.0.name', 'Company')
            ->where(
                'areas',
                fn ($areas) => collect($areas)->sum(fn (array $area) => count($area['questions'])) === $questions->count(),
            )
            ->where('areas.0.questions.0.question', 'Are you the manufacturer or a trading company? Can I see your business licence?')
            ->where('areas.0.questions.0.answer_type', 'radio')
            ->has('areas.0.questions.0.answer_options', 3)
            ->where('areas.0.questions.1.answer_type', 'number')
            ->where('areas.0.questions.0.attachment_requirement', 'required')
            ->missing('areas.0.questions.0.guidance')
            ->missing('survey.description')
            ->where('uploads.max_kilobytes', 10240)
            ->where('uploads.max_files', 3));
});

test('company details are required', function () {
    $this->post(route('survey.store'), surveyPayload([
        'company_name' => null,
        'contact_person' => null,
        'email' => null,
    ]))->assertSessionHasErrors(['company_name', 'contact_person', 'email']);

    expect(SurveyResponse::count())->toBe(0);
});

test('country is required', function () {
    $this->post(route('survey.store'), surveyPayload([
        'country' => null,
    ]))->assertSessionHasErrors('country');

    expect(SurveyResponse::count())->toBe(0);
});

test('every question needs an answer', function () {
    $payload = surveyPayload();
    $questions = SurveyQuestion::query()->active()->get();

    $payload['answers'][$questions[0]->id] = '';

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("answers.{$questions[0]->id}");

    expect(SurveyResponse::count())->toBe(0);
});

test('a choice question only accepts one of its options', function () {
    $question = SurveyQuestion::query()
        ->where('slug', 'manufacturer-or-trader')
        ->first();

    $payload = surveyPayload();
    $payload['answers'][$question->id] = 'Maybe?';

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("answers.{$question->id}");

    expect(SurveyResponse::count())->toBe(0);
});

test('the years question needs a whole number of years', function () {
    $question = SurveyQuestion::query()
        ->where('slug', 'years-manufacturing-exporting')
        ->first();

    $payload = surveyPayload();
    $payload['answers'][$question->id] = 'twelve';

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("answers.{$question->id}");

    $payload['answers'][$question->id] = 200;

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("answers.{$question->id}");

    expect(SurveyResponse::count())->toBe(0);
});

test('questions marked required must include a document', function () {
    $question = SurveyQuestion::query()
        ->where('attachment_requirement', 'required')
        ->first();

    $payload = surveyPayload();
    unset($payload['attachments'][$question->id]);

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("attachments.{$question->id}");

    expect(SurveyResponse::count())->toBe(0);
});

test('a valid submission is stored with answers and documents', function () {
    Storage::fake('local');

    $required = SurveyQuestion::query()
        ->where('attachment_requirement', 'required')
        ->first();

    $this->post(route('survey.store'), surveyPayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('survey.show'))
        ->assertInertiaFlash('submitted', true);

    $response = SurveyResponse::sole();

    expect($response->company_name)->toBe('Acme Manufacturing PLC')
        ->and($response->contact_person)->toBe('Jane Doe')
        ->and($response->email)->toBe('jane@example.com')
        ->and($response->country)->toBe('United Arab Emirates')
        ->and($response->submitted_at)->not->toBeNull()
        ->and($response->answers)->toHaveCount(
            SurveyQuestion::query()->active()->count()
        )
        ->and($response->answers()->first()->answer)->toBe('Direct Manufacturer');

    $requiredQuestions = SurveyQuestion::query()
        ->where('attachment_requirement', 'required')
        ->count();

    $attachment = $response->attachments()
        ->where('survey_question_id', $required->id)
        ->sole();

    expect($response->attachments()->count())->toBe($requiredQuestions)
        ->and($attachment->survey_question_id)->toBe($required->id)
        ->and($attachment->original_name)->toBe('document.pdf');

    Storage::disk('local')->assertExists($attachment->path);
});

test('a file larger than 10MB is rejected', function () {
    $question = SurveyQuestion::query()
        ->where('attachment_requirement', 'required')
        ->first();

    $payload = surveyPayload();
    $payload['attachments'][$question->id] = [
        UploadedFile::fake()->create('huge.pdf', 11000),
    ];

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("attachments.{$question->id}.0");

    expect(SurveyResponse::count())->toBe(0);
});

test('unsupported file types are rejected', function () {
    $question = SurveyQuestion::query()
        ->where('attachment_requirement', 'required')
        ->first();

    $payload = surveyPayload();
    $payload['attachments'][$question->id] = [
        UploadedFile::fake()->create('notes.txt', 10),
    ];

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("attachments.{$question->id}.0");

    expect(SurveyResponse::count())->toBe(0);
});

test('more than the allowed number of files per question is rejected', function () {
    $question = SurveyQuestion::query()
        ->where('attachment_requirement', 'required')
        ->first();

    $files = collect(range(1, 4))
        ->map(fn (int $i) => UploadedFile::fake()->create("file-{$i}.pdf", 10))
        ->all();

    $payload = surveyPayload();
    $payload['attachments'][$question->id] = $files;

    $this->post(route('survey.store'), $payload)
        ->assertSessionHasErrors("attachments.{$question->id}");

    expect(SurveyResponse::count())->toBe(0);
});
