export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
export const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL || "mailto:hello@hms.local";
export const hmsApiUrl =
  process.env.HMS_API_URL ||
  process.env.NEXT_PUBLIC_HMS_API_URL ||
  "http://localhost:8001/api";
export const hmsStorageUrl =
  process.env.NEXT_PUBLIC_HMS_STORAGE_URL ||
  process.env.HMS_STORAGE_URL ||
  hmsApiUrl.replace(/\/api\/?$/, "");
