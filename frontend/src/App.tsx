import { useRef, useState } from 'react';
import { Container, Card, Form, Button, Nav } from 'react-bootstrap';
import type { ChatMessage } from '../../shared/src/types';
import { ChatArea } from './components/ChatArea';
import { chatApi } from './api/chat';
import { testOpenaiApi } from './api/testOpenai';
import { pineconeApi, type PineconeHit } from './api/pinecone';
import { speechApi } from './api/speech';
import { MapPage } from './MapPage';
import './nc_styles.css';

const DEFAULT_MODEL = 'qwen2.5:7b';
const STORAGE_KEY_SYSTEM_PROMPT = 'ollama_chat_system_prompt';

type TabKey = 'ollama' | 'test-openai' | 'pinecone-search' | 'speech';

function App() {
  const isMapPage = window.location.pathname === '/map';
  if (isMapPage) {
    return <MapPage />;
  }

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

  // Pinecone arama state
  const [pineconeQuery, setPineconeQuery] = useState('');
  const [pineconeTopK, setPineconeTopK] = useState(10);
  const [pineconeUseRerank, setPineconeUseRerank] = useState(true);
  const [pineconeRerankTopN, setPineconeRerankTopN] = useState(5);
  const [pineconeLoading, setPineconeLoading] = useState(false);
  const [pineconeHits, setPineconeHits] = useState<PineconeHit[]>([]);
  const [pineconeError, setPineconeError] = useState<string | null>(null);

  // Ses → metin
  const [speechRecording, setSpeechRecording] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [speechEngine, setSpeechEngine] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const speechChunksRef = useRef<Blob[]>([]);
  const speechRecorderRef = useRef<MediaRecorder | null>(null);
  const speechMimeRef = useRef<string>('audio/webm');

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

  const handlePineconeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pineconeQuery.trim() || pineconeLoading) return;
    setPineconeLoading(true);
    setPineconeError(null);
    setPineconeHits([]);
    try {
      const result = await pineconeApi.search(pineconeQuery.trim(), {
        topK: pineconeTopK,
        useRerank: pineconeUseRerank,
        rerankTopN: pineconeRerankTopN,
      });
      setPineconeHits(result.result?.hits ?? []);
    } catch (err) {
      setPineconeError(err instanceof Error ? err.message : 'Arama başarısız');
    } finally {
      setPineconeLoading(false);
    }
  };

  const startSpeechRecording = async () => {
    setSpeechError(null);
    setSpeechText('');
    setSpeechEngine(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      speechMimeRef.current = mime || 'audio/webm';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      speechChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) speechChunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(speechChunksRef.current, {
          type: speechMimeRef.current || 'audio/webm',
        });
        if (blob.size === 0) {
          setSpeechError('Kayıt boş.');
          setSpeechRecording(false);
          return;
        }
        setSpeechLoading(true);
        try {
          const ext = blob.type.includes('webm') ? 'webm' : 'ogg';
          const result = await speechApi.transcribeAudio(blob, `kayit.${ext}`);
          if (!result.ok) {
            setSpeechError(result.error ?? 'Transkripsiyon başarısız');
          } else {
            setSpeechText(result.text ?? '');
            setSpeechEngine(result.engine ?? null);
          }
        } catch (err) {
          setSpeechError(err instanceof Error ? err.message : 'Yükleme hatası');
        } finally {
          setSpeechLoading(false);
          setSpeechRecording(false);
        }
      };
      speechRecorderRef.current = rec;
      rec.start(250);
      setSpeechRecording(true);
    } catch (err) {
      setSpeechError(err instanceof Error ? err.message : 'Mikrofon erişimi reddedildi');
    }
  };

  const stopSpeechRecording = () => {
    const rec = speechRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    } else {
      setSpeechRecording(false);
    }
    speechRecorderRef.current = null;
  };

  return (
    <Container className="nc_chat_container py-4" fluid="md">
      <Nav variant="tabs" className="nc_nav_tabs mb-3">
        <Nav.Item>
          <Nav.Link
            href="/map"
            className="nc_nav_link"
          >
            Harita (Tam Ekran)
          </Nav.Link>
        </Nav.Item>
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
        <Nav.Item>
          <Nav.Link
            eventKey="pinecone-search"
            active={activeTab === 'pinecone-search'}
            onClick={() => setActiveTab('pinecone-search')}
            className="nc_nav_link"
          >
            Pinecone Arama
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="speech"
            active={activeTab === 'speech'}
            onClick={() => setActiveTab('speech')}
            className="nc_nav_link"
          >
            Ses → Metin
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'speech' && (
        <Card className="nc_chat_card shadow nc_speech_card">
          <Card.Header className="nc_chat_header">
            <h5 className="mb-0">Ses kaydı → metin (Whisper)</h5>
          </Card.Header>
          <Card.Body className="nc_speech_body">
            <p className="nc_speech_hint text-muted small">
              Mikrofon izni verin; kaydı durdurunca ses backend’e gönderilir. Sunucuda{' '}
              <strong>mlx-whisper</strong> (Apple Silicon) veya <strong>faster-whisper</strong> kullanılır.
            </p>
            <div className="nc_speech_actions d-flex flex-wrap gap-2 align-items-center mb-3">
              {!speechRecording ? (
                <Button
                  type="button"
                  variant="danger"
                  className="nc_speech_record_btn"
                  disabled={speechLoading}
                  onClick={() => void startSpeechRecording()}
                >
                  {speechLoading ? 'İşleniyor...' : 'Kayda başla'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="nc_speech_stop_btn"
                  onClick={stopSpeechRecording}
                >
                  Kaydı durdur ve gönder
                </Button>
              )}
              {speechRecording && (
                <span className="nc_speech_recording_badge text-danger fw-semibold">● Kayıt alınıyor</span>
              )}
            </div>
            {speechError && <div className="nc_speech_error">{speechError}</div>}
            {(speechText || speechEngine) && (
              <div className="nc_speech_result mt-3">
                {speechEngine && (
                  <div className="nc_speech_engine small text-muted mb-1">Motor: {speechEngine}</div>
                )}
                <Form.Label className="nc_speech_label small text-muted">Metin</Form.Label>
                <div className="nc_speech_text">{speechText || '(Boş)'}</div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'pinecone-search' && (
        <Card className="nc_chat_card shadow nc_pinecone_card">
          <Card.Header className="nc_chat_header">
            <h5 className="mb-0">Pinecone İçinde Arama</h5>
          </Card.Header>
          <Card.Body className="nc_pinecone_body">
            <Form onSubmit={handlePineconeSearch}>
              <Form.Group className="mb-3">
                <Form.Label className="nc_pinecone_label">Arama metni</Form.Label>
                <Form.Control
                  type="text"
                  className="nc_pinecone_input"
                  placeholder="Örn: mahalle sınırları, parsel, emlak, yol..."
                  value={pineconeQuery}
                  onChange={(e) => setPineconeQuery(e.target.value)}
                  disabled={pineconeLoading}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="nc_pinecone_label">Sonuç sayısı (topK)</Form.Label>
                <Form.Select
                  className="nc_pinecone_topk"
                  value={pineconeTopK}
                  onChange={(e) => setPineconeTopK(Number(e.target.value))}
                  disabled={pineconeLoading}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="pinecone-rerank"
                  label="Rerank kullan (bge-reranker-v2-m3)"
                  className="nc_pinecone_rerank_check"
                  checked={pineconeUseRerank}
                  onChange={(e) => setPineconeUseRerank(e.target.checked)}
                  disabled={pineconeLoading}
                />
                <Form.Text className="nc_pinecone_rerank_hint text-muted">
                  Yerel rerank: metinler 1024 token sınırına uyacak şekilde kısaltılarak bge-reranker (Transformers.js) ile sıralanır. Python gerekmez.
                </Form.Text>
              </Form.Group>
              {pineconeUseRerank && (
                <Form.Group className="mb-3">
                  <Form.Label className="nc_pinecone_label">Rerank sonuç sayısı (top_n)</Form.Label>
                  <Form.Select
                    className="nc_pinecone_rerank_topn"
                    value={pineconeRerankTopN}
                    onChange={(e) => setPineconeRerankTopN(Number(e.target.value))}
                    disabled={pineconeLoading}
                  >
                    {[3, 5, 10, 15, 20].map((n) => (
                      <option key={n} value={n} disabled={n > pineconeTopK}>{n}{n > pineconeTopK ? ' (topK\'dan küçük olmalı)' : ''}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={pineconeLoading || !pineconeQuery.trim()}
                className="nc_send_btn"
              >
                {pineconeLoading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </Form>
            {pineconeError && (
              <div className="nc_pinecone_error mt-3">{pineconeError}</div>
            )}
            {pineconeHits.length > 0 && (
              <div className="nc_pinecone_results mt-4">
                <Form.Label className="nc_pinecone_label small text-muted">Sonuçlar ({pineconeHits.length})</Form.Label>
                <div className="nc_pinecone_hits">
                  {pineconeHits.map((hit, i) => (
                    <div key={hit._id ?? i} className="nc_pinecone_hit">
                      <div className="nc_pinecone_hit_header">
                        <span className="nc_pinecone_hit_id">{hit._id ?? '—'}</span>
                        {hit._score != null && (
                          <span className="nc_pinecone_hit_score">skor: {hit._score.toFixed(4)}</span>
                        )}
                        {hit.fields?.table_name != null && (
                          <span className="nc_pinecone_hit_meta">tablo: {String(hit.fields.table_name)}</span>
                        )}
                      </div>
                      {hit.fields?.text != null && (
                        <div className="nc_pinecone_hit_text">{String(hit.fields.text).slice(0, 400)}
                          {(hit.fields.text as string).length > 400 ? '…' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

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
            <option value="qwen2.5:7b">qwen2.5:7b</option>
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
