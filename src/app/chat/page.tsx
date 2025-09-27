import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/chat/ChatInterface";
import Footer from "@/components/Footer";

export default function ChatPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ChatInterface />
      <Footer />
    </div>
  );
}
