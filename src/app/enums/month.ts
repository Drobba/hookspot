export enum Month {
  JANUARY = 0,
  FEBRUARY = 1,
  MARCH = 2,
  APRIL = 3,
  MAY = 4,
  JUNE = 5,
  JULY = 6,
  AUGUST = 7,
  SEPTEMBER = 8,
  OCTOBER = 9,
  NOVEMBER = 10,
  DECEMBER = 11
}

export const MONTH_NAMES: Record<Month, string> = {
  [Month.JANUARY]: 'Jan.',
  [Month.FEBRUARY]: 'Feb.',
  [Month.MARCH]: 'Mar.',
  [Month.APRIL]: 'Apr.',
  [Month.MAY]: 'Maj.',
  [Month.JUNE]: 'Jun.',
  [Month.JULY]: 'Jul.',
  [Month.AUGUST]: 'Aug.',
  [Month.SEPTEMBER]: 'Sep.',
  [Month.OCTOBER]: 'Okt.',
  [Month.NOVEMBER]: 'Nov.',
  [Month.DECEMBER]: 'Dec.'
};

export function getMonthName(month: Month): string {
  return MONTH_NAMES[month];
}

export function getMonthByIndex(index: number): Month | undefined {
  if (index >= 0 && index <= 11) {
    return index as Month;
  }
  return undefined;
} 