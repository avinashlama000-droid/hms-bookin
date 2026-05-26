import { hmsApiUrl, hmsStorageUrl } from "@/lib/site-config";

export type AvailableRoom = {
  tenant_slug: string;
  tenant_name: string;
  block_id: number;
  block_name: string | null;
  location: string | null;
  room_id: number;
  room_name: string;
  room_type: string;
  floor: string | null;
  capacity: number;
  occupied_beds: number;
  vacant_beds: number;
  monthly_rate: string | number | null;
  room_attachment: string | null;
  block_attachment: string | null;
};

export type PublicLocation = {
  tenant_slug: string;
  tenant_name: string;
  block_id: number;
  block_name: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  available_rooms_count: number;
  vacant_beds: number;
};

export type BookingPayload = {
  tenant_slug: string;
  block_id: number;
  room_id: number;
  name: string;
  email: string;
  phone: string;
  description?: string;
};

type AvailableRoomsResponse = {
  status?: string;
  data?: AvailableRoom[];
};

type PublicLocationsResponse = {
  status?: string;
  data?: PublicLocation[];
};

export type BookingResponse = {
  status?: string;
  message?: string;
  data?: {
    inquiry_number?: string | null;
    status?: string | null;
  };
};

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

function endpoint(path: string): string {
  return `${hmsApiUrl.replace(/\/$/, "")}${path}`;
}

export function attachmentUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!/\.(avif|gif|jpe?g|png|webp)$/i.test(path)) return null;

  return `${hmsStorageUrl.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
}

export async function fetchAvailableRooms(): Promise<AvailableRoom[]> {
  try {
    const response = await fetch(endpoint("/public/available-rooms"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(
        `[hms-booking-website] Available rooms request failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const payload = (await response.json()) as AvailableRoomsResponse;
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    console.warn("[hms-booking-website] Available rooms request could not reach the HMS API.", {
      apiUrl: hmsApiUrl,
      error,
    });
    return [];
  }
}

export async function fetchPublicLocations(): Promise<PublicLocation[]> {
  try {
    const response = await fetch(endpoint("/public/locations"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(
        `[hms-booking-website] Public locations request failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const payload = (await response.json()) as PublicLocationsResponse;
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    console.warn("[hms-booking-website] Public locations request could not reach the HMS API.", {
      apiUrl: hmsApiUrl,
      error,
    });
    return [];
  }
}
