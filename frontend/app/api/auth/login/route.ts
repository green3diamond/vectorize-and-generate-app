
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import validateUser from '@/lib/users'

export async function POST(request: NextRequest) {
  try {
    const { username, password, isAudio } = await request.json()
    const user = validateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const session = await getSession()
    session.userId = user.id
    session.username = user.username
    session.isLoggedIn = true
    session.isAudio = isAudio
    await session.save()
    const response = NextResponse.json({ success: true })
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}