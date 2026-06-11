export function getCardUrl(url: string): string {
  return url.replace(/\.webp$/, "-card.webp");
}

export function getThumbUrl(url: string): string {
  return url.replace(/\.webp$/, "-thumb.webp");
}
