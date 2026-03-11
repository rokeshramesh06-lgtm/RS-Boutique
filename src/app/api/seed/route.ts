import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Database is managed by Supabase. Data has been seeded.', seeded: true });
}
