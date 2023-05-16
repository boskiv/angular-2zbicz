import dayjs from 'dayjs';

export type TCalcData = {
  Symbol: string;
  Value: number;
};

export function getNextBarTime(barTime?: number, interval?: string) {
  const d = getSeconds(interval!);
  const date = new Date(barTime!);
  date.setTime(date.getTime() + d * 1000);
  return date.getTime();
}

export function isExpiredInSeconds(timestamp: number, expiration: number) {
  return dayjs().unix() > dayjs(timestamp).add(expiration, 'seconds').unix();
}

function getSeconds(str: string) {
  let sec = 0;
  const months = str.match(/(\d+)\s*M/);
  const week = str.match(/(\d+)\s*w/);
  const days = str.match(/(\d+)\s*d/);
  const hours = str.match(/(\d+)\s*h/);
  const minutes = str.match(/(\d+)\s*m/);
  const seconds = str.match(/(\d+)\s*s/);
  if (months) {
    sec += parseInt(months[1]) * 86400 * 30;
  }
  if (week) {
    sec += parseInt(week[1]) * 86400 * 7;
  }
  if (days) {
    sec += parseInt(days[1]) * 86400;
  }
  if (hours) {
    sec += parseInt(hours[1]) * 3600;
  }
  if (minutes) {
    sec += parseInt(minutes[1]) * 60;
  }
  if (seconds) {
    sec += parseInt(seconds[1]);
  }
  return sec;
}

export function findLegsName(formula: string, isUnique: boolean): string[] {
  formula = formula.replaceAll(' ', '');
  const legs = formula.match(/(\d*[a-zA-Z]+\d*)+/g);
  if (legs) {
    if (isUnique) {
      return Array.from(new Set(legs));
    }
    return legs;
  }
  return [];
}

export function prepareFormula(formula: string): string {
  const symbols = findLegsName(formula, true);
  formula = formula.replaceAll(' ', '');
  for (const symbol of symbols) {
    formula = formula.replace(symbol, '[' + symbol + ']');
  }
  return formula;
}
