import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const pythonReplyMessage = await axios({
      method: 'post',
      url: 'http://localhost:5000/chat',
      data: {
        message: message
      }
    });

    // `You said: ${message}`
    
    const replyMessage = pythonReplyMessage.data.message

    const response = NextResponse.json({ message: replyMessage })
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Chatbot messaging failed' },
      { status: 500 }
    )
  }
}