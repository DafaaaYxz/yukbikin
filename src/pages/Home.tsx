import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot } from '../types';
import { getBots } from '../utils/storage';
import BotCard from '../components/BotCard';

const Home: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    setBots(getBots());
  }, []);

  const handleChat = (botId: string) => {
    window.location.href = `/chat/${botId}`;
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>AI Bot Platform</h1>
        <p>Buat dan bagikan AI bot kustom Anda sendiri!</p>
        <Link to="/create" className="create-button">
          Create AI Bot Anda
        </Link>
      </header>

      <section className="bots-section">
        <h2>Bot yang Tersedia</h2>
        {bots.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada bot yang dibuat. Jadilah yang pertama!</p>
            <Link to="/create" className="create-button">
              Buat Bot Pertama
            </Link>
          </div>
        ) : (
          <div className="bots-grid">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} onChat={handleChat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
