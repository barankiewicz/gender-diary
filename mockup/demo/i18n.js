/* Mini i18n layer for the mockup. The app uses Paraglide with full coverage;
   the mockup proves the EN↔PL switch on a sample set of visible strings
   (navigation, greetings, key headings), as the PRD requires. */

import { getState } from './state.js';

const dict = {
  en: {
    nav_home: 'Home', nav_calendar: 'Calendar', nav_stats: 'Stats', nav_settings: 'Settings',
    hello: 'Hi',
    how_feeling: 'How are you feeling?',
    new_entry: 'New entry', quick_saved: 'Saved. It counts.', add_details: 'Add details',
    recent_entries: 'Recent entries', milestones: 'Milestones', last_seven: 'Last 7 days',
    coloured_by: 'coloured by', mood: 'mood',
    today: 'Today', another_day: 'Another day',
    save_entry: 'Save entry', note_label: 'Note', photos_label: 'Photos',
    settings_appearance: 'Appearance', settings_tracking: 'Tracking',
    settings_care: 'Care & reminders', settings_privacy: 'Privacy & data',
    search_placeholder: 'Search notes and tags…',
    streak: 'days in a row',
  },
  pl: {
    nav_home: 'Start', nav_calendar: 'Kalendarz', nav_stats: 'Statystyki', nav_settings: 'Ustawienia',
    hello: 'Cześć',
    how_feeling: 'Jak się dziś czujesz?',
    new_entry: 'Nowy wpis', quick_saved: 'Zapisano. To się liczy.', add_details: 'Dodaj szczegóły',
    recent_entries: 'Ostatnie wpisy', milestones: 'Kamienie milowe', last_seven: 'Ostatnie 7 dni',
    coloured_by: 'kolor według', mood: 'nastrój',
    today: 'Dzisiaj', another_day: 'Inny dzień',
    save_entry: 'Zapisz wpis', note_label: 'Notatka', photos_label: 'Zdjęcia',
    settings_appearance: 'Wygląd', settings_tracking: 'Śledzenie',
    settings_care: 'Opieka i przypomnienia', settings_privacy: 'Prywatność i dane',
    search_placeholder: 'Szukaj w notatkach i tagach…',
    streak: 'dni z rzędu',
  },
};

export function activeLang() {
  const pref = getState().prefs.language;
  if (pref === 'system') return (navigator.language || 'en').startsWith('pl') ? 'pl' : 'en';
  return pref === 'pl' ? 'pl' : 'en';
}

export function t(key) {
  return dict[activeLang()][key] ?? dict.en[key] ?? key;
}
