import { Bot, ChatSession } from '../types';

const BOTS_STORAGE_KEY = 'ai_bots';
const CHATS_STORAGE_KEY = 'ai_chats';

export function saveBot(bot: Bot): void {
  const bots = getBots();
  bots.push(bot);
  localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(bots));
}

export function getBots(): Bot[] {
  const data = localStorage.getItem(BOTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getBotById(id: string): Bot | undefined {
  const bots = getBots();
  return bots.find(bot => bot.id === id);
}

export function saveChatSession(session: ChatSession): void {
  const sessions = getChatSessions();
  sessions.push(session);
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(sessions));
}

export function getChatSessions(): ChatSession[] {
  const data = localStorage.getItem(CHATS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getChatSessionByBotId(botId: string): ChatSession | undefined {
  const sessions = getChatSessions();
  return sessions.find(session => session.botId === botId);
}

export function updateChatSession(updatedSession: ChatSession): void {
  const sessions = getChatSessions();
  const index = sessions.findIndex(session => session.id === updatedSession.id);
  if (index !== -1) {
    sessions[index] = updatedSession;
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(sessions));
  }
}
