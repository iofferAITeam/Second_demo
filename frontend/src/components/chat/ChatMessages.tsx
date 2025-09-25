import { Message } from './ChatInterface'

interface ChatMessagesProps {
  messages: Message[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {

  return (
    <div className="chat-messages">
      <div className="chat-messages-content">
        {messages.map((message) => (
        <div key={message.id} className={`message ${message.type}`}>
          {message.type === 'bot' && (
            <div className="message-avatar">
              <div className="bot-avatar">
                <img src="/images/bot-avatar.png" alt="Bot" style={{width: '24px', height: '24px'}} />
              </div>
            </div>
          )}
          <div className="message-content">
            <div className="message-bubble">
              {message.content}
            </div>


            {message.file && (
              <div className="message-file">
                <div className="file-attachment">
                  <div className="file-icon">📄</div>
                  <span className="file-name">{message.file.name}</span>
                  <span className="file-size">{(message.file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}