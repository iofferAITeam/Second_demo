export default function ChatMessages() {
  return (
    <div className="chat-messages">
      {/* Initial welcome message */}
      <div className="message bot">
        <div className="message-avatar">
          <div className="bot-avatar">
            <img src="/images/bot-avatar.png" alt="Bot" style={{width: '24px', height: '24px'}} />
          </div>
        </div>
        <div className="message-content">
          <div className="message-bubble">
            Hello! I'm School Match Advisor. How can I help you find the perfect school today?
          </div>
        </div>
      </div>
    </div>
  )
}