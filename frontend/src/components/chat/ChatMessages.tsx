import { Message } from './ChatInterface'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
              {message.type === 'bot' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <table className="markdown-table">{children}</table>
                    ),
                    th: ({ children }) => (
                      <th className="markdown-th">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="markdown-td">{children}</td>
                    ),
                    h1: ({ children }) => (
                      <h1 className="markdown-h1">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="markdown-h2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="markdown-h3">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="markdown-ul">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="markdown-ol">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="markdown-li">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="markdown-strong">{children}</strong>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
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