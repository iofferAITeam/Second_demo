"use client";

import { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
  file?: File;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm School Match Advisor. How can I help you find the perfect school today?",
      timestamp: new Date(),
    },
  ]);

  const addMessage = (content: string, file?: File) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
      file,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Thank you for your message! I'm processing your request and will provide you with the best school recommendations based on your requirements.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      <div className="chat-interface-wrapper">
        <ChatHeader />
        <ChatMessages messages={messages} />
        <ChatInput onSendMessage={addMessage} />
      </div>
    </div>
  );
}
