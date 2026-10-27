import { ApiError, MeSession } from "../lib/types";
import { callApi, handleError } from "./helper";

export async function getMe(): Promise<MeSession>{
    try {
        const response = await callApi("GET", "/me", null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw new Error(err.message);
        }
        const newMe: MeSession = await response.json();
        return newMe;
    } catch (error: any) {
        throw error;
    }
}