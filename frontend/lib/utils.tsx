import { ImageSourcePropType } from "react-native";

const DEFAULT_FOOD_IMAGE = require("../assets/no-pictures.png");

const GREETINGS = [
  { untilHour: 5, text: "Good night" },
  { untilHour: 12, text: "Good morning" },
  { untilHour: 17, text: "Good afternoon" },
  { untilHour: 21, text: "Good evening" },
  { untilHour: 24, text: "Good night" },
];

export function getDatetime(date = new Date()): Date {
  return date;
}

export function getDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function prettierDatetime(date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function shortDatetime(date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function getGreeting(date = new Date()): string {
  const currentHour = date.getHours();
  const match = GREETINGS.find((slot) => currentHour < slot.untilHour);
  return match?.text ?? "Hello";
}

export function addComma(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function prettyFoodName(foodName: string): string {
  if (!foodName) return "";

  // 1. Remove all numbers and extra spaces
  const cleaned = foodName.replace(/\d+/g, "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  // 2. Lowercase everything, then uppercase only the first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export function imageSource(
  picLink?: string | ImageSourcePropType | null,
  hasError = false,
): ImageSourcePropType {
  if (!picLink || hasError) return DEFAULT_FOOD_IMAGE;
  if (typeof picLink === "string") {
    const trimmed = picLink.trim();
    if (!trimmed) return DEFAULT_FOOD_IMAGE;
    return {
      uri: trimmed,
      headers: {
        "User-Agent":
          process.env.OFF_USER_AGENT ||
          "Motivi - App and Web - Version 1.0 - vmmn27@gmail.com",
      },
    };
  }
  return picLink;
}