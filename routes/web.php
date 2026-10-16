<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Route;

Route::get('/survey', [SurveyController::class, 'show'])->name('survey.show');
Route::post('/survey', [SurveyController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('survey.store');

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/respondents', [ReportController::class, 'respondents'])
        ->name('reports.respondents.index');
    Route::get('reports/respondents/{response}', [ReportController::class, 'show'])
        ->name('reports.respondents.show');
    Route::delete('reports/respondents/{response}', [ReportController::class, 'destroy'])
        ->name('reports.respondents.destroy');
    Route::get('reports/attachments/{attachment}', [ReportController::class, 'download'])
        ->name('reports.attachments.download');
});

require __DIR__.'/settings.php';
