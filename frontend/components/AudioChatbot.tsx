'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import {marked} from 'marked'

const AudioChatBot = () => {

  const router = useRouter()

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    try{
      setIsLoading(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      })

      setInputText('') // Clear input field after sending
      const data = await response.json()
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: inputText,
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: prevMessages.length + 2,
          text: data.message,
          sender: 'bot',
          timestamp: new Date()
        }
      ])
      setIsLoading(false)
      // console.log('Messages after sending:', messages)
    } 
    catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async (e: React.FormEvent) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        router.push('/login')
        
      } else {
        const data = await response.json()
      }
    } catch (error) {
      console.log(error)
    } 
  }

  return <>
      <button onClick={handleLogout}>
        Logout
      </button>


      <div className="chatbot-container">
        {/* Header */}
        <div className="chat-header">
          <div className="bot-avatar">🤖</div>
          <div>
            <h3>AI Assistant</h3>
            <span className="status">Online</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-bubble">
                {/* <p>{message.text}</p> */}
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ 
                    __html: marked(message.text || '')  // Use marked to parse markdown
                  }} 
                />
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onSubmit={handleSendMessage}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="message-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </>

  }

  export default AudioChatBot