import { Bot, ChatSession } from '../types';

// Wrapper to mimic the non-standard storage API using localStorage
const storage = {
  set: async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
  },
  get: async (key: string): Promise<{ value: string } | null> => {
    const value = localStorage.getItem(key);
    return value !== null ? { value } : null;
  },
  list: async (prefix: string): Promise<{ keys: string[] } | null> => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    return keys.length > 0 ? { keys } : null;
  },
};


export async function saveBot(bot: Bot): Promise<void> {
  await storage.set(`bot:${bot.id}`, JSON.stringify(bot));
}

export async function getBots(): Promise<Bot[]> {
  try {
    const result = await storage.list('bot:');
    if (result && result.keys) {
      const botPromises = result.keys.map(async (key: string) => {
        const data = await storage.get(key);
        return data ? JSON.parse(data.value) : null;
      });
      return (await Promise.all(botPromises)).filter((b: Bot | null): b is Bot => b !== null);
    }
  } catch (error) {
    console.log('No bots found');
  }
  return [];
}

export async function getBotById(id: string): Promise<Bot | null> {
  try {
    const result = await storage.get(`bot:${id}`);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    return null;
  }
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  await storage.set(`chat:${session.botId}`, JSON.stringify(session));
}

export async function getChatSessionByBotId(botId: string): Promise<ChatSession | null> {
  try {
    const result = await storage.get(`chat:${botId}`);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    return null;
  }
}

export async function updateChatSession(updatedSession: ChatSession): Promise<void> {
  await saveChatSession(updatedSession);
}
