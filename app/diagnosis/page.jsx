'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DiagnosisPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);  // Loading state for message sending
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const storedChatId = localStorage.getItem('chat_id');
    if (storedChatId) {
      setChatId(storedChatId);
      fetchChatMessages(storedChatId);
    }
    fetchChatList();
  }, []);

  const fetchChatList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chatbot', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setChatList(data);
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://doctorai-cw25.onrender.com/apis/user/chats/${chatId}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch chat messages');
      const data = await res.json();
      setChatHistory(data.messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const renderMarkdown = (text) => {
    const dirtyHTML = marked(text);
    const cleanHTML = DOMPurify.sanitize(dirtyHTML);
    return { __html: cleanHTML };
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);  // Set loading to true
    const userMessage = { sender: 'user', message };

    setChatHistory([...chatHistory, userMessage]);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, chat_id: chatId }),
      });
      const data = await res.json();
      if (data.message) {
        setChatHistory((prev) => [...prev, { sender: 'bot', message: data.message }]);
        if (data.chat_id && !chatId) {
          setChatId(data.chat_id);
          localStorage.setItem('chat_id', data.chat_id);
        }
      }
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', message: 'An error occurred. Please try again.' },
      ]);
    } finally {
      setLoading(false);  // Set loading to false once done
    }
  };

  const cancelChat = () => {
    fetchChatList();
    setChatHistory([]);
    setMessage('');
  };

  const startNewChat = () => {
    fetchChatList();
    setChatId(null);
    setChatHistory([]);
    setMessage('');

    localStorage.removeItem('chat_id');
  };

  const selectChat = (selectedChatId) => {
    setChatId(selectedChatId);
    localStorage.setItem('chat_id', selectedChatId);
    fetchChatMessages(selectedChatId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-6xl p-8 bg-white rounded-lg shadow-lg flex flex-col lg:flex-row">
          <div className="lg:w-1/4 border-r pr-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Chats</h2>
            <ul className="space-y-4">
              {Array.isArray(chatList) && chatList.length === 0 ? (
                <p className="text-gray-500">No chats available</p>
              ) : (
                Array.isArray(chatList) ? (
                  chatList.map((chat) => (
                    <li
                      key={chat.id}
                      className={`p-4 bg-gray-200 rounded-lg cursor-pointer ${
                        chatId === chat.id ? 'bg-blue-200' : ''
                      }`}
                      onClick={() => selectChat(chat.id)}
                    >
                      Chat with {chat.sender ? chat.doctor.name : 'Doctor AI'}
                      <span className="block text-xs text-gray-600">
                        Last updated: {new Date(chat.updated_at).toLocaleString()}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-red-500">Unable to load chats</p>
                )
              )}
            </ul>
          </div>
          <div className="lg:w-3/4 lg:pl-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Conversation</h2>
            <div className="h-[400px] overflow-y-scroll mb-6 p-6 border border-gray-300 rounded-lg bg-gray-50">
              {chatHistory.length === 0 && (
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              )}
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-md ${
                    chat.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  <strong>{chat.sender === 'user' ? 'You' : 'Doctor AI'}: </strong>
                  <span dangerouslySetInnerHTML={renderMarkdown(chat.message)} />
                  {chat.sender !== 'user' && (
                    <button
                      onClick={() => copyToClipboard(chat.message, index)}
                      className="ml-4 text-sm text-gray-500 hover:underline flex items-center"
                    >
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Chat input and buttons */} 
            <div className="flex items-center space-x-4">
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type your symptoms..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}  // Disable input while loading
              />
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={sendMessage}
                disabled={loading}  // Disable button while loading
              >
                {loading ? 'Sending...' : 'Send'}  {/* Show "Sending..." while loading */}
              </button>
            </div>

            {/* Additional buttons */}
            <div className="flex justify-between mt-6">
              <button
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={cancelChat}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={startNewChat}
              >
                Start New Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
