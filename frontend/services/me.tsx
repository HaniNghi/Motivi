import {CreateProfile, MeSession } from "../lib/types";
import { callApi, handleError } from "./helper";

export async function getMe(): Promise<MeSession>{
    try {
        const response = await callApi("GET", "/me", null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const newMe: MeSession = await response.json();
        return newMe;
    } catch (error: any) {
        throw error;
    }
}

export async function postProfile(payload: CreateProfile): Promise<MeSession>{
    try {
        const response = await callApi("POST", "/me", payload, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const newProfile: MeSession = await response.json();
        return newProfile;
    } catch (error: any) {
        throw error;
    }
}