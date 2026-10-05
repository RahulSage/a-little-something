import { describe, expect, it } from 'vitest';
import {
  birthdayStart,
  getBirthdayState,
  isBirthday,
  msUntilBirthday,
  nextBirthday,
  nowInZone,
  splitDuration,
  zonedTimeToUtc,
  type BirthdayRule,
} from './time';

const rule: BirthdayRule = { birthdayMonth: 10, birthdayDay: 6, timezone: 'Asia/Kolkata' };
const ist = (s: string) => Date.parse(`${s}+05:30`);

describe('IST helpers', () => {
  it('reads IST wall clock regardless of host timezone', () => {
    expect(nowInZone(Date.parse('2026-10-05T18:30:00Z'), rule)).toEqual({
      year: 2026, month: 10, day: 6, hour: 0, minute: 0, second: 0,
    });
  });

  it('birthday starts at 00:00 IST (18:30 UTC the day before)', () => {
    expect(birthdayStart(2026, rule)).toBe(Date.parse('2026-10-05T18:30:00Z'));
  });

  it('zonedTimeToUtc handles a DST zone', () => {
    // New York: EDT (UTC-4) in October, EST (UTC-5) in January
    expect(zonedTimeToUtc('America/New_York', 2026, 10, 6)).toBe(Date.parse('2026-10-06T04:00:00Z'));
    expect(zonedTimeToUtc('America/New_York', 2027, 1, 1)).toBe(Date.parse('2027-01-01T05:00:00Z'));
  });
});

describe('getBirthdayState boundaries', () => {
  it('5 Oct 23:59:59 IST → countdown (eve), 1s left', () => {
    const s = getBirthdayState(ist('2026-10-05T23:59:59'), rule);
    expect(s.mode).toBe('countdown');
    if (s.mode !== 'countdown') return;
    expect(s.phase).toBe('eve');
    expect(s.target).toBe(ist('2026-10-06T00:00:00'));
    expect(s.parts).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 });
  });

  it('5 Oct 23:59:59.999 IST → still countdown, never shows 00:00:00 early', () => {
    const s = getBirthdayState(ist('2026-10-05T23:59:59.999'), rule);
    expect(s.mode).toBe('countdown');
    if (s.mode === 'countdown') expect(s.parts.seconds).toBe(1);
  });

  it('5 Oct 22:00 IST → eve, 2 hours', () => {
    const s = getBirthdayState(ist('2026-10-05T22:00:00'), rule);
    expect(s).toMatchObject({ mode: 'countdown', phase: 'eve', parts: { days: 0, hours: 2, minutes: 0, seconds: 0 } });
  });

  it('5 Oct 00:00 IST → eve with exactly one day left', () => {
    const s = getBirthdayState(ist('2026-10-05T00:00:00'), rule);
    expect(s).toMatchObject({ mode: 'countdown', phase: 'eve', parts: { days: 1, hours: 0 } });
  });

  for (const t of ['2026-10-06T00:00:00', '2026-10-06T12:00:00', '2026-10-06T23:59:59', '2026-10-06T23:59:59.999']) {
    it(`${t} IST → birthday`, () => {
      const s = getBirthdayState(ist(t), rule);
      expect(s).toEqual({ mode: 'birthday', year: 2026, endsAt: ist('2026-10-07T00:00:00') });
      expect(isBirthday(ist(t), rule)).toBe(true);
    });
  }

  it('7 Oct 00:00 IST → countdown to 6 Oct 2027', () => {
    const s = getBirthdayState(ist('2026-10-07T00:00:00'), rule);
    expect(s).toMatchObject({ mode: 'countdown', phase: 'waiting', target: ist('2027-10-06T00:00:00') });
    if (s.mode === 'countdown') expect(s.parts).toEqual({ days: 364, hours: 0, minutes: 0, seconds: 0 });
  });

  it('31 Dec → next birthday is next year', () => {
    expect(nextBirthday(ist('2026-12-31T23:59:59'), rule)).toBe(ist('2027-10-06T00:00:00'));
  });

  it('1 Jan → birthday in the same (new) year', () => {
    expect(nextBirthday(ist('2027-01-01T00:00:00'), rule)).toBe(ist('2027-10-06T00:00:00'));
    // 1 Jan IST is still 31 Dec in UTC — must not pick the old year
    expect(nextBirthday(Date.parse('2026-12-31T19:00:00Z'), rule)).toBe(ist('2027-10-06T00:00:00'));
  });

  it('keeps working in later years, incl. leap years', () => {
    expect(nextBirthday(ist('2028-02-29T10:00:00'), rule)).toBe(ist('2028-10-06T00:00:00'));
    expect(nextBirthday(ist('2051-10-07T00:00:00'), rule)).toBe(ist('2052-10-06T00:00:00'));
  });

  it('within a week → soon', () => {
    expect(getBirthdayState(ist('2026-09-30T12:00:00'), rule)).toMatchObject({ phase: 'soon' });
    expect(getBirthdayState(ist('2026-09-20T12:00:00'), rule)).toMatchObject({ phase: 'waiting' });
  });

  it('a visitor in New York on their 5 Oct evening sees birthday (already 6 Oct in IST)', () => {
    expect(getBirthdayState(Date.parse('2026-10-05T20:00:00-04:00'), rule).mode).toBe('birthday');
  });

  it('a visitor in Sydney on their 6 Oct morning still sees the countdown (5 Oct in IST)', () => {
    expect(getBirthdayState(Date.parse('2026-10-06T03:00:00+11:00'), rule)).toMatchObject({ mode: 'countdown', phase: 'eve' });
  });

  it('a visitor in London on their 6 Oct evening sees countdown to next year (7 Oct in IST)', () => {
    expect(getBirthdayState(Date.parse('2026-10-06T20:00:00+01:00'), rule)).toMatchObject({
      mode: 'countdown',
      target: ist('2027-10-06T00:00:00'),
    });
  });

  it('msUntilBirthday matches the target', () => {
    expect(msUntilBirthday(ist('2026-10-05T16:02:28'), rule)).toBe((7 * 3600 + 57 * 60 + 32) * 1000);
  });
});

describe('splitDuration', () => {
  it('rounds up partial seconds and clamps negatives', () => {
    expect(splitDuration(500)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 });
    expect(splitDuration(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(splitDuration(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(splitDuration((364 * 86400 + 7 * 3600 + 42 * 60 + 18) * 1000)).toEqual({ days: 364, hours: 7, minutes: 42, seconds: 18 });
  });
});
