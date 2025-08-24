export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  // options for formatting
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",  // Aug
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return date.toLocaleString("en-US", options);
}
