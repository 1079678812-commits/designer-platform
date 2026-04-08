import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Use /api/auth/login instead' }, { status: 400 })
}

export async function POST() {
  return NextResponse.json({ error: 'Use /api/auth/login instead' }, { status: 400 })
}
