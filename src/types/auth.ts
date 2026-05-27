export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}