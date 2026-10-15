<?php

namespace App\Models;

use Database\Factories\SurveyQuestionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read list<string>|null $answer_options
 */
class SurveyQuestion extends Model
{
    /** @use HasFactory<SurveyQuestionFactory> */
    use HasFactory;

    /** Attachment may be uploaded but is not demanded. */
    public const string ATTACHMENT_OPTIONAL = 'optional';

    /** At least one file must be uploaded with the answer. */
    public const string ATTACHMENT_REQUIRED = 'required';

    /** No file upload is offered for this question. */
    public const string ATTACHMENT_NONE = 'none';

    /** A single-line text answer. */
    public const string ANSWER_TEXT = 'text';

    /** A multi-line text answer. */
    public const string ANSWER_TEXTAREA = 'textarea';

    /** A whole-number answer. */
    public const string ANSWER_NUMBER = 'number';

    /** One option picked from the question's answer_options list. */
    public const string ANSWER_RADIO = 'radio';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'survey_area_id',
        'slug',
        'position',
        'priority',
        'question',
        'guidance',
        'answer_type',
        'answer_options',
        'attachment_requirement',
        'attachment_label',
        'active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'priority' => 'boolean',
            'answer_options' => 'array',
            'active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<SurveyArea, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(SurveyArea::class, 'survey_area_id');
    }

    /**
     * @return HasMany<SurveyAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(SurveyAnswer::class);
    }

    /**
     * Whether a file upload is offered for this question.
     */
    public function acceptsAttachment(): bool
    {
        return $this->attachment_requirement !== self::ATTACHMENT_NONE;
    }

    /**
     * Whether a file upload must accompany the answer.
     */
    public function requiresAttachment(): bool
    {
        return $this->attachment_requirement === self::ATTACHMENT_REQUIRED;
    }

    /**
     * Active questions, ordered by area then position.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('active', true);
    }
}
