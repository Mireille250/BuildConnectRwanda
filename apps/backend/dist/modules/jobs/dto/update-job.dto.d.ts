declare enum JobStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class UpdateJobDto {
    title?: string;
    description?: string;
    district?: string;
    budgetMin?: number;
    budgetMax?: number;
    requiredSkills?: string[];
    profession?: string;
    status?: JobStatus;
    startDate?: string;
    deadline?: string;
}
export {};
