export interface RequestUser {
    id: string;
    email: string;
    role: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
