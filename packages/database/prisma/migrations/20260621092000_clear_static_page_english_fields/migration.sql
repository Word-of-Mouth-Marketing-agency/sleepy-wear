UPDATE "StaticPage"
SET
  "titleEn" = NULL,
  "contentEn" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('shipping-policy', 'privacy-policy', 'returns-policy');
