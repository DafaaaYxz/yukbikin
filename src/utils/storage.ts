import { Bot, ChatSession } from '../types';

export async function saveBot(bot: Bot): Promise<void> {
  await window.storage.set(`bot:${bot.id}`, JSON.stringify(bot), true);
}

export async function getBots(): Promise<Bot[]> {
  try {
    const result = await window.storage.list('bot:', true);
    if (result && result.keys) {
      const botPromises = result.keys.map(async (key) => {
        const data = await window.storage.get(key, true);
        return data ? JSON.parse(data.value) : null;
      });
      return (await Promise.all(botPromises)).filter(b => b);
    }
  } catch (error) {
    console.log('No bots found');
  }
  return [];
}

export async function getBotById(id: string): Promise<Bot | null> {
  try {
    const result = await window.storage.get(`bot:${id}`, true);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    return null;
  }
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  await window.storage.set(`chat:${session.botId}`, JSON.stringify(session), false);
}

export async function getChatSessionByBotId(botId: string): Promise<ChatSession | null> {
  try {
    const result = await window.storage.get(`chat:${botId}`, false);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    return null;
  }
}

export async function updateChatSession(updatedSession: ChatSession): Promise<void> {
  await saveChatSession(updatedSession);
}
