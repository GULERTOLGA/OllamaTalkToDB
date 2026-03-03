import { useRef, useEffect } from 'react';
import type { ChatMessage } from '../../shared/src/types';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="nc_chat_area">
      {messages.length === 0 && (
        <div className="nc_chat_empty text-muted text-center py-5">
          Merhaba! Ollama ile sohbet başlatın. Mesaj yazıp Enter veya Gönder'e tıklayın.
        </div>
      )}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`nc_chat_message nc_chat_message_${msg.role} ${
            msg.role === 'user' ? 'nc_chat_message_user' : 'nc_chat_message_assistant'
          }`}
        >
          <div className="nc_chat_message_content">{msg.content}</div>
        </div>
      ))}
      {isLoading && (
        <div className="nc_chat_message nc_chat_message_assistant">
          <div className="nc_chat_message_content nc_chat_typing">
            <span className="nc_typing_dot" />
            <span className="nc_typing_dot" />
            <span className="nc_typing_dot" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
