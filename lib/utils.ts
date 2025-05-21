import { Timestamp } from "firebase/firestore"; // Import Timestamp

export function formatDate(dateInput: Date | Timestamp | string): string {
  let date: Date;
  if (typeof (dateInput as Timestamp)?.toDate === "function") {
    date = (dateInput as Timestamp).toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = new Date(dateInput as string); // Fallback for string dates
  }

  // Check if date is valid after conversion
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Or handle as appropriate
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(" ")
}

