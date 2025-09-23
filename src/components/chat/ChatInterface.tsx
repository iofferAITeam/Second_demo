import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

export default function ChatInterface() {
  return (
    <div className="chat-container">
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  )
}