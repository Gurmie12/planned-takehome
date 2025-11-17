import dayjs from "dayjs";

export function dateToLocalDateTimeInput(date: Date): string {
  return dayjs(date).format("YYYY-MM-DDTHH:mm");
}

