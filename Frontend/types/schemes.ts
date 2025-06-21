export interface GovernmentScheme {
    id: string;
    name: string;
    description: string;
    eligibility: string;
    benefits: string;
    applicationProcess: string;
    startDate: string;
    endDate: string;
    contactInfo: string;
    website: string;
}

export interface SchemeResponse {
    schemes: GovernmentScheme[];
    totalCount: number;
}