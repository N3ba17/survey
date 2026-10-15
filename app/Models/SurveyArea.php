<?php

namespace App\Models;

use Database\Factories\SurveyAreaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveyArea extends Model
{
    /** @use HasFactory<SurveyAreaFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'position',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    /**
     * Questions asked in this area, in display order.
     *
     * @return HasMany<SurveyQuestion, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class)->orderBy('position');
    }

    /**
     * Active questions asked in this area, in display order.
     *
     * @return HasMany<SurveyQuestion, $this>
     */
    public function activeQuestions(): HasMany
    {
        return $this->questions()->where('active', true);
    }
}
