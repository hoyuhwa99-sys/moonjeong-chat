import { useState } from 'react'
import { MODELS } from '../lib/api'
import { storage } from '../lib/storage'

export default function SettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState(settings)
  
  const updateApiKey = (provider, key) => {
    setLocal(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: key },
    }))
  }
  
  const setProvider = (provider) => {
    const defaultModel = MODELS[provider][0].id
    const currentModelValid = MODELS[provider].some(m => m.id === local.model)
    setLocal(prev => ({
      ...prev,
      provider,
      model: currentModelValid ? prev.model : defaultModel,
    }))
  }
  
  const handleSave = () => {
    onSave(local)
    onClose()
  }
  
  const handleExport = () => {
    const data = storage.exportAll()
    // API 키 제거
    const safe = { ...data, settings: { ...data.settings, apiKeys: {} } }
    const blob = new Blob([JSON.stringify(safe, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moonjeong-chat-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        storage.importAll(data)
        alert('가져오기 완료. 페이지를 새로고침해주세요.')
        window.location.reload()
      } catch (err) {
        alert('파일을 읽을 수 없습니다: ' + err.message)
      }
    }
    reader.readAsText(file)
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>설정</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>API 제공자</label>
            <div className="provider-tabs">
              <button 
                className={`provider-tab ${local.provider === 'anthropic' ? 'active' : ''}`}
                onClick={() => setProvider('anthropic')}
              >
                Anthropic
              </button>
              <button 
                className={`provider-tab ${local.provider === 'openrouter' ? 'active' : ''}`}
                onClick={() => setProvider('openrouter')}
              >
                OpenRouter
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>모델</label>
            <select 
              value={local.model}
              onChange={(e) => setLocal(prev => ({ ...prev, model: e.target.value }))}
            >
              {MODELS[local.provider].map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Anthropic API 키</label>
            <input
              type="password"
              value={local.apiKeys.anthropic || ''}
              onChange={(e) => updateApiKey('anthropic', e.target.value)}
              placeholder="sk-ant-..."
            />
            <div className="form-hint">
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">
                콘솔에서 발급 →
              </a>
            </div>
          </div>
          
          <div className="form-group">
            <label>OpenRouter API 키</label>
            <input
              type="password"
              value={local.apiKeys.openrouter || ''}
              onChange={(e) => updateApiKey('openrouter', e.target.value)}
              placeholder="sk-or-..."
            />
            <div className="form-hint">
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">
                OpenRouter에서 발급 →
              </a>
            </div>
          </div>
          
          <div className="form-group">
            <label>데이터 관리</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={handleExport} style={{ flex: 1 }}>
                내보내기
              </button>
              <label className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                가져오기
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="form-hint">
              캐릭터와 대화 기록을 백업하거나 복원합니다. API 키는 보안상 내보내지 않습니다.
            </div>
          </div>
          
          <div className="form-group">
            <div className="form-hint" style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
              🔒 API 키는 이 브라우저의 localStorage에만 저장되며, 외부 서버로 전송되지 않습니다. 
              다른 기기에서 사용하려면 해당 기기에서 다시 입력해야 합니다.
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  )
}
