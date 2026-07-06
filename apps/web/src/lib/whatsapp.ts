const ARABIC_INDIC_DIGITS: Record<string, string> = {
  "\u0660": "0",
  "\u0661": "1",
  "\u0662": "2",
  "\u0663": "3",
  "\u0664": "4",
  "\u0665": "5",
  "\u0666": "6",
  "\u0667": "7",
  "\u0668": "8",
  "\u0669": "9",
};

const EXTENDED_ARABIC_DIGITS: Record<string, string> = {
  "\u06F0": "0",
  "\u06F1": "1",
  "\u06F2": "2",
  "\u06F3": "3",
  "\u06F4": "4",
  "\u06F5": "5",
  "\u06F6": "6",
  "\u06F7": "7",
  "\u06F8": "8",
  "\u06F9": "9",
};

const ALLOWED_PHONE_CHARS = /^[0-9+\-\s()]+$/;

function convertLocalizedDigits(raw: string): string {
  let result = "";
  for (const ch of raw) {
    if (ARABIC_INDIC_DIGITS[ch]) {
      result += ARABIC_INDIC_DIGITS[ch];
    } else if (EXTENDED_ARABIC_DIGITS[ch]) {
      result += EXTENDED_ARABIC_DIGITS[ch];
    } else {
      result += ch;
    }
  }
  return result;
}

function validateAllowedPhoneCharacters(converted: string): boolean {
  if (converted.length === 0) return false;
  return ALLOWED_PHONE_CHARS.test(converted);
}

function validatePlusSign(converted: string): boolean {
  const trimmed = converted.trim();
  if (trimmed.length === 0) return false;

  const plusCount = (trimmed.match(/\+/g) ?? []).length;
  if (plusCount === 0) return true;
  if (plusCount > 1) return false;

  return trimmed[0] === "+";
}

function removeAllowedFormatting(converted: string): string {
  const trimmed = converted.trim();
  let withoutPlus = trimmed;
  if (trimmed.startsWith("+")) {
    withoutPlus = trimmed.slice(1);
  }
  let digits = "";
  for (const ch of withoutPlus) {
    if (ch >= "0" && ch <= "9") {
      digits += ch;
    }
  }
  return digits;
}

export function normalizeWhatsAppPhone(phone: string): string | null {
  if (!phone || typeof phone !== "string") return null;

  const converted = convertLocalizedDigits(phone);

  if (!validateAllowedPhoneCharacters(converted)) return null;

  if (!validatePlusSign(converted)) return null;

  const trimmed = converted.trim();
  const hasPlusPrefix = trimmed.startsWith("+");
  const digits = removeAllowedFormatting(converted);

  if (digits.length === 0) return null;

  if (hasPlusPrefix) {
    return /^201\d{9}$/.test(digits) ? digits : null;
  }

  if (digits.startsWith("00")) {
    const afterPrefix = digits.slice(2);
    if (/^201\d{9}$/.test(afterPrefix)) {
      return afterPrefix;
    }
    return null;
  }

  if (/^201\d{9}$/.test(digits)) {
    return digits;
  }

  if (/^01\d{9}$/.test(digits)) {
    return `20${digits.slice(1)}`;
  }

  return null;
}

export function getWhatsAppChatUrl(phone: string): string | null {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}
