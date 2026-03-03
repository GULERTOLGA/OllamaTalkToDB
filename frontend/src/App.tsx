import { useState } from 'react';
import { Container, Card, Form, Button, Nav } from 'react-bootstrap';
import type { ChatMessage } from '../../shared/src/types';
import { ChatArea } from './components/ChatArea';
import { chatApi } from './api/chat';
import { testOpenaiApi } from './api/testOpenai';
import './nc_styles.css';

const DEFAULT_MODEL = 'qwen3:4b';
const STORAGE_KEY_SYSTEM_PROMPT = 'ollama_chat_system_prompt';

type TabKey = 'ollama' | 'test-openai';

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('ollama');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [systemPrompt, setSystemPrompt] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SYSTEM_PROMPT) ?? '';
    } catch {
      return '';
    }
  });

  // Test OpenAI panel state
  const [openaiInput, setOpenaiInput] = useState('');
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [openaiResponse, setOpenaiResponse] = useState('');
  const [openaiError, setOpenaiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        try {
          localStorage.setItem(STORAGE_KEY_SYSTEM_PROMPT, systemPrompt.trim());
        } catch {
          /* ignore */
        }
      const response = await chatApi.send({
        model,
        messages: [...messages, userMessage],
        stream: false,
        systemPrompt: systemPrompt.trim() || undefined,
      });

      if (response.message) {
        setMessages((prev) => [...prev, response.message]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Hata: ${err instanceof Error ? err.message : 'Bağlantı kurulamadı'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestOpenaiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openaiInput.trim() || openaiLoading) return;
    setOpenaiLoading(true);
    setOpenaiError(null);
    setOpenaiResponse('');
    try {
      const result = await testOpenaiApi.sendText(openaiInput.trim());
      setOpenaiResponse(result.text);
    } catch (err) {
      setOpenaiError(err instanceof Error ? err.message : 'İstek başarısız');
    } finally {
      setOpenaiLoading(false);
    }
  };

  return (
    <Container className="nc_chat_container py-4" fluid="md">
      <Nav variant="tabs" className="nc_nav_tabs mb-3">
        <Nav.Item>
          <Nav.Link
            eventKey="ollama"
            active={activeTab === 'ollama'}
            onClick={() => setActiveTab('ollama')}
            className="nc_nav_link"
          >
            Ollama Chat
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="test-openai"
            active={activeTab === 'test-openai'}
            onClick={() => setActiveTab('test-openai')}
            className="nc_nav_link"
          >
            Test OpenAI
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'test-openai' && (
        <Card className="nc_chat_card shadow nc_test_openai_card">
          <Card.Header className="nc_chat_header">
            <h5 className="mb-0">Test OpenAI</h5>
          </Card.Header>
          <Card.Body className="nc_test_openai_body">
            <Form onSubmit={handleTestOpenaiSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="nc_test_openai_label">Metin (prompt değişkenine gider)</Form.Label>
                <Form.Control
                  as="textarea"
                  className="nc_test_openai_input"
                  rows={4}
                  placeholder="OpenAI prompt'una gönderilecek metni yazın..."
                  value={openaiInput}
                  onChange={(e) => setOpenaiInput(e.target.value)}
                  disabled={openaiLoading}
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                disabled={openaiLoading || !openaiInput.trim()}
                className="nc_send_btn"
              >
                {openaiLoading ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </Form>
            {(openaiResponse || openaiError) && (
              <div className="nc_test_openai_result mt-4">
                <Form.Label className="nc_test_openai_label small text-muted">Yanıt</Form.Label>
                <div className={`nc_test_openai_response ${openaiError ? 'nc_test_openai_error' : ''}`}>
                  {openaiError ? openaiError : openaiResponse}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'ollama' && (
      <Card className="nc_chat_card shadow">
        <Card.Header className="nc_chat_header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Ollama Chat</h5>
          <Form.Select
            className="nc_model_select w-auto"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading}
          >
            <option value="qwen3:4b">qwen3:4b</option>
            <option value="deepseek-r1:8b">deepseek-r1:8b</option>
            <option value="qwen2.5:3b">qwen2.5:3b</option>
            <option value="gemma3:1b">gemma3:1b</option>
            <option value="llama3.2:3b">llama3.2:3b</option>
            <option value="llama3.2:1b">llama3.2:1b</option>
          </Form.Select>
        </Card.Header>
        <div className="nc_system_prompt_wrap border-bottom bg-light p-2">
          <Form.Label className="nc_system_prompt_label small text-muted mb-1">System prompt (isteğe bağlı)</Form.Label>
          <Form.Control
            as="textarea"
            className="nc_system_prompt_input"
            rows={3}
            placeholder="Model davranışını yönlendirmek için system prompt yazın..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Card.Body className="nc_chat_body p-0">
          <ChatArea messages={messages} isLoading={isLoading} />
        </Card.Body>
        <Card.Footer className="nc_chat_footer">
          <Form onSubmit={handleSubmit} className="d-flex gap-2">
            <Form.Control
              as="textarea"
              className="nc_message_input"
              rows={2}
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !input.trim()}
              className="nc_send_btn"
            >
              {isLoading ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </Form>
        </Card.Footer>
      </Card>
      )}
    </Container>
  );
}

export default App;
