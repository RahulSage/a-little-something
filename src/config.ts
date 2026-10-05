/**
 * Everything personal lives here. Edit this file to change any text on the site.
 * Blank lines inside `personalMessage` become separate paragraphs.
 */
export const birthdayConfig = {
  name: 'Pasandida Aurat',
  birthdayMonth: 10, // 1–12
  birthdayDay: 6,
  timezone: 'Asia/Kolkata', // the site always follows this clock, wherever it's opened

  dateLabel: '06 • October',
  forMy: 'for my',

  countdown: {
    // the day before her birthday (in IST)
    eve: { title: 'Tomorrow is her day ✨', note: 'Midnight. Something will be waiting here.' },
    // less than a week away
    soon: { title: 'Just a little longer…', note: 'Come back on 6 October. Something will be waiting.' },
    // the rest of the year
    waiting: { title: 'Until we celebrate her again…', note: 'Some dates are worth waiting for.' },
    labels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
  },

  birthday: {
    title: 'Happy Birthday,',
    subline: 'Today belongs to you.',
    scrollCue: 'a little more',
  },

  messageGreeting: 'To my Pasandida Aurat,',
  personalMessage: `There are people who somehow make ordinary days feel a little better simply by existing.

Today is your day.

So here's a tiny corner of the internet made just for you.`,
  messageSignoff: 'Happy Birthday. ❤️',

  secretPrompt: 'Before you go…',
  secretButton: 'One More Thing…',
  secretMessage: "I'm really glad this world got you on 6 October.",
  secretFollowUp: "And I'm even more glad that somewhere along the way, I got to know you.",

  wishPrompt: 'Close your eyes. Make it a good one.',
  wishButton: 'Make a Birthday Wish',
  wishAgain: 'Make another wish',
  wishSent: 'Wish officially sent to the universe ✨',

  /** Images live in /public/photos. Swap files or edit alt text here. */
  photos: {
    crown: { src: 'photos/badge-birthday-queen.webp', alt: 'Birthday Queen', width: 635, height: 640 },
    secretBadge: { src: 'photos/badge-sunset-princess.webp', alt: 'Sunset Princess', width: 632, height: 640 },
    sittingSticker: { src: 'photos/sticker-sitting.webp', alt: '', width: 560, height: 690 },
    walkingSticker: { src: 'photos/sticker-sunset-walk.webp', alt: '', width: 560, height: 697 },
    galleryTitle: 'A few frames of you',
    galleryHint: 'swipe or tap',
    gallery: [
      { src: 'photos/happy-birthday-sunset.webp', alt: 'Her walking along the shore at sunset — Happy Birthday to my Pasandida Aurat' },
      { src: 'photos/celebrating-you-river.webp', alt: 'Scrapbook: Celebrating You, my Pasandida Aurat, by the river' },
      { src: 'photos/happy-birthday-river.webp', alt: 'Her sitting on a rock by a golden river — Happy Birthday' },
      { src: 'photos/celebrating-you-sunset.webp', alt: 'Scrapbook of sunset notes: Celebrating You' },
    ],
  },
  endingLine: "Here's to many more sunsets.",

  footerMessage: 'Made with ❤️ for one particular human.',
  footerDate: '06.10',
};

export type BirthdayConfig = typeof birthdayConfig;
