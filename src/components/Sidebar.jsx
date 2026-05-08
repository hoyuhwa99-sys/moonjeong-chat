export default function Sidebar({
  characters, activeCharId, onSelectChar, onEditChar, onDeleteChar, onNewChar,
  conversations, activeConvId, onSelectConv, onNewConv, onDeleteConv,
  onClose,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1><span>문</span>정현 챗</h1>
        <button className="icon-btn" onClick={onClose} title="사이드바 닫기">
          ‹
        </button>
      </div>
      
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span>캐릭터</span>
          <button onClick={onNewChar}>+ 추가</button>
        </div>
        {characters.map(char => (
          <div
            key={char.id}
            className={`char-item ${char.id === activeCharId ? 'active' : ''}`}
            onClick={() => onSelectChar(char.id)}
          >
            <div className="char-avatar">{char.avatar}</div>
            <div className="char-info">
              <div className="char-name">{char.name} · {char.age}</div>
              <div className="char-role">{char.role}</div>
            </div>
            <div className="char-actions">
              <button
                onClick={(e) => { e.stopPropagation(); onEditChar(char) }}
                title="편집"
              >✎</button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChar(char.id) }}
                title="삭제"
              >×</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 14 }}>
        <div className="sidebar-section-title">
          <span>대화</span>
          <button onClick={onNewConv}>+ 새 대화</button>
        </div>
        <div className="conv-list">
          {conversations.length === 0 ? (
            <div style={{ padding: '20px 10px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              대화가 없습니다
            </div>
          ) : conversations.map(conv => (
            <div
              key={conv.id}
              className={`conv-item ${conv.id === activeConvId ? 'active' : ''}`}
              onClick={() => onSelectConv(conv.id)}
            >
              <span className="conv-title">{conv.title}</span>
              <button
                className="conv-delete"
                onClick={(e) => { e.stopPropagation(); onDeleteConv(conv.id) }}
                title="대화 삭제"
              >×</button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
