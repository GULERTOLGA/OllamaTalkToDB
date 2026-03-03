/**
 * Paylaşılan domain katmanı - Backend ve Frontend tarafından kullanılır
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  systemPrompt?: string;
}

export interface ChatResponse {
  model: string;
  message: ChatMessage;
  done: boolean;
}
