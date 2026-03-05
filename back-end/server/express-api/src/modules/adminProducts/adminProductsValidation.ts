const allowedCategories = new Set([
  "Grains",
  "Vegetables",
  "Dairy",
  "Pulses",
  "Fruits",
  "Essentials"
]);

export const isValidCategory = (value: string): boolean => allowedCategories.has(value);

export const parseDateInput = (value: string | undefined, fallback: Date): Date => {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed;
};

export const toNonNegativeNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

export const toNonNegativeInteger = (value: unknown): number | null => {
  const parsed = toNonNegativeNumber(value);
  if (parsed === null) {
    return null;
  }
  return Math.floor(parsed);
};

export const toTrimmedString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

export const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
