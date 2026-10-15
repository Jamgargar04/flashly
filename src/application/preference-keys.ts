/** Claves de las preferencias del usuario guardadas en el teléfono. */
export const PREFERENCES = {
  onboarded: 'flashly.onboarded',
  windowOverride: 'flashly.window.override',
  reminders: 'flashly.reminders',
  remindersAsked: 'flashly.reminders.asked',
  eventReminders: 'flashly.events.reminders',
  chatLastSeen: 'flashly.chat.lastSeen',
  /** Lista de "amigos" de versiones anteriores (solo en el teléfono); se migra a "seguir". */
  legacyFriends: 'flashly.friends',
  theme: 'flashly.theme',
  lang: 'flashly.lang',
  largeFonts: 'flashly.largeFonts',
} as const;
