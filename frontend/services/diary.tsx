import { DiaryDaySession, EntryPayload } from "../lib/types";
import { callApi, handleError } from "./helper";

export async function getDiaryDay(date: string ): Promise<DiaryDaySession>{
    try {
        const response = await callApi("GET", `/diary?date=${date}`, null, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const diary: DiaryDaySession = await response.json();
        return diary;
    } catch (error: any) {
        throw error;
    }
}

export async function postEntry(payload: EntryPayload): Promise<DiaryDaySession>{
    try {
        const response = await callApi("POST", `/diary/entries`, payload, true)
        if (!response.ok) {
            const err = await handleError(response);
            throw err;
        }
        const newEntry: DiaryDaySession = await response.json();
        return newEntry;
    } catch (error: any) {
        throw error;
    }
}
