// server 
import { redirect } from 'next/navigation'
import ChatBot from '@/components/chatbot'
import { getSession } from '@/lib/session'

export default  async function App(){
  
  const session = await getSession()

  if (session.isLoggedIn) {
    return (<ChatBot/>)
  } else {
    redirect('/login')
  }
}