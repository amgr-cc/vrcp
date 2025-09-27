// timestamp: RFC 3339形式の文字列 (toISOString())

export function formatToDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}
export function formatToDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}
export function formatToTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

// Dateオブジェクトを"YY/MM/DD HH:MM"形式に変換

export function dateToShortDatetime(date: Date): string {
  return date.toLocaleString([], {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}