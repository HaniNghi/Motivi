import { CustomPayload, Food, SearchedFood } from "../lib/types";
import { callApi, handleError } from "./helper";

export async function getFoods(input: string, limit: number): Promise<SearchedFood>{
    try {
        const response = await callApi("GET", `/foods?q=${encodeURIComponent(input)}&limit=${limit}`, null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const searchedFoods: SearchedFood = await response.json();
        return searchedFoods;
    } catch (error: any) {
        throw error;
    }
}

export async function postCustomFood(payload: CustomPayload): Promise<Food>{
    try {
        const response = await callApi("POST", `/foods/custom`, payload, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const data: { food: Food } = await response.json();
        return data.food;
    } catch (error: any) {
        throw error;
    }
}

export async function get_saved_food(): Promise<Food[]> {
    try {
        const response = await callApi("GET", `/foods/saved`, null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const data: { saved_food: Food[] } = await response.json();
        return data.saved_food;
    } catch (error: any) {
        throw error;
    }
}
