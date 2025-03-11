export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(" ")
}

