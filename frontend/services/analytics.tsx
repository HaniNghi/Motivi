import { WeekAnalytics } from "../lib/types";
import { callApi, handleError } from "./helper";

export async function getWeek(date: string ): Promise<WeekAnalytics>{
    try {
        const response = await callApi("GET", `/analytics/week?start=${date}`, null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const diary: WeekAnalytics = await response.json();
        return diary;
    } catch (error: any) {
        throw error;
    }
}
