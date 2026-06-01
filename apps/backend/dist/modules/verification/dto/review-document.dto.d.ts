export declare enum VerificationDecision {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class ReviewDocumentDto {
    decision: VerificationDecision;
    adminNote?: string;
}
