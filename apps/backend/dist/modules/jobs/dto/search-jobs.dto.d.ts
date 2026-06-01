declare enum JobStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class SearchJobsDto {
    district?: string;
    profession?: string;
    skill?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: JobStatus;
    keyword?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
}
export {};
