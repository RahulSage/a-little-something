/**
 * Birthday clock. Every function takes an absolute instant (epoch ms) and
 * interprets it in `rule.timezone` — never the visitor's local timezone.
 */

export interface BirthdayRule {
  birthdayMonth: number; // 1–12
  birthdayDay: number;
  timezone: string;
}

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type Phase = 'eve' | 'soon' | 'waiting';

export type BirthdayState =
  | { mode: 'birthday'; year: number; endsAt: number }
  | { mode: 'countdown'; target: number; remaining: number; phase: Phase; parts: Duration };

const DAY = 86_400_000;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Wall-clock fields of `ms` as seen in `timeZone`. */
export function zonedParts(ms: number, timeZone: string): ZonedParts {
  const out: Record<string, number> = {};
  for (const p of formatter(timeZone).formatToParts(new Date(ms))) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour % 24, // some engines report midnight as 24
    minute: out.minute,
    second: out.second,
  };
}

/** Instant at which the wall clock in `timeZone` reads the given time. Overflowing fields roll over (day 32 → next month). */
export function zonedTimeToUtc(timeZone: string, year: number, month: number, day: number, hour = 0, minute = 0, second = 0): number {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  let utc = wall;
  // Two passes settle the offset, including across DST changes.
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(utc, timeZone);
    utc += wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  }
  return utc;
}

/** Current wall-clock time in the birthday timezone (IST). */
export const nowInZone = (now: number, rule: BirthdayRule) => zonedParts(now, rule.timezone);

/** 00:00 on the birthday in `year`. */
export const birthdayStart = (year: number, rule: BirthdayRule) =>
  zonedTimeToUtc(rule.timezone, year, rule.birthdayMonth, rule.birthdayDay);

/** 00:00 on the birthday in the given year's calendar — i.e. "this year's birthday". */
export const currentYearBirthday = (now: number, rule: BirthdayRule) => birthdayStart(nowInZone(now, rule).year, rule);

/** Start of the next birthday strictly after `now`. */
export function nextBirthday(now: number, rule: BirthdayRule): number {
  const thisYear = currentYearBirthday(now, rule);
  return now < thisYear ? thisYear : birthdayStart(nowInZone(now, rule).year + 1, rule);
}

export const msUntilBirthday = (now: number, rule: BirthdayRule) => nextBirthday(now, rule) - now;

export function isBirthday(now: number, rule: BirthdayRule): boolean {
  const p = nowInZone(now, rule);
  return p.month === rule.birthdayMonth && p.day === rule.birthdayDay;
}

/** Rounds up to whole seconds, so the display only reads 00:00:00 at the exact instant. */
export function splitDuration(ms: number): Duration {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

export function getBirthdayState(now: number, rule: BirthdayRule): BirthdayState {
  const p = nowInZone(now, rule);
  if (p.month === rule.birthdayMonth && p.day === rule.birthdayDay) {
    return {
      mode: 'birthday',
      year: p.year,
      endsAt: zonedTimeToUtc(rule.timezone, p.year, rule.birthdayMonth, rule.birthdayDay + 1),
    };
  }

  const target = nextBirthday(now, rule);
  const remaining = target - now;
  const eve = zonedParts(target - 1, rule.timezone); // the calendar day just before the birthday
  const phase: Phase =
    eve.year === p.year && eve.month === p.month && eve.day === p.day ? 'eve' : remaining < 7 * DAY ? 'soon' : 'waiting';

  return { mode: 'countdown', target, remaining, phase, parts: splitDuration(remaining) };
}
