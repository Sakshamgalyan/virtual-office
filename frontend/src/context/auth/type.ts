export const SET_USER = "SET_USER";
export const CLEAR_USER = "CLEAR_USER";
export const SET_LOADING = "SET_LOADING";

export interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    mobile?: string;
    role: string;
}

export type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export type AuthAction = {
    type: string;
    payload: any;
}