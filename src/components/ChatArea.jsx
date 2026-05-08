import { useState, useRef, useEffect } from 'react'
import { MODELS } from '../lib/api'

export default function ChatArea({
  character, conversation, isLoading, error, settings,
  sidebarOpen, onToggleSidebar, onToggleNpcPanel, onToggleProvider,
  onOpenSettings, onSendMessage, onRetry, onAdjustState, onDismissError,
}) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)
  const messagesRef = useRef(null)
  
  // 자동 스크롤
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [conversation?.messages.length, isLoading])
  
  // 텍스트영역 자동 리사이즈
  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }
  }
  
  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }
  
  if (!character) {
    return (
      <div className="empty-state" style={{ margin: 'auto' }}>
        <h3>캐릭터를 선택하세요</h3>
        <p>왼쪽에서 캐릭터를 고르거나 새로 만들어주세요</p>
      </div>
    )
  }
  
  const modelList = MODELS[settings.provider]
  const currentModel = modelList.find(m => m.id === settings.model)
  
  return (
    <>
      <header className="chat-header">
        <div className="header-left">
          {!sidebarOpen && (
            <button className="icon-btn" onClick={onToggleSidebar} title="사이드바 열기">☰</button>
          )}
          <div className="char-avatar" style={{ width: 36, height: 36, fontSize: 16 }}>
            {character.avatar}
          </div>
          <div className="header-char-info">
            <h2>{character.name}</h2>
            <p>{character.age}세 · {character.role}</p>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className={`mode-toggle ${settings.provider}`}
            onClick={onToggleProvider}
            title="API 모드 전환"
          >
            <span className="mode-dot" />
            {settings.provider === 'anthropic' ? 'ANTHROPIC' : 'OPENROUTER'}
          </button>
          <button className="icon-btn" onClick={onToggleNpcPanel} title="NPC 관리">👥</button>
          <button className="icon-btn" onClick={onOpenSettings} title="설정">⚙</button>
        </div>
      </header>
      
      <div className="state-bar">
        <div className="state-item">
          <span className="state-label">호감도</span>
          <div className="state-bar-track">
            <div 
              className="state-bar-fill affection" 
              style={{ width: `${character.state.affection}%` }}
            />
          </div>
          <span className="state-value">{character.state.affection}</span>
          <div className="state-buttons">
            <button onClick={() => onAdjustState('affection', -5)} title="호감도 -5">−</button>
            <button onClick={() => onAdjustState('affection', 5)} title="호감도 +5">+</button>
          </div>
        </div>
        <div className="state-item">
          <span className="state-label">긴장감</span>
          <div className="state-bar-track">
            <div 
              className="state-bar-fill tension" 
              style={{ width: `${character.state.tension}%` }}
            />
          </div>
          <span className="state-value">{character.state.tension}</span>
          <div className="state-buttons">
            <button onClick={() => onAdjustState('tension', -5)} title="긴장감 -5">−</button>
            <button onClick={() => onAdjustState('tension', 5)} title="긴장감 +5">+</button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button className="icon-btn" onClick={onDismissError}>×</button>
        </div>
      )}
      
      <div className="messages" ref={messagesRef}>
        <div className="messages-inner">
          {!conversation || conversation.messages.length === 0 ? (
            <div className="empty-state">
              <h3>{character.name}을(를) 만나보세요</h3>
              <p>
                첫 메시지를 입력해서 대화를 시작하세요<br/>
                상단에서 API 모드를 전환할 수 있습니다
              </p>
            </div>
          ) : conversation.messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="msg-avatar">{character.avatar}</div>
              )}
              <div>
                <div className="msg-bubble">{msg.content}</div>
                {msg.stateUpdate && (msg.stateUpdate.affectionDelta !== 0 || msg.stateUpdate.tensionDelta !== 0) && (
                  <div className="state-delta">
                    {msg.stateUpdate.affectionDelta !== 0 && (
                      <span className={msg.stateUpdate.affectionDelta > 0 ? 'pos' : 'neg'}>
                        호감 {msg.stateUpdate.affectionDelta > 0 ? '+' : ''}{msg.stateUpdate.affectionDelta}
                      </span>
                    )}
                    {msg.stateUpdate.tensionDelta !== 0 && (
                      <span className={msg.stateUpdate.tensionDelta > 0 ? 'pos' : 'neg'}>
                        긴장 {msg.stateUpdate.tensionDelta > 0 ? '+' : ''}{msg.stateUpdate.tensionDelta}
                      </span>
                    )}
                    {msg.stateUpdate.reason && <span style={{ color: 'var(--text-muted)' }}>· {msg.stateUpdate.reason}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="msg-avatar">{character.avatar}</div>
              <div className="msg-bubble">
                <div className="typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`${character.name}에게 메시지 보내기...`}
            rows={1}
            disabled={isLoading}
          />
          <div className="input-actions">
            {conversation?.messages.length >= 2 && !isLoading && (
              <button className="retry-btn" onClick={onRetry} title="마지막 응답 다시 받기">
                ↻ 리트라이
              </button>
            )}
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              title="전송 (Enter)"
            >
              ↑
            </button>
          </div>
        </div>
        <div className="input-hint">
          <span>{currentModel?.label || settings.model}</span>
          <span>Enter: 전송 · Shift+Enter: 줄바꿈</span>
        </div>
      </div>
    </>
  )
}
