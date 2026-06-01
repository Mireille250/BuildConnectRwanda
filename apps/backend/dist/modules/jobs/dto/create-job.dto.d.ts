export declare class CreateJobDto {
    title: string;
    description: string;
    district: string;
    budgetMin?: number;
    budgetMax?: number;
    requiredSkills?: string[];
    profession?: string;
    startDate?: string;
    deadline?: string;
}
