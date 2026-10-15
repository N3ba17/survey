<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Survey Content
    |--------------------------------------------------------------------------
    |
    | The public survey page renders its metadata (title, description and
    | thanks message) from this file. The questions themselves live in the
    | database — see database/seeders/SurveySeeder.php — grouped into areas
    | with per-question evaluation guidance and document requirements.
    |
    */

    'title' => env('SURVEY_TITLE', 'Supplier pre-qualification survey'),

    'description' => env(
        'SURVEY_DESCRIPTION',
        'These questions help us assess your company as a manufacturing partner. Please answer every question and attach the requested documents where required.'
    ),

    'thanks_message' => env(
        'SURVEY_THANKS_MESSAGE',
        'Thank you — your response has been recorded. We read every submission.'
    ),

    /*
    |--------------------------------------------------------------------------
    | File Uploads
    |--------------------------------------------------------------------------
    |
    | The PHP side must allow at least "max_kilobytes" as well. Locally that
    | means upload_max_filesize / post_max_size in php.ini (see php.dev.ini
    | for the project-scoped development override). On a server behind
    | nginx, also raise client_max_body_size.
    |
    */

    'uploads' => [
        'max_kilobytes' => 10240,
        'max_files' => 3,
        'mimes' => ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        'disk' => 'local',
        'directory' => 'surveys',
        'label' => 'Supporting documents',
        'hint' => 'JPG, PNG, WEBP or PDF. Up to 10 MB per file, maximum 3 files per question.',
    ],

];
