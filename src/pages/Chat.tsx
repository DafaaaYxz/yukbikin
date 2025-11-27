import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Bot, Message } from '../types';
import { getBotById, getChatSessionByBotId, updateChatSession } from '../utils/storage';
import { generateAIResponse } from '../utils/api';

const Chat: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (botId) {
      const foundBot = getBotById(botId);
      if (foundBot) {
        setBot(foundBot);
        loadChatSession(foundBot.id);
      } else {
        navigate('/');
      }
    }
  }, [botId, navigate]);

  const loadChatSession = (botId: string) => {
    const session = getChatSessionByBotId(botId);
    
    if (session) {
      setMessages(session.messages);
    } else {
      // Jika tidak ada session, buat yang baru dengan array kosong
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !bot || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      botId: bot.id,
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage, bot.persona);
      
      const botMessage: Message = {
        id: uuidv4(),
        botId: bot.id,
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);

      // Update storage
      const session = getChatSessionByBotId(bot.id);
      if (session) {
        session.messages = finalMessages;
        updateChatSession(session);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Tambahkan pesan error
      const errorMessage: Message = {
        id: uuidv4(),
        botId: bot.id,
        content: 'Maaf, terjadi kesalahan saat menghubungi AI.',
        isUser: false,
        timestamp: new Date()
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bot) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Kembali
        </button>
        <div className="bot-info-header">
          <img src={bot.imageUrl} alt={bot.name} className="bot-avatar" />
          <div>
            <h2>{bot.name}</h2>
            <p>{bot.description}</p>
          </div>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="share-button"
        >
          Share
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Mulai percakapan dengan {bot.name}!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              {!message.isUser && (
                <img src={bot.imageUrl} alt={bot.name} className="message-avatar" />
              )}
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message bot-message">
            <img src={bot.imageUrl} alt={bot.name} className="message-avatar" />
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ketik pesan..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          Kirim
        </button>
      </form>
    </div>
  );
};

export default Chat;
