
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    await session.destroy()
    const response = NextResponse.json({ success: true })
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}