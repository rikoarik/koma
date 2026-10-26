export const DEFAULT_DONATION_URL = 'https://saweria.co/arkids';

// Earlier builds saved the provider homepage as a placeholder, not a Koma donation page.
export function donationUrl(value?: string | null): string {
  return !value || value === 'https://trakteer.id' || value === 'https://trakteer.id/' ? DEFAULT_DONATION_URL : value;
}

export function configuredQrisUrl(value?: string | null): string {
  return !value || value === '/assets/sticker-relate.svg' ? '' : value;
}
