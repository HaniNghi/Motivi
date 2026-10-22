import { CreateUser, User, UserSession, ApiError, ApiResult } from "../types";
import { callNonAuthApi, handleError } from "./helper";

export const createUser = async (payload: CreateUser): Promise<ApiResult<UserSession | ApiError>> => {
    try {
        const response = await callNonAuthApi("POST", "/auth/register", payload);

        if (!response.ok) {
            return {
                ok: false,
                error: await handleError(response)
            }
        }

        const newUser: UserSession = await response.json();
        console.log("response", response)
        return {
            ok: true,
            data: newUser
        };
    } catch (error) {
        return {
            ok: false,
            error: await handleError(error)
        }
    }
};
