import type { Reducer } from "react";
import { AuthAction, AuthState } from "./type";
import { SET_USER, CLEAR_USER, SET_LOADING } from "./type";

export const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};


const reducer: Reducer<AuthState, AuthAction> = (
    state,
    action,
) => {
    switch (action.type) {
        case SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
            };
        case CLEAR_USER:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            }
        default:
            return state;
    }
};

export default reducer;
