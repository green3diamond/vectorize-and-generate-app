'use client'

import LoginDialog from '@/components/LoginDialog'
import { redirect } from 'next/navigation'


export default function Login() {
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoginDialog  onSuccess = {() => redirect('/')}/>
    </div>
  )
}