import React, { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import '../styles/ChatBot.css';

const ChatBubble = ({ apiKey }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am AI Assistant, how can I help you?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setError(null);
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: userMessage,
      isBot: false
    }]);

    setIsLoading(true);

    try {
      const response = await callChatGPT(userMessage);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response,
        isBot: true
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const callChatGPT = async (userMessage) => {

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "you are talking to an AI assistant" },
            ...messages.map(msg => ({
              role: msg.isBot ? "assistant" : "user",
              content: msg.text
            })),
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('API failed to respond');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      throw new Error('error calling API');
    }
  };

  return (
    <div className="chat-container">
      {!isExpanded ? (
        <button 
          className="chat-bubble"
          onClick={toggleChat}
          title="openchatwindow"
        >
          <MessageCircle size={24} />
          <span className="bubble-text">Need help？</span>
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <h3 className="header-title">AI Assistant</h3>
            <div className="header-actions">
              <button 
                className="minimize-button"
                onClick={toggleChat}
                title="minimize"
              >
                <Minimize2 size={18} />
              </button>
              <button 
                className="close-button"
                onClick={() => {
                  setIsExpanded(false);
                  setMessages([{ id: 1, text: "Hello! I am AI Assistant,how can I help you?", isBot: true }]);
                }}
                title="close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`message ${message.isBot ? 'bot' : 'user'}`}
              >
                <div className="message-bubble">
                  {message.text}
                </div>
              </div>
            ))}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Please type message..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;