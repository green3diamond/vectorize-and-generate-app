import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  username?: string
  isLoggedIn: boolean
}

const defaultSession: SessionData = {
  isLoggedIn: false,
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
    cookieName: 'chat-session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
    },
  })

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  return session
}