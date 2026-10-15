<?php

namespace Database\Seeders;

use App\Models\SurveyArea;
use App\Models\SurveyQuestion;
use Illuminate\Database\Seeder;

class SurveySeeder extends Seeder
{
    /**
     * The supplier pre-qualification survey: areas, questions and their
     * evaluation guidance. Keyed by slug so re-seeding updates rows in
     * place and never destroys collected answers.
     */
    public function run(): void
    {
        foreach ($this->areas() as $areaIndex => $area) {
            $areaModel = SurveyArea::updateOrCreate(
                ['slug' => $area['slug']],
                [
                    'name' => $area['name'],
                    'position' => $areaIndex + 1,
                ],
            );

            foreach ($area['questions'] as $questionIndex => $question) {
                SurveyQuestion::updateOrCreate(
                    ['slug' => $question['slug']],
                    [
                        'survey_area_id' => $areaModel->id,
                        'position' => $questionIndex + 1,
                        'priority' => $question['priority'],
                        'question' => $question['question'],
                        'guidance' => $question['guidance'],
                        'answer_type' => $question['answer_type'] ?? SurveyQuestion::ANSWER_TEXTAREA,
                        'answer_options' => $question['answer_options'] ?? null,
                        'attachment_requirement' => $question['attachment_requirement'],
                        'attachment_label' => $question['attachment_label'],
                        'active' => true,
                    ],
                );
            }
        }
    }

    /**
     * The survey structure, in display order.
     *
     * @return list<array{name: string, slug: string, questions: list<array<string, mixed>>}>
     */
    private function areas(): array
    {
        return [
            [
                'name' => 'Company',
                'slug' => 'company',
                'questions' => [
                    [
                        'slug' => 'manufacturer-or-trader',
                        'priority' => true,
                        'question' => 'Are you the manufacturer or a trading company? Can I see your business licence?',
                        'guidance' => 'Manufacturer with licence showing production scope. Red flag: vague answer, no licence',
                        'answer_type' => SurveyQuestion::ANSWER_RADIO,
                        'answer_options' => [
                            'Direct Manufacturer',
                            'Trading Company',
                            'Manufacturer with Trading Subsidiary',
                        ],
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
                        'attachment_label' => 'Business licence (showing production scope)',
                    ],
                    [
                        'slug' => 'years-manufacturing-exporting',
                        'priority' => true,
                        'question' => 'How many years have you been manufacturing and exporting this product?',
                        'guidance' => '5+ years exporting; stable ownership',
                        'answer_type' => SurveyQuestion::ANSWER_NUMBER,
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_NONE,
                        'attachment_label' => null,
                    ],
                ],
            ],
            [
                'name' => 'Manufacturing capacity',
                'slug' => 'manufacturing-capacity',
                'questions' => [
                    [
                        'slug' => 'monthly-production-capacity',
                        'priority' => true,
                        'question' => 'What is your monthly production capacity for this product?',
                        'guidance' => 'Clear figure (e.g., 200,000 m²/month); matches factory size',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_OPTIONAL,
                        'attachment_label' => 'Factory profile / production capacity statement',
                    ],
                    [
                        'slug' => 'sample-and-container-lead-time',
                        'priority' => true,
                        'question' => "What is the lead time for a sample and for a 40' container order?",
                        'guidance' => 'Samples 7–15 days; production 20–45 days depending on product',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_NONE,
                        'attachment_label' => null,
                    ],
                ],
            ],
            [
                'name' => 'Quality control',
                'slug' => 'quality-control',
                'questions' => [
                    [
                        'slug' => 'qc-steps',
                        'priority' => true,
                        'question' => 'What QC steps do you perform (incoming, in-process, final)? Can I see a QC report?',
                        'guidance' => 'Documented QC procedure and sample inspection reports',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
                        'attachment_label' => 'Sample QC / inspection report',
                    ],
                    [
                        'slug' => 'third-party-inspection',
                        'priority' => true,
                        'question' => 'Do you accept third-party pre-shipment inspection (SGS, BV, Intertek, QIMA)?',
                        'guidance' => 'Yes without hesitation. Red flag: refuses inspection',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_NONE,
                        'attachment_label' => null,
                    ],
                ],
            ],
            [
                'name' => 'Certifications & standards',
                'slug' => 'certifications-standards',
                'questions' => [
                    [
                        'slug' => 'certifications-held',
                        'priority' => true,
                        'question' => 'Which certifications do you hold (ISO 9001, ISO 14001, CE, IEC/CB, UL, etc.)? Please send copies.',
                        'guidance' => "Valid certificates from accredited bodies, in the company's own name",
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
                        'attachment_label' => 'Copies of ISO / CE / IEC / UL certificates',
                    ],
                    [
                        'slug' => 'product-standard-compliance',
                        'priority' => true,
                        'question' => 'Which international standard does the product comply with (EN, BS, ASTM, IEC)?',
                        'guidance' => 'Test reports from recognised labs (TÜV, SGS, Intertek) not older than 2–3 years',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
                        'attachment_label' => 'Product test reports (TÜV, SGS, Intertek)',
                    ],
                ],
            ],
            [
                'name' => 'Project references',
                'slug' => 'project-references',
                'questions' => [
                    [
                        'slug' => 'east-africa-projects',
                        'priority' => true,
                        'question' => 'Which projects in Ethiopia or East Africa have used your products?',
                        'guidance' => 'Named projects with contact person or photos',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
                        'attachment_label' => 'Project reference list with photos',
                    ],
                ],
            ],
            [
                'name' => 'After-sales & warranty',
                'slug' => 'after-sales-warranty',
                'questions' => [
                    [
                        'slug' => 'warranty-terms',
                        'priority' => true,
                        'question' => 'What is the warranty period and what exactly does it cover?',
                        'guidance' => 'Written warranty (e.g., 2–5 yrs electrical/MEP, 10+ yrs sanitary ceramics)',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_REQUIRED,
                        'attachment_label' => 'Written warranty certificate / terms',
                    ],
                ],
            ],
            [
                'name' => 'Export & logistics',
                'slug' => 'export-logistics',
                'questions' => [
                    [
                        'slug' => 'djibouti-shipping',
                        'priority' => true,
                        'question' => 'Have you shipped to Djibouti port for Ethiopia? Which forwarder?',
                        'guidance' => 'Yes, familiar with transit documents',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_NONE,
                        'attachment_label' => null,
                    ],
                ],
            ],
            [
                'name' => 'Commercial terms',
                'slug' => 'commercial-terms',
                'questions' => [
                    [
                        'slug' => 'moq-trial-order',
                        'priority' => true,
                        'question' => 'What is the MOQ, and can you accept a smaller trial order?',
                        'guidance' => 'Flexible trial order (e.g., 1 × 20\' mixed)',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_NONE,
                        'attachment_label' => null,
                    ],
                    [
                        'slug' => 'payment-terms',
                        'priority' => true,
                        'question' => 'What payment terms do you accept – LC at sight, CAD, T/T 30/70?',
                        'guidance' => 'Accepts LC or 30% deposit / 70% against B/L copy. Red flag: 100% advance only',
                        'attachment_requirement' => SurveyQuestion::ATTACHMENT_OPTIONAL,
                        'attachment_label' => 'Proforma invoice showing payment terms',
                    ],
                ],
            ],
        ];
    }
}
