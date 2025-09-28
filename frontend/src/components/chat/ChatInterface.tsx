'use client'

import { useState, useEffect } from 'react'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { api, ChatMessage } from '@/lib/api'

export interface Message {
  id: string
  type: 'bot' | 'user' | 'loading'
  content: string
  timestamp: Date
  file?: File
  // Enhanced AI response properties
  teamUsed?: string
  confidence?: number
  thinkingProcess?: string
  referenceLinks?: string[]
  strategy?: string
  source?: string
  fallback?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm School Match Advisor. How can I help you find the perfect school today?",
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>()


  const convertApiMessageToMessage = (apiMessage: ChatMessage): Message => ({
    id: apiMessage.id || Math.random().toString(36).substr(2, 9),
    type: apiMessage.type === 'assistant' ? 'bot' : apiMessage.type,
    content: apiMessage.content,
    timestamp: new Date(apiMessage.timestamp),
    teamUsed: apiMessage.teamUsed,
    confidence: apiMessage.confidence,
    thinkingProcess: apiMessage.thinkingProcess,
    referenceLinks: apiMessage.referenceLinks,
    strategy: apiMessage.strategy,
    source: apiMessage.source,
    fallback: apiMessage.fallback,
  })

  const addMessage = async (content: string, file?: File) => {
    if (isLoading) return // Prevent multiple requests

    setError(null)

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      file
    }
    setMessages(prev => [...prev, userMessage])

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'loading',
      content: 'AI is thinking...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, loadingMessage])

    setIsLoading(true)

    try {
      // Call real API
      const response = await api.sendMessage(content, currentSessionId)

      // Remove loading message and add real AI response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.type !== 'loading')
        // Create AI message from backend response
        const aiMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'bot',
          content: response.message || 'No response',
          timestamp: new Date(),
          teamUsed: response.team_used,
          confidence: response.confidence,
          thinkingProcess: response.thinking_process,
          referenceLinks: response.reference_links,
          strategy: response.strategy,
          source: response.source,
          fallback: response.fallback
        }
        return [...withoutLoading, aiMessage]
      })

      // Create session if this is the first message
      if (!currentSessionId) {
        try {
          const sessionTitle = content.length > 50 ? content.substring(0, 50) + '...' : content
          const sessionResponse = await api.createSession(sessionTitle)
          setCurrentSessionId(sessionResponse.session.id)
        } catch (sessionError) {
          console.warn('Failed to create session:', sessionError)
          // Continue without session - messages will still be saved with userId
        }
      }

    } catch (err) {
      // Remove loading message and show error
      setMessages(prev => prev.filter(msg => msg.type !== 'loading'))

      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)

      // Add fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment, or contact support if the problem persists.",
        timestamp: new Date(),
        fallback: true
      }
      setMessages(prev => [...prev, fallbackResponse])

      console.error('Chat API error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Check for initial message from form submission
  useEffect(() => {
    const initialMessage = sessionStorage.getItem('initialMessage')
    const formData = sessionStorage.getItem('userFormData')

    if (initialMessage) {
      // Clear the sessionStorage to prevent re-sending on refresh
      sessionStorage.removeItem('initialMessage')
      sessionStorage.removeItem('userFormData')

      // Send the initial message automatically
      setTimeout(() => {
        addMessage(initialMessage)
      }, 1000) // Small delay to ensure component is fully rendered
    }
  }, []) // Empty dependency array to run only once on mount

  return (
    <div className="chat-container">
      <div className="chat-interface-wrapper">
        {/* Chat Header Title */}
        <div className="chat-header">
          <h1>Let's Chat A Bit More for A Better Result!</h1>
        </div>

        {error && (
          <div className="error-banner" style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            margin: '8px',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                float: 'right',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        )}
        <ChatMessages messages={messages} />
        <ChatInput onSendMessage={addMessage} disabled={isLoading} />
      </div>
    </div>
  )
}