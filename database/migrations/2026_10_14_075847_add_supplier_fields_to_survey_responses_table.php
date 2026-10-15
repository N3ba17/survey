<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('survey_responses', function (Blueprint $table) {
            $table->dropColumn(['name', 'answers']);
            $table->string('company_name')->after('id');
            $table->string('contact_person')->after('company_name');
            $table->string('job_title')->nullable()->after('contact_person');
            $table->string('phone')->nullable()->after('email');
            $table->string('country')->nullable()->after('phone');
            $table->string('website')->nullable()->after('country');
            $table->text('company_info')->nullable()->after('website');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_responses', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'contact_person',
                'job_title',
                'phone',
                'country',
                'website',
                'company_info',
            ]);
            $table->string('name');
            $table->json('answers');
        });
    }
};
