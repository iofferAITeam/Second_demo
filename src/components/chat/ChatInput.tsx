export default function ChatInput() {
  return (
    <div className="chat-input-container">
      <div className="chat-actions">
        <button className="action-link">Modify my profile</button>
        <button className="discover-more">
          Discover More with iOffer ⌄
        </button>
      </div>

      <div className="chat-input-form">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask anything you want to know..."
            className="chat-input"
            disabled
          />
          <button type="button" className="attach-btn">📎</button>
          <button type="button" className="send-btn">➤</button>
        </div>
      </div>
    </div>
  )
}