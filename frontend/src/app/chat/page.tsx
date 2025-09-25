import ChatInterface from '@/components/chat/ChatInterface'
import Navbar from '@/components/shared/Navbar'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ChatInterface />
    </div>
  )
}