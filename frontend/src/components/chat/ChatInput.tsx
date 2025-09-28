'use client'

import { useState, useRef } from 'react'

interface ChatInputProps {
  onSendMessage: (content: string, file?: File) => void
  disabled?: boolean
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!disabled && (message.trim() || selectedFile)) {
      onSendMessage(message.trim(), selectedFile || undefined)
      setMessage('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="chat-input-container">
      <div className="chat-actions">
        <button className="discover-more">
          Discover More with iOffer ⌄
        </button>
      </div>

      {selectedFile && (
        <div className="selected-file">
          <div className="file-preview">
            <span className="file-icon">📄</span>
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
            <button className="remove-file" onClick={removeFile}>✕</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder={disabled ? "AI is thinking..." : "Ask anything you want to know..."}
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <button
            type="button"
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            📎
          </button>
          <button
            type="submit"
            className="send-btn"
            disabled={disabled || (!message.trim() && !selectedFile)}
          >
            {disabled ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  )
}