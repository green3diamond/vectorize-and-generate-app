// server 
import { redirect } from 'next/navigation'
import ChatBot from '@/components/TextChatbot'
import AudioChatBot from '@/components/AudioChatbot'

import { getSession } from '@/lib/session'

export default  async function App(){
  
  const session = await getSession()

  if (session.isLoggedIn && session.isAudio) {
    return (<AudioChatBot />)
  } else if (session.isLoggedIn && !session.isAudio) {
    return (<ChatBot />)
  } else {
    redirect('/login')
  }
}