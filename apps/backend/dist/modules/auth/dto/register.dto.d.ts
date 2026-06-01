export declare enum Role {
    CLIENT = "CLIENT",
    ENGINEER = "ENGINEER",
    WORKER = "WORKER",
    COMPANY = "COMPANY",
    SUPPLIER = "SUPPLIER"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    phone?: string;
    district?: string;
}
