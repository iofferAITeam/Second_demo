'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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


  // Function to detect if the response contains school recommendations
  const isSchoolRecommendationResponse = (content: string): boolean => {
    const recommendationKeywords = [
      'Academic Background Score',
      'Practical Experience Score',
      'Language Proficiency Score',
      'Overall Fit Score',
      'Carnegie Mellon',
      'UC Berkeley',
      'Stanford',
      'University of Washington',
      'Georgia Tech',
      'UCLA',
      'Cornell',
      'USC',
      'Purdue',
      'UC Irvine',
      'Strategist\'s Note'
    ]

    return recommendationKeywords.some(keyword => content.includes(keyword)) &&
           content.includes('Score') &&
           content.includes('University')
  }

  // Function to parse school recommendation data
  const parseSchoolRecommendations = (content: string) => {
    const universities = []

    // Extract the scoring table
    const tableRegex = /University\s+Academic Background\s+Practical Experience\s+Language Proficiency\s+Overall Fit\s*([\s\S]*?)(?=\d+\.\s+Carnegie|$)/
    const tableMatch = content.match(tableRegex)

    if (tableMatch) {
      const tableContent = tableMatch[1]
      const lines = tableContent.split('\n').filter(line => line.trim())

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 5 && parts[0].match(/^\d+\./)) {
          const name = parts.slice(1, -4).join(' ')
          const scores = parts.slice(-4)

          universities.push({
            id: parts[0].replace('.', ''),
            name: name,
            academic: parseInt(scores[0]) || 0,
            practical: parseInt(scores[1]) || 0,
            language: parseInt(scores[2]) || 0,
            fit: parseInt(scores[3]) || 0
          })
        }
      })
    }

    // Extract detailed analysis for each university
    const detailRegex = /(\d+)\.\s+([^(]+?)(?:\([^)]+\))?\s*\n([\s\S]*?)(?=\d+\.\s+[A-Z]|$)/g
    let match
    const detailedAnalysis = []

    while ((match = detailRegex.exec(content)) !== null) {
      const id = match[1]
      const name = match[2].trim()
      const details = match[3]

      // Extract scores from details
      const academicMatch = details.match(/Academic Background Score:\s*(\d+)\/5/)
      const practicalMatch = details.match(/Practical Experience Score:\s*(\d+)\/5/)
      const languageMatch = details.match(/Language Proficiency Score:\s*(\d+)\/5/)
      const fitMatch = details.match(/Overall Fit Score:\s*(\d+)\/5/)
      const noteMatch = details.match(/Strategist's Note:\s*(.*?)(?=\n\d+\.|$)/s)

      detailedAnalysis.push({
        id,
        name,
        academic: academicMatch ? parseInt(academicMatch[1]) : 0,
        practical: practicalMatch ? parseInt(practicalMatch[1]) : 0,
        language: languageMatch ? parseInt(languageMatch[1]) : 0,
        fit: fitMatch ? parseInt(fitMatch[1]) : 0,
        note: noteMatch ? noteMatch[1].trim() : '',
        program: 'Master of Science in Computer Science',
        category: 'target' as const
      })
    }

    return detailedAnalysis.length > 0 ? detailedAnalysis : universities
  }

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
        // Handle response structure - check if it has aiResponse property
        const aiResponseData = (response as any).aiResponse || response
        const aiContent = aiResponseData.content || aiResponseData.message || 'No response'

        // Check if this is a school recommendation response
        if (isSchoolRecommendationResponse(aiContent)) {
          // Parse the recommendations data
          const recommendationsData = parseSchoolRecommendations(aiContent)

          // Get user profile data
          const getUserProfile = async () => {
            try {
              const profileResponse = await api.getProfile()
              return profileResponse.data || null
            } catch (error) {
              console.warn('Failed to get user profile:', error)
              return null
            }
          }

          // Store the recommendations data and profile in localStorage (as fallback)
          localStorage.setItem('aiRecommendations', JSON.stringify(recommendationsData))
          localStorage.setItem('originalQuery', content)
          localStorage.setItem('fullAIResponse', aiContent)

          // Get and store user profile
          getUserProfile().then(profile => {
            if (profile) {
              localStorage.setItem('userProfile', JSON.stringify(profile))
            }
          })

          // Store recommendation ID if available (for database-driven approach)
          if ((response as any).aiResponse?.recommendationId) {
            localStorage.setItem('recommendationId', (response as any).aiResponse.recommendationId)
          }

          // Navigate to recommendations page after a short delay
          setTimeout(() => {
            router.push('/recommendations')
          }, 1000)

          // Show a transition message
          const transitionMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'bot',
            content: "🎯 Perfect! I've generated personalized school recommendations for you. Redirecting to your recommendations page...",
            timestamp: new Date(),
            teamUsed: aiResponseData.teamUsed || aiResponseData.team_used,
            confidence: aiResponseData.confidence,
            thinkingProcess: aiResponseData.thinkingProcess || aiResponseData.thinking_process,
            referenceLinks: aiResponseData.referenceLinks || aiResponseData.reference_links,
            strategy: aiResponseData.strategy,
            source: aiResponseData.source,
            fallback: aiResponseData.fallback
          }
          return [...withoutLoading, transitionMessage]
        }

        // Create AI message from backend response (normal chat)
        const aiMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'bot',
          content: aiContent,
          timestamp: new Date(),
          teamUsed: aiResponseData.teamUsed || aiResponseData.team_used,
          confidence: aiResponseData.confidence,
          thinkingProcess: aiResponseData.thinkingProcess || aiResponseData.thinking_process,
          referenceLinks: aiResponseData.referenceLinks || aiResponseData.reference_links,
          strategy: aiResponseData.strategy,
          source: aiResponseData.source,
          fallback: aiResponseData.fallback
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