import { SearchedFood } from "../lib/types";
import { callApi, handleError } from "./helper";

export async function getFoods(input: string, limit: number): Promise<SearchedFood>{
    try {
        const response = await callApi("GET", `/foods?q=${encodeURIComponent(input)}&limit=${limit}`, null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const newMe: SearchedFood = await response.json();
        return newMe;
    } catch (error: any) {
        throw error;
    }
}

