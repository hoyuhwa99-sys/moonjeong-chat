// localStorage 기반 저장/로드

const KEYS = {
  settings: 'mjh_settings',
  characters: 'mjh_characters',
  conversations: 'mjh_conversations',
  activeChar: 'mjh_active_char',
  activeConv: 'mjh_active_conv',
}

export const storage = {
  // 설정
  getSettings() {
    try {
      const raw = localStorage.getItem(KEYS.settings)
      if (!raw) return { provider: 'anthropic', model: 'claude-sonnet-4-5', apiKeys: {} }
      return JSON.parse(raw)
    } catch {
      return { provider: 'anthropic', model: 'claude-sonnet-4-5', apiKeys: {} }
    }
  },
  saveSettings(settings) {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings))
  },
  
  // 캐릭터
  getCharacters() {
    try {
      const raw = localStorage.getItem(KEYS.characters)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  saveCharacters(characters) {
    localStorage.setItem(KEYS.characters, JSON.stringify(characters))
  },
  
  // 대화
  getConversations() {
    try {
      const raw = localStorage.getItem(KEYS.conversations)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },
  saveConversations(convs) {
    localStorage.setItem(KEYS.conversations, JSON.stringify(convs))
  },
  
  // 활성 캐릭터/대화
  getActiveCharId() {
    return localStorage.getItem(KEYS.activeChar)
  },
  setActiveCharId(id) {
    if (id) localStorage.setItem(KEYS.activeChar, id)
    else localStorage.removeItem(KEYS.activeChar)
  },
  getActiveConvId() {
    return localStorage.getItem(KEYS.activeConv)
  },
  setActiveConvId(id) {
    if (id) localStorage.setItem(KEYS.activeConv, id)
    else localStorage.removeItem(KEYS.activeConv)
  },
  
  // 내보내기/가져오기
  exportAll() {
    return {
      settings: this.getSettings(),
      characters: this.getCharacters(),
      conversations: this.getConversations(),
      exportedAt: new Date().toISOString(),
    }
  },
  importAll(data) {
    if (data.characters) this.saveCharacters(data.characters)
    if (data.conversations) this.saveConversations(data.conversations)
    // API 키는 보안상 가져오지 않음
  },
}

export function createConversation(characterId, title) {
  return {
    id: `conv_${Date.now()}`,
    characterId,
    title: title || '새 대화',
    messages: [],
    activeNpcs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
