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
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_area_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('priority')->default(false);
            $table->text('question');
            $table->text('guidance')->nullable();
            $table->string('answer_type')->default('textarea');
            $table->string('attachment_requirement')->default('none');
            $table->string('attachment_label')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
    }
};
