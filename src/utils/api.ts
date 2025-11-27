import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = 'AIzaSyBywyuARVnFRcSMDerQJ2PZ_DZWHt5XaxA';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent';

async function generateAIResponse(prompt, persona) {
  const fullPrompt = `${persona}\n\nUser: ${prompt}\nAI:`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}&alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const reader = response.body?.getReader();
    let result = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) result += text;
            } catch (e) {}
          }
        }
      }
    }

    return result || 'Maaf, saya tidak dapat menghasilkan respons saat ini.';
  } catch (error) {
    console.error('Error:', error);
    return 'Maaf, terjadi kesalahan saat menghubungi AI.';
  }
}

function App() {
  const [view, setView] = useState('home');
  const [bots, setBots] = useState([]);
  const [currentBot, setCurrentBot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBots();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const botId = params.get('bot');
    if (botId) {
      loadBotAndChat(botId);
    }
  };

  const loadBots = async () => {
    try {
      const result = await window.storage.list('bot:', true);
      if (result && result.keys) {
        const botPromises = result.keys.map(async (key) => {
          const data = await window.storage.get(key, true);
          return data ? JSON.parse(data.value) : null;
        });
        const loadedBots = (await Promise.all(botPromises)).filter(b => b);
        setBots(loadedBots);
      }
    } catch (error) {
      console.log('No bots yet');
    }
    setLoading(false);
  };

  const loadBotAndChat = async (botId) => {
    try {
      const result = await window.storage.get(`bot:${botId}`, true);
      if (result) {
        const bot = JSON.parse(result.value);
        setCurrentBot(bot);
        setView('chat');
      } else {
        alert('Bot tidak ditemukan');
        setView('home');
      }
    } catch (error) {
      alert('Bot tidak ditemukan');
      setView('home');
    }
  };

  const openChat = async (botId) => {
    await loadBotAndChat(botId);
    window.history.pushState({}, '', `?bot=${botId}`);
  };

  const goHome = () => {
    setView('home');
    setCurrentBot(null);
    window.history.pushState({}, '', '/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {view === 'home' && <HomePage bots={bots} onCreateBot={() => setView('create')} onChatBot={openChat} onRefresh={loadBots} />}
      {view === 'create' && <CreateBotPage onBack={goHome} onBotCreated={loadBots} />}
      {view === 'chat' && currentBot && <ChatPage bot={currentBot} onBack={goHome} />}
    </div>
  );
}

function HomePage({ bots, onCreateBot, onChatBot, onRefresh }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '15px',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🤖 AI Bot Platform</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>
          Buat dan bagikan AI bot kustom Anda sendiri!
        </p>
        <button onClick={onCreateBot} style={{
          background: '#25d366',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '25px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          ✨ Create AI Bot
        </button>
        <button onClick={onRefresh} style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '25px',
          fontSize: '1.1rem',
          cursor: 'pointer'
        }}>
          🔄 Refresh
        </button>
      </div>

      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Bot yang Tersedia</h2>
      
      {bots.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p>Belum ada bot yang dibuat. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {bots.map(bot => (
            <BotCard key={bot.id} bot={bot} onChat={onChatBot} />
          ))}
        </div>
      )}
    </div>
  );
}

