import { StringWithAutocomplete } from "@testing-library/react-native/dist/types";

export type ApiResult<UserSession> =
  | { ok: true; data: UserSession }
  | { ok: false; error: { code: string; message: string } };

export type ActiveLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"
export type Gender = "male" | "female"
export type Goal = "lose" | "maintain" | "gain"

export interface ApiError {
    code: string,
    message: string
}

export interface Error {
    error: {
        code: string,
        message: string,
    }
}

export interface CreateUser {
    email: string,
    password: string,
    display_name: string,
}

export interface User {
    id: string,
    email: string,
    display_name: string,
}

export interface LoginUser {
    email: string,
    password: string,
}

export interface UserSession {
    user: User,
    access_token: string,
    refresh_token: string,
    token_type: string,
    expires_in: string,
}

export interface MeSession {
    user: User,
    onboarding_completed: boolean,
    profile: Profile
}

export interface Profile {
    activity_level: ActiveLevel,
    age: number,
    bmr: number,
    gender: Gender,
    goal: Goal,
    height_cm: number,
    target_calories: number,
    target_carbs_g: number,
    target_fat_g: number,
    target_protein_g: number,
    tdee: number,
    weight_kg: number
}

export interface CreateProfile {
    age: number,
    gender: Gender,
    height_cm: number,
    weight_kg: number
    activity_level: ActiveLevel,
    goal: Goal,
}

export interface NutritionTotals {
    calories: number,
    protein_g: number,
    carbs_g: number,
    fat_g: number
}

export interface Entry {
    id: string,
    food_id: string,
    food_name: string,
    amount_g: number,
    calories: number,
    protein_g: number,
    carbs_g: number,
    fat_g: number
}
export interface DiaryDaySession {
    "date": string,
    "target": NutritionTotals,
    "consumed": NutritionTotals,
    "remaining": NutritionTotals,
    "entries": Entry[]
}