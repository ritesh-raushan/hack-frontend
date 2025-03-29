import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Plus, MenuIcon, Search, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/chats");
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
  
    const newChat = { userMessage: message, llmResponse: "..." };
    setChats((prevChats) => [...prevChats, newChat]);
  
    try {
      const res = await axios.post("http://localhost:5000/chat", { message });
  
      // Replace placeholder with actual response
      setChats((prevChats) =>
        prevChats.map((chat, index) =>
          index === prevChats.length - 1
            ? { ...chat, llmResponse: res.data.response }
            : chat
        )
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };
  
  // Generate initial letter for avatar
  const getInitial = () => {
    return "R";
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gray-950 flex flex-col justify-between items-center py-5">
        <div>
          <button className="w-10 h-10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <button className="w-10 h-10 flex items-center justify-center">
            <div className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center font-bold">
              T
            </div>
          </button>
          
          <button className="w-10 h-10 flex items-center justify-center">
            <Search className="text-white" size={22} />
          </button>
        </div>
        
        <div>
          <button className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center font-bold">
            {getInitial()}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Fixed header */}
        <div className="py-3 flex justify-center items-center gap-2 text-sm text-gray-400 border-b border-gray-800">
          <span>AI Assistant</span>
        </div>
        
        {/* Scrollable message area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {chats.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              chats.map((chat, index) => (
                <div key={index} className="space-y-8">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 px-4 py-2 rounded-xl rounded-tr-sm max-w-2xl">
                      {chat.userMessage}
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex gap-3">
                    <div className="pt-1 flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#FD8C73" strokeWidth="2"/>
                        <path d="M8 12L16 12" stroke="#FD8C73" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 8L12 16" stroke="#FD8C73" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={`text-lg leading-relaxed ${
                      chat.llmResponse === "..." ? "animate-pulse" : ""
                      }`}>
                      <ReactMarkdown>{chat.llmResponse}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed input area */}
        <div className="px-5 py-4 border-t border-gray-800 bg-gray-900">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3 max-w-3xl mx-auto"
          >
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Plus size={20} />
            </button>
            
            <input
              type="text"
              placeholder="Message Gemini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
            />
            
            <button 
              type="submit" 
              disabled={loading || !message.trim()}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                loading || !message.trim() 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-orange-400 hover:bg-orange-500"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} className="text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}