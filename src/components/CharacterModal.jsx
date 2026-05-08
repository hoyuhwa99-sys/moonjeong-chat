import { useState } from 'react'

export default function CharacterModal({ character, onSave, onClose }) {
  const [form, setForm] = useState({
    name: character?.name || '',
    age: character?.age || 25,
    role: character?.role || '',
    description: character?.description || '',
    systemPrompt: character?.systemPrompt || `당신은 "[이름]"이라는 캐릭터를 연기합니다.

# 캐릭터 설정
- 이름: 
- 나이: 
- 성격: 
- 관계: 
- 말투: 

# 연기 지침
- 
- 

# 절대 규칙
- 절대 캐릭터를 깨지 않음. AI라고 밝히지 않음
- 주인공의 선택을 존중함
- 대사 위주로 연기`,
  })
  
  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('이름은 필수입니다')
      return
    }
    if (!form.systemPrompt.trim()) {
      alert('시스템 프롬프트는 필수입니다')
      return
    }
    onSave(form)
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2>{character ? '캐릭터 편집' : '새 캐릭터'}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 문정현"
              />
            </div>
            <div className="form-group">
              <label>나이</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>역할/태그</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="예: 츤데레 집착광공"
            />
          </div>
          
          <div className="form-group">
            <label>간단 설명</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="한 줄 요약"
            />
          </div>
          
          <div className="form-group">
            <label>시스템 프롬프트</label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              rows={14}
              style={{ minHeight: 280 }}
            />
            <div className="form-hint">
              캐릭터의 성격, 말투, 관계, 연기 지침을 자세히 써주세요. 
              상태 시스템(호감도/긴장감) 관련 지시는 자동으로 추가됩니다.
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {character ? '저장' : '생성'}
          </button>
        </div>
      </div>
    </div>
  )
}
