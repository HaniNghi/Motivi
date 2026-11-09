import { StringWithAutocomplete } from "@testing-library/react-native/dist/types";

export type ApiResult<UserSession> =
  | { ok: true; data: UserSession }
  | { ok: false; error: { code: string; message: string } };

export type ActiveLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Gender = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";
export type Source = "off" | "seed" | "custom";
export interface ApiError {
  code: string;
  message: string;
}

export interface Error {
  error: {
    code: string;
    message: string;
  };
}

export interface CreateUser {
  email: string;
  password: string;
  display_name: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface UserSession {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
}

export interface MeSession {
  user: User;
  onboarding_completed: boolean;
  profile: Profile;
}

export interface Profile {
  activity_level: ActiveLevel;
  age: number;
  bmr: number;
  gender: Gender;
  goal: Goal;
  height_cm: number;
  target_calories: number;
  target_carbs_g: number;
  target_fat_g: number;
  target_protein_g: number;
  tdee: number;
  weight_kg: number;
}

export interface CreateProfile {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActiveLevel;
  goal: Goal;
}

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
export interface Entry {
  id: string;
  food_id: string;
  food_name: string;
  amount_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  image_url?: string | null;
}
export interface DiaryDaySession {
  date: string;
  target: NutritionTotals;
  consumed: NutritionTotals;
  remaining: NutritionTotals;
  entries: Entry[];
  entry?: Entry;
}

export interface Food {
  id: string;
  brand: string | null;
  calories_per_100g: number;
  calories_per_100ml: number | null;
  carbs_per_100g: number;
  fat_per_100g: number;
  image_url: string | null;
  name: string;
  off_code: string | null;
  protein_per_100g: number;
  source: Source;
}

export interface SearchedFood {
  fetched_from_open_food_facts: boolean;
  foods: Food[];
  query: string;
}

export interface EntryPayload {
  food_id: string;
  date: string;
  amount_g: number;
}

export interface CustomPayload {
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface DaySummary {
  calories: number;
  carbs_g: number;
  date: string;
  fat_g: number;
  protein_g: number;
}

export interface WeekAnalytics {
  days: DaySummary[];
  target_calories: number;
  week_end: string;
  week_start: string;
}
