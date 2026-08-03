import * as StoreReview from 'expo-store-review';
import { RATING_AFTER_COPIES } from './constants';
import { getCopyCount, setRatingAsked, wasRatingAsked } from './storage';

/** Soft prompt after N successful copies — never blocks the UX. */
export async function maybeAskForRating(): Promise<void> {
  try {
    if (await wasRatingAsked()) return;
    const copies = await getCopyCount();
    if (copies < RATING_AFTER_COPIES) return;
    const available = await StoreReview.isAvailableAsync();
    if (!available) return;
    await StoreReview.requestReview();
    await setRatingAsked();
  } catch {
    /* ignore */
  }
}
