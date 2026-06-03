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
  occupied_beds?: number;
  vacant_beds: number;
  monthly_rate: string | number | null;
  room_attachment?: string | null;
  block_attachment?: string | null;
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

export type PublicMealMenuContent = {
  breakfast: string | null;
  lunch: string | null;
  snacks: string | null;
  dinner: string | null;
  weekly_menu: unknown;
  published_at: string | null;
};

export type PublicMealMenu = {
  tenant_slug: string;
  tenant_name: string;
  block_id: number;
  block_name: string | null;
  location: string | null;
  menu: PublicMealMenuContent | null;
};

export type BookingPayload = {
  tenant_slug: string;
  block_id: number;
  room_id: number;
  name: string;
  email: string;
  phone: string;
  description?: string;
  check_in_date?: string;
  check_out_date?: string;
  flexible_month?: string;
  flexible_stay?: string;
  adults?: number;
  children?: number;
  infants?: number;
  pets?: number;
};

type AvailableRoomsResponse = {
  status?: string;
  data?: AvailableRoom[];
};

type PublicLocationsResponse = {
  status?: string;
  data?: PublicLocation[];
};

type PublicMealMenusResponse = {
  status?: string;
  data?: PublicMealMenu[];
};

export type BookingResponse = {
  status?: string;
  message?: string;
  data?: {
    inquiry_number?: string | null;
    status?: string | null;
  };
};

export type BookingAssistantIntent =
  | "room_search"
  | "location_search"
  | "meal_menu"
  | "booking"
  | "handoff"
  | "out_of_scope";

export type BookingAssistantHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type BookingAssistantContact = {
  name: string;
  email: string;
  phone: string;
};

export type BookingAssistantPrefill = {
  tenant_slug: string;
  block_id: number;
  room_id: number;
};

export type BookingAssistantPayload = {
  session_id: string;
  message: string;
  selected_room?: BookingAssistantPrefill | null;
  contact?: BookingAssistantContact | null;
  history?: BookingAssistantHistoryItem[];
};

export type BookingAssistantResponse = {
  status?: string;
  message: string;
  intent: BookingAssistantIntent;
  matches: {
    rooms: AvailableRoom[];
    locations: PublicLocation[];
    meal_menus: PublicMealMenu[];
  };
  suggestions: string[];
  booking_prefill: BookingAssistantPrefill | null;
  limit?: {
    remaining: number;
    reset_at: string;
  };
  booking?: {
    inquiry_number?: string | null;
    status?: string | null;
    reservation_id?: number;
    reservation_status?: string | null;
    expires_at?: string | null;
  };
};

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

function endpoint(path: string): string {
  return `${hmsApiUrl.replace(/\/$/, "")}${path}`;
}

async function fetchPublicEndpoint(path: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    return await fetch(endpoint(path), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function attachmentUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!/\.(avif|gif|jpe?g|png|webp)$/i.test(path)) return null;

  return `${hmsStorageUrl.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
}

export async function fetchAvailableRooms(): Promise<AvailableRoom[]> {
  try {
    const response = await fetchPublicEndpoint("/public/available-rooms");

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
    const response = await fetchPublicEndpoint("/public/locations");

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

export async function fetchPublicMealMenus(): Promise<PublicMealMenu[]> {
  try {
    const response = await fetchPublicEndpoint("/public/meal-menus");

    if (!response.ok) {
      console.warn(
        `[hms-booking-website] Public meal menus request failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const payload = (await response.json()) as PublicMealMenusResponse;
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    console.warn("[hms-booking-website] Public meal menus request could not reach the HMS API.", {
      apiUrl: hmsApiUrl,
      error,
    });
    return [];
  }
}
