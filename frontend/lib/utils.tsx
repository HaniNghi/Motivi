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
  return date.toISOString().split('T')[0];
}

export function prettierDatetime(date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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
