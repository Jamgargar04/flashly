import { ImageAnnotatorClient } from '@google-cloud/vision';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

const TIME_ZONE = 'America/Mexico_City';
const FROM_HOUR = 9;
const TO_HOUR = 20;
const WINDOW_MINUTES = 2;

/** Mismo cálculo que la app (src/lib/window.ts): la hora sorpresa sale de la fecha. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayId(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return parts; // AAAA-MM-DD
}

/** Registra la ventana del día. Corre todos los días a las 00:05 hora del centro de México. */
export const openDailyWindow = onSchedule({ schedule: '5 0 * * *', timeZone: TIME_ZONE }, async () => {
  const day = todayId();
  const minute = hash('flashly-' + day) % ((TO_HOUR - FROM_HOUR) * 60);
  const startMinute = FROM_HOUR * 60 + minute;
  await getFirestore().doc(`windows/${day}`).set({
    day,
    startMinute,
    durationMinutes: WINDOW_MINUTES,
    createdAt: FieldValue.serverTimestamp(),
  });
  logger.info('Ventana del día registrada', { day, hora: `${Math.floor(startMinute / 60)}:${String(startMinute % 60).padStart(2, '0')}` });
});

const vision = new ImageAnnotatorClient();
const BLOCKED = ['LIKELY', 'VERY_LIKELY'];

/**
 * Moderación con Cloud Vision (SafeSearch): revisa las dos fotos por su URL pública
 * (Cloudinary o Firebase Storage). Si alguna es inapropiada, oculta el momento borrando el documento.
 */
export const moderateMoment = onDocumentCreated('moments/{momentId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  for (const url of [data.backUrl, data.frontUrl].filter(Boolean)) {
    const [result] = await vision.safeSearchDetection(String(url));
    const s = result.safeSearchAnnotation;
    const flagged = !!s && [s.adult, s.violence, s.racy].some((level) => BLOCKED.includes(String(level)));
    if (!flagged) continue;
    await event.data?.ref.delete();
    await getFirestore().collection('moderation').add({
      momentId: event.params.momentId,
      authorId: data.authorId,
      reason: 'safesearch',
      urls: [data.backUrl, data.frontUrl],
      at: FieldValue.serverTimestamp(),
    });
    logger.warn('Momento ocultado por moderación', { momentId: event.params.momentId });
    return;
  }
});