function BotCard({ bot, onChat }) {
  const shareBot = async () => {
    const url = `${window.location.origin}?bot=${bot.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link bot berhasil disalin! Sekarang bot ini PUBLIK dan bisa diakses siapa saja dengan link ini.');
    } catch (error) {
      prompt('Copy link ini untuk share:', url);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <img src={bot.imageUrl} alt={bot.name} style={{
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '10px',
        marginBottom: '15px'
      }} />
      <h3 style={{ marginBottom: '10px' }}>{bot.name}</h3>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>{bot.description}</p>
      <p style={{ color: '#888', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '15px' }}>
        {bot.persona.substring(0, 100)}...
      </p>
      <button onClick={() => onChat(bot.id)} style={{
        background: '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '10px'
      }}>
        💬 Chat dengan {bot.name}
      </button>
      <button onClick={shareBot} style={{
        background: '#25d366',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        width: '100%'
      }}>
        🔗 Share Bot (Publik)
      </button>
    </div>
  );
}

function CreateBotPage({ onBack, onBotCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: '',
    imageUrl: ''
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.persona || !formData.imageUrl) {
      alert('Semua field harus diisi!');
      return;
    }

    setCreating(true);

    const botId = uuidv4();
    const newBot = {
      id: botId,
      name: formData.name,
      description: formData.description,
      persona: formData.persona,
      imageUrl: formData.imageUrl,
      createdAt: new Date().toISOString()
    };

    try {
      await window.storage.set(`bot:${botId}`, JSON.stringify(newBot), true);
      alert('Bot berhasil dibuat! Bot ini sekarang PUBLIK dan bisa diakses siapa saja.');
      await onBotCreated();
      onBack();
    } catch (error) {
      alert('Gagal membuat bot: ' + error.message);
    }
    setCreating(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Create AI Bot Anda</h1>
      
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nama Bot:
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Masukkan nama bot"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Deskripsi:
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Deskripsikan bot Anda"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Persona (Karakter):
          </label>
          <textarea
            value={formData.persona}
            onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
            placeholder="Contoh: Anda adalah asisten AI yang ramah dan helpful..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            URL Gambar Profil:
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onBack} style={{
            flex: 1,
            background: '#6c757d',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={creating} style={{
            flex: 2,
            background: '#25d366',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '5px',
            cursor: creating ? 'not-allowed' : 'pointer',
            opacity: creating ? 0.6 : 1
          }}>
            {creating ? 'Membuat...' : '✨ Create Bot (Publik)'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatPage({ bot, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [bot.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const result = await window.storage.get(`chat:${bot.id}`, false);
      if (result) {
        setMessages(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No previous messages');
    }
  };

  const saveMessages = async (msgs) => {
    try {
      await window.storage.set(`chat:${bot.id}`, JSON.stringify(msgs), false);
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage, bot.persona);
      
      const botMessage = {
        id: uuidv4(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      await saveMessages(finalMessages);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: uuidv4(),
        content: 'Maaf, terjadi kesalahan saat menghubungi AI.',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const shareBot = async () => {
    const url = `${window.location.origin}?bot=${bot.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link bot berhasil disalin!');
    } catch (error) {
      prompt('Copy link ini untuk share:', url);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#075e54',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          ← Kembali
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={bot.imageUrl} alt={bot.name} style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover'
          }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{bot.name}</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>{bot.description}</p>
          </div>
        </div>

        <button onClick={shareBot} style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          🔗 Share
        </button>
      </div>

      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        background: '#e5ddd5'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            <p>Mulai percakapan dengan {bot.name}!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              marginBottom: '15px',
              alignItems: 'flex-end',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start'
            }}>
              {!message.isUser && (
                <img src={bot.imageUrl} alt={bot.name} style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: '10px'
                }} />
              )}
              <div style={{
                maxWidth: '70%',
                padding: '12px 15px',
                borderRadius: '18px',
                background: message.isUser ? '#dcf8c6' : 'white',
                borderBottomRightRadius: message.isUser ? '5px' : '18px',
                borderBottomLeftRadius: message.isUser ? '18px' : '5px'
              }}>
                <p style={{ margin: '0 0 5px 0' }}>{message.content}</p>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '15px' }}>
            <img src={bot.imageUrl} alt={bot.name} style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: '10px'
            }} />
            <div style={{ background: 'white', padding: '12px 15px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#999', animation: 'typing 1.4s infinite ease-in-out' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#999', animation: 'typing 1.4s infinite ease-in-out 0.2s' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#999', animation: 'typing 1.4s infinite ease-in-out 0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        display: 'flex',
        padding: '15px',
        background: '#f0f0f0',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 15px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '1rem'
          }}
        />
        <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} style={{
          background: '#25d366',
          color: 'white',
          border: 'none',
          padding: '12px 25px',
          borderRadius: '25px',
          cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
          opacity: isLoading || !inputMessage.trim() ? 0.5 : 1
        }}>
          Kirim
        </button>
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default App;
