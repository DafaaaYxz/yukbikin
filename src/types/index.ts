export interface Bot {
  id: string;
  name: string;
  description: string;
  persona: string;
  imageUrl: string;
  createdAt: Date;
  creator: string;
}

export interface Message {
  id: string;
  botId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  botId: string;
  messages: Message[];
  createdAt: Date;
}
