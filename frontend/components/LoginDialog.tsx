'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoginDialogProps {
  onSuccess: () => void
}

export default function LoginDialog({ onSuccess }: LoginDialogProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAudio, setIsAudio] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // just in case
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, isAudio }),
      })

      // console.log('response')
      // console.log(response)

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch (error) {
      console.log(error)
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <div className="login-overlay">
      <div className="login-dialog">
        <h2 className="login-title">
          Welcome to Chat
        </h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

         <div className="form-group form-group-toggle">
          <label className="form-label">
            Enable Audio
          </label>
          <input
            type="checkbox"
            checked={isAudio}
            onChange={(e) => setIsAudio(e.target.checked)}
            className="form-checkbox"
            disabled={loading}
          />
        </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="demo-credentials">
          <p>Demo credentials:</p>
          <p>admin/password123 | user/userpass | demo/demo123</p>
        </div>
      </div>
    </div>
  )
}