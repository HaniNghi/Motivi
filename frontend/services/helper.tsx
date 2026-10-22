import { ApiError, Error } from "../types";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;



export const handleError = async (errorResponse: any): Promise<ApiError> => {
    try {
        const error = await errorResponse.json()
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
    token?: string,
) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: payload !== undefined && payload !== null && method !== "GET" && method !== "DELETE"
            ? JSON.stringify(payload)
            : undefined,
    });

    return response;
};

export const callNonAuthApi = async (
    method: string,
    endpoint: string,
    payload?: any,
) => {
    return callApi(method, endpoint, payload);
};

export const callAuthApi = async (
    method: string,
    endpoint: string,
    token: string,
    payload?: any,
) => {
    return callApi(method, endpoint, payload, token);
};
