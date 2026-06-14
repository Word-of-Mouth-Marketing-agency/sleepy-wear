import { API_URL } from "./api";

const MEDIA_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${MEDIA_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

export function getCardUrl(url: string): string {
  return getMediaUrl(url.replace(/\.webp$/, "-card.webp"));
}

export function getThumbUrl(url: string): string {
  return getMediaUrl(url.replace(/\.webp$/, "-thumb.webp"));
}
