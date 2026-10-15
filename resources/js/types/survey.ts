export type SurveyAnswerType = 'text' | 'textarea' | 'number' | 'radio';

export type SurveyAttachmentRequirement = 'required' | 'optional' | 'none';

export type SurveyQuestion = {
    id: number;
    priority: boolean;
    question: string;
    answer_type: SurveyAnswerType;
    answer_options: string[] | null;
    attachment_requirement: SurveyAttachmentRequirement;
    attachment_label: string | null;
};

export type SurveyArea = {
    id: number;
    name: string;
    slug: string;
    questions: SurveyQuestion[];
};

export type SurveyUploads = {
    max_kilobytes: number;
    max_files: number;
    mimes: string[];
    disk: string;
    directory: string;
    label: string;
    hint: string;
};

export type SurveyMeta = {
    title: string;
    thanks_message: string;
};

export type SurveyAttachment = {
    id: number;
    survey_response_id: number;
    survey_question_id: number | null;
    path: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    created_at?: string;
};

export type SurveyResponse = {
    id: number;
    company_name: string;
    contact_person: string;
    job_title: string | null;
    email: string;
    country: string | null;
    website: string | null;
    submitted_at: string;
    attachments_count?: number;
    attachments?: SurveyAttachment[];
};

export type ReportDocument = {
    id: number;
    original_name: string;
    mime_type: string;
    size_bytes: number;
};

export type ReportAnswer = {
    id: number;
    priority: boolean;
    question: string;
    guidance: string | null;
    attachment_requirement: SurveyAttachmentRequirement;
    attachment_label: string | null;
    answer: string | null;
    attachments: ReportDocument[];
};

export type ReportSection = {
    area: string;
    questions: ReportAnswer[];
};

export type SurveyTotals = {
    respondents: number;
    attachments: number;
    thisWeek: number;
    lastResponseAt: string | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginator<T> = {
    data: T[];
    current_page: number;
    first_page_url?: string;
    from?: number;
    last_page: number;
    last_page_url?: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to?: number;
    total: number;
};

