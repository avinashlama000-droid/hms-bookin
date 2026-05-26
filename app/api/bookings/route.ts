import { NextResponse } from "next/server";
import { hmsApiUrl } from "@/lib/site-config";

const fallbackBody = { message: "Booking inquiry could not be sent." };

function endpoint(path: string): string {
  return `${hmsApiUrl.replace(/\/$/, "")}${path}`;
}

export async function POST(request: Request) {
  let body: string;

  try {
    body = await request.text();
    JSON.parse(body);
  } catch {
    return NextResponse.json(fallbackBody, { status: 400 });
  }

  try {
    const response = await fetch(endpoint("/public/bookings"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
    });

    const responseBody = await response.json().catch(() => null);

    if (responseBody === null) {
      return NextResponse.json(fallbackBody, { status: 502 });
    }

    return NextResponse.json(responseBody, { status: response.status });
  } catch {
    return NextResponse.json(fallbackBody, { status: 502 });
  }
}
