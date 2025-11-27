import React from 'react';
import { Bot } from '../types';

interface BotCardProps {
  bot: Bot;
  onChat: (botId: string) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onChat }) => {
  return (
    <div className="bot-card">
      <img src={bot.imageUrl} alt={bot.name} className="bot-image" />
      <div className="bot-info">
        <h3>{bot.name}</h3>
        <p className="bot-description">{bot.description}</p>
        <p className="bot-persona">{bot.persona}</p>
        <button 
          onClick={() => onChat(bot.id)}
          className="chat-button"
        >
          Chat dengan {bot.name}
        </button>
      </div>
    </div>
  );
};

export default BotCard;
