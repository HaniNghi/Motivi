import {
    clearSession,
    getAccessToken,
    getRefreshToken,
    saveSession,
} from "../lib/storage";
import { ApiError, Error, UserSession } from "../lib/types";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

let isRefreshingPromise: Promise<string | null> | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
    if (isRefreshingPromise !== null) {
        return isRefreshingPromise;
    }
    isRefreshingPromise = (async () => {
        try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                return null;
            }
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!response.ok) {
                await clearSession();
                return null;
            }
            const data = (await response.json()) as UserSession;
            await saveSession(data.access_token, data.refresh_token, data.user);
            return data.access_token;
        } catch (error) {
            return null;
        } finally {
            isRefreshingPromise = null;
        }
    })();
    console.log("isRefreshingPromise", isRefreshingPromise)

    return isRefreshingPromise;
};

export const handleError = async (errorResponse: any): Promise<any> => {
    try {
        const error = await errorResponse.json();
        console.log(error)
        return {
            code: error?.error?.code,
            message: error?.error?.message,
        };
    } catch {
        return {
            code: "unknown_error",
            message: "Something went wrong.",
        };
    }
};

export const callApi = async (
    method: string,
    endpoint: string,
    payload?: any,
    auth?: boolean,
) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (auth) {
        const token = await getAccessToken();
        headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body:
            payload !== undefined &&
                payload !== null &&
                method !== "GET" &&
                method !== "DELETE"
                ? JSON.stringify(payload)
                : undefined,
    });

    console.log("response1", response)
    if (auth && response.status === 401) {
        const newToken = await refreshAccessToken();
        console.log("newToken", newToken)
        headers.Authorization = `Bearer ${newToken}`;

        response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body:
                payload !== undefined &&
                    payload !== null &&
                    method !== "GET" &&
                    method !== "DELETE"
                    ? JSON.stringify(payload)
                    : undefined,
        });
    }
    console.log("response2", response)

    return response;
};
