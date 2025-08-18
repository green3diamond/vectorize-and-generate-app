'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'

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
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chunksRef = useRef([])  // <-- Local ref, not React state
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize media recorder
  const initializeRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      };

      recorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          alert('No audio was recorded. Please try again.')
          return
        }
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        // console.log('Audio recorded:', audioBlob);
        await handleAudioMessage(audioBlob);
      };

      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please allow microphone access to use voice chat.');
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!mediaRecorder) {
      await initializeRecorder();
      if (!mediaRecorder) return;
    }
    chunksRef.current = [];
    setIsRecording(true);
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      setIsRecording(false);
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }

  // Handle audio message processing
  const handleAudioMessage = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);

      // Step 1: Convert speech to text
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const sttResponse = await fetch('/api/audio', {
        method: 'POST',
        body: formData
      });
      
      const sttData = await sttResponse.json();
      const userText = sttData.text;
      
      // Add user message to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          text: userText,
          sender: 'user',
          timestamp: new Date()
        }
      ]);

      // Step 2: Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const chatData = await chatResponse.json();
      const botText = chatData.message;

      // Step 3: Convert bot response to speech
      const ttsResponse = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: botText })
      });

      const ttsData = await ttsResponse.json();

      // Add bot message to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          text: botText,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);

      // Play bot response audio
      if (ttsData.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${ttsData.audio}`);
        audio.play();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error processing audio message:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async (e) => {
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
            <h3>AI Voice Assistant</h3>
            <span className="status">
              {isRecording ? 'Listening...' : isLoading ? 'Processing...' : 'Online'}
            </span>
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
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ 
                    __html: marked(message.text || '')
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

        {/* Audio Input Area */}
        <div className="input-container">
          <div className="audio-controls">
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isLoading}
              className={`voice-button ${isRecording ? 'recording' : ''}`}
            >
              {isRecording ? '🎙️ Recording...' : isLoading ? '⏳ Processing...' : '🎤 Hold to Speak'}
            </button>
          </div>
        </div>
      </div>
    </>

}

export default AudioChatBot