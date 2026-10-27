import {
    CreateUser,
    User,
    UserSession,
    ApiError,
    ApiResult,
    LoginUser,
} from "../lib/types";
import { callApi, handleError } from "./helper";

export const createUser = async (payload: CreateUser): Promise<UserSession> => {
    try {
        const response = await callApi("POST", "/auth/register", payload);
        if (!response.ok) {
            const err = await handleError(response);
            throw new Error(err.message);
        }
        const newUser: UserSession = await response.json();
        return newUser;
    } catch (error: any) {
        throw error;
    }
};

export const loginUser = async (payload: LoginUser): Promise<UserSession> => {
    try {
        const response = await callApi("POST", "/auth/login", payload);
        if (!response.ok) {
            const err = await handleError(response);
            throw new Error(err.message);
        }

        const loggedUser: UserSession = await response.json();
        return loggedUser
    } catch (error: any) {
        throw error;
    }
};
