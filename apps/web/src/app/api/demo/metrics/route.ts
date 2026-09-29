import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    label: "Sample workspace data",
    spend: 4280,
    leads: 184,
    conversations: 121,
    bookings: 48,
    customers: 19,
    channels: [
      { name: "Meta", bookings: 27, share: 56 },
      { name: "Google Ads", bookings: 15, share: 31 },
      { name: "Organic", bookings: 6, share: 13 },
    ],
  });
}
