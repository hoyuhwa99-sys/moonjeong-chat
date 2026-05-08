import { useState } from 'react'

export default function NpcPanel({ templates, activeNpcs, onToggle, onAddCustom, onClose }) {
  const [showAdd, setShowAdd] = useState(false)
  const [custom, setCustom] = useState({ name: '', role: '', description: '' })
  
  const handleAddCustom = () => {
    if (!custom.name.trim()) return
    onAddCustom(custom)
    setCustom({ name: '', role: '', description: '' })
    setShowAdd(false)
  }
  
  const isActive = (npcId) => activeNpcs.some(n => n.id === npcId)
  
  // 커스텀 NPC (템플릿에 없는 것들)
  const customNpcs = activeNpcs.filter(n => !templates.find(t => t.id === n.id))
  
  return (
    <aside className="npc-panel">
      <div className="sidebar-header">
        <h1>NPC 관리</h1>
        <button className="icon-btn" onClick={onClose} title="닫기">×</button>
      </div>
      
      <div className="npc-list">
        <div className="sidebar-section-title" style={{ padding: '4px 0 10px' }}>
          <span>활성 NPC: {activeNpcs.length}</span>
          <button onClick={() => setShowAdd(!showAdd)}>+ 직접 추가</button>
        </div>
        
        {showAdd && (
          <div className="npc-card" style={{ borderColor: 'var(--accent)' }}>
            <div className="form-group" style={{ gap: 6 }}>
              <input
                placeholder="이름"
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 5, color: 'var(--text-primary)' }}
              />
              <input
                placeholder="역할 (예: 주인공의 직장 동료)"
                value={custom.role}
                onChange={(e) => setCustom({ ...custom, role: e.target.value })}
                style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 5, color: 'var(--text-primary)' }}
              />
              <textarea
                placeholder="간단한 설명"
                value={custom.description}
                onChange={(e) => setCustom({ ...custom, description: e.target.value })}
                rows={2}
                style={{ padding: '7px 10px', fontSize: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 5, color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary" onClick={handleAddCustom} style={{ flex: 1, padding: '6px 10px', fontSize: 12 }}>추가</button>
                <button className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ padding: '6px 10px', fontSize: 12 }}>취소</button>
              </div>
            </div>
          </div>
        )}
        
        <div className="sidebar-section-title" style={{ padding: '8px 0 6px' }}>
          <span>템플릿</span>
        </div>
        {templates.map(npc => (
          <div
            key={npc.id}
            className={`npc-card ${isActive(npc.id) ? 'active' : ''}`}
            onClick={() => onToggle(npc)}
          >
            <div className="npc-card-header">
              <span className="npc-card-name">{npc.name}</span>
              <span className="npc-card-role">{isActive(npc.id) ? '✓ 활성' : '+ 추가'}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>{npc.role}</div>
            <div className="npc-card-desc">{npc.description}</div>
          </div>
        ))}
        
        {customNpcs.length > 0 && (
          <>
            <div className="sidebar-section-title" style={{ padding: '8px 0 6px' }}>
              <span>직접 추가한 NPC</span>
            </div>
            {customNpcs.map(npc => (
              <div
                key={npc.id}
                className="npc-card active"
                onClick={() => onToggle(npc)}
              >
                <div className="npc-card-header">
                  <span className="npc-card-name">{npc.name}</span>
                  <span className="npc-card-role">✓ 제거</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>{npc.role}</div>
                <div className="npc-card-desc">{npc.description}</div>
              </div>
            ))}
          </>
        )}
        
        <div className="form-hint" style={{ marginTop: 12, padding: 10, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
          💡 활성화한 NPC는 현재 대화에서 메인 캐릭터의 대사에 등장할 수 있습니다. 
          "서연이는 뭐해?" 같은 질문을 던져 자연스럽게 끌어낼 수 있어요.
        </div>
      </div>
    </aside>
  )
}
