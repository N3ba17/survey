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
        Schema::table('survey_answers', function (Blueprint $table) {
            $table->dropColumn('evidence_seen');
        });

        Schema::table('survey_responses', function (Blueprint $table) {
            $table->dropColumn(['phone', 'company_info']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_answers', function (Blueprint $table) {
            $table->string('evidence_seen', 16)->nullable();
        });

        Schema::table('survey_responses', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('company_info')->nullable()->after('website');
        });
    }
};
