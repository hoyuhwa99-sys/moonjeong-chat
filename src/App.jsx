import { useState, useEffect, useRef } from 'react'
import { defaultCharacters, createNewCharacter, npcTemplates } from './characters/defaults'
import { callAI, buildSystemPrompt, parseStateUpdate, MODELS } from './lib/api'
import { storage, createConversation } from './lib/storage'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import SettingsModal from './components/SettingsModal'
import CharacterModal from './components/CharacterModal'
import NpcPanel from './components/NpcPanel'
import './App.css'

export default function App() {
  // 설정
  const [settings, setSettings] = useState(() => storage.getSettings())
  const [showSettings, setShowSettings] = useState(false)
  
  // 캐릭터
  const [characters, setCharacters] = useState(() => {
    const saved = storage.getCharacters()
    return saved || defaultCharacters
  })
  const [activeCharId, setActiveCharId] = useState(() => 
    storage.getActiveCharId() || defaultCharacters[0].id
  )
  const [showCharModal, setShowCharModal] = useState(false)
  const [editingChar, setEditingChar] = useState(null)
  
  // 대화
  const [conversations, setConversations] = useState(() => storage.getConversations())
  const [activeConvId, setActiveConvId] = useState(() => storage.getActiveConvId())
  
  // UI 상태
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [npcPanelOpen, setNpcPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // 활성 캐릭터 & 대화
  const activeChar = characters.find(c => c.id === activeCharId)
  const activeConv = conversations.find(c => c.id === activeConvId)
  
  // 저장 자동화
  useEffect(() => { storage.saveSettings(settings) }, [settings])
  useEffect(() => { storage.saveCharacters(characters) }, [characters])
  useEffect(() => { storage.saveConversations(conversations) }, [conversations])
  useEffect(() => { storage.setActiveCharId(activeCharId) }, [activeCharId])
  useEffect(() => { storage.setActiveConvId(activeConvId) }, [activeConvId])
  
  // 첫 대화 자동 생성
  useEffect(() => {
    if (activeChar && !activeConv) {
      const charConvs = conversations.filter(c => c.characterId === activeCharId)
      if (charConvs.length > 0) {
        setActiveConvId(charConvs[0].id)
      } else {
        const newConv = createConversation(activeCharId, '첫 만남')
        setConversations(prev => [newConv, ...prev])
        setActiveConvId(newConv.id)
      }
    }
  }, [activeCharId])
  
  // 모드 전환
  const toggleProvider = () => {
    const newProvider = settings.provider === 'anthropic' ? 'openrouter' : 'anthropic'
    const newModel = MODELS[newProvider][0].id
    setSettings(prev => ({ ...prev, provider: newProvider, model: newModel }))
  }
  
  // 메시지 전송
  const sendMessage = async (userText) => {
    if (!userText.trim() || isLoading || !activeConv || !activeChar) return
    
    const apiKey = settings.apiKeys[settings.provider]
    if (!apiKey) {
      setError(`${settings.provider === 'anthropic' ? 'Anthropic' : 'OpenRouter'} API 키를 먼저 입력해주세요`)
      setShowSettings(true)
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    const userMsg = { role: 'user', content: userText, timestamp: Date.now() }
    const updatedMessages = [...activeConv.messages, userMsg]
    
    // 사용자 메시지 먼저 반영
    setConversations(prev => prev.map(c => 
      c.id === activeConv.id 
        ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
        : c
    ))
    
    try {
      const systemPrompt = buildSystemPrompt(activeChar, activeConv.activeNpcs)
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }))
      
      const responseText = await callAI({
        provider: settings.provider,
        apiKey,
        model: settings.model,
        systemPrompt,
        messages: apiMessages,
      })
      
      const { cleanText, stateUpdate } = parseStateUpdate(responseText)
      
      const assistantMsg = {
        role: 'assistant',
        content: cleanText,
        timestamp: Date.now(),
        stateUpdate,
      }
      
      // 캐릭터 상태 업데이트
      if (stateUpdate) {
        setCharacters(prev => prev.map(c => {
          if (c.id !== activeCharId) return c
          return {
            ...c,
            state: {
              affection: Math.max(0, Math.min(100, c.state.affection + (stateUpdate.affectionDelta || 0))),
              tension: Math.max(0, Math.min(100, c.state.tension + (stateUpdate.tensionDelta || 0))),
            },
          }
        }))
      }
      
      // 어시스턴트 메시지 추가 + 제목 자동 설정
      setConversations(prev => prev.map(c => {
        if (c.id !== activeConv.id) return c
        const newMessages = [...updatedMessages, assistantMsg]
        const shouldUpdateTitle = c.title === '첫 만남' || c.title === '새 대화'
        return {
          ...c,
          messages: newMessages,
          updatedAt: Date.now(),
          title: shouldUpdateTitle ? userText.slice(0, 24) : c.title,
        }
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 메시지 삭제(리롤용)
  const deleteLastExchange = () => {
    if (!activeConv || activeConv.messages.length < 2) return
    setConversations(prev => prev.map(c => {
      if (c.id !== activeConv.id) return c
      const newMessages = [...c.messages]
      // 마지막 assistant 제거, 마지막 user도 제거
      if (newMessages[newMessages.length - 1]?.role === 'assistant') newMessages.pop()
      if (newMessages[newMessages.length - 1]?.role === 'user') newMessages.pop()
      return { ...c, messages: newMessages }
    }))
  }
  
  // 캐릭터 CRUD
  const handleSaveCharacter = (charData) => {
    if (editingChar) {
      setCharacters(prev => prev.map(c => c.id === editingChar.id ? { ...c, ...charData } : c))
    } else {
      const newChar = createNewCharacter(charData)
      setCharacters(prev => [...prev, newChar])
      setActiveCharId(newChar.id)
    }
    setShowCharModal(false)
    setEditingChar(null)
  }
  
  const handleDeleteCharacter = (charId) => {
    if (characters.length <= 1) {
      alert('최소 하나의 캐릭터는 있어야 합니다')
      return
    }
    if (!confirm('이 캐릭터와 관련 대화를 모두 삭제할까요?')) return
    setCharacters(prev => prev.filter(c => c.id !== charId))
    setConversations(prev => prev.filter(c => c.characterId !== charId))
    if (activeCharId === charId) {
      const remaining = characters.filter(c => c.id !== charId)
      setActiveCharId(remaining[0]?.id)
    }
  }
  
  // 대화 관리
  const createNewConversation = () => {
    if (!activeCharId) return
    const newConv = createConversation(activeCharId, '새 대화')
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(newConv.id)
  }
  
  const deleteConversation = (convId) => {
    if (!confirm('이 대화를 삭제할까요?')) return
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (activeConvId === convId) {
      const remaining = conversations.filter(c => c.id !== convId && c.characterId === activeCharId)
      setActiveConvId(remaining[0]?.id || null)
    }
  }
  
  // NPC 관리
  const toggleNpc = (npc) => {
    if (!activeConv) return
    setConversations(prev => prev.map(c => {
      if (c.id !== activeConv.id) return c
      const exists = c.activeNpcs?.find(n => n.id === npc.id)
      const newNpcs = exists 
        ? c.activeNpcs.filter(n => n.id !== npc.id)
        : [...(c.activeNpcs || []), npc]
      return { ...c, activeNpcs: newNpcs }
    }))
  }
  
  const addCustomNpc = (npc) => {
    if (!activeConv) return
    const newNpc = { ...npc, id: `npc_custom_${Date.now()}` }
    setConversations(prev => prev.map(c => 
      c.id === activeConv.id 
        ? { ...c, activeNpcs: [...(c.activeNpcs || []), newNpc] }
        : c
    ))
  }
  
  // 상태 수동 조정
  const adjustState = (key, delta) => {
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeCharId) return c
      return {
        ...c,
        state: {
          ...c.state,
          [key]: Math.max(0, Math.min(100, c.state[key] + delta)),
        },
      }
    }))
  }
  
  return (
    <div className="app">
      {sidebarOpen && (
        <Sidebar
          characters={characters}
          activeCharId={activeCharId}
          onSelectChar={setActiveCharId}
          onEditChar={(c) => { setEditingChar(c); setShowCharModal(true) }}
          onDeleteChar={handleDeleteCharacter}
          onNewChar={() => { setEditingChar(null); setShowCharModal(true) }}
          conversations={conversations.filter(c => c.characterId === activeCharId)}
          activeConvId={activeConvId}
          onSelectConv={setActiveConvId}
          onNewConv={createNewConversation}
          onDeleteConv={deleteConversation}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      
      <main className="main">
        <ChatArea
          character={activeChar}
          conversation={activeConv}
          isLoading={isLoading}
          error={error}
          settings={settings}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleNpcPanel={() => setNpcPanelOpen(!npcPanelOpen)}
          onToggleProvider={toggleProvider}
          onOpenSettings={() => setShowSettings(true)}
          onSendMessage={sendMessage}
          onRetry={deleteLastExchange}
          onAdjustState={adjustState}
          onDismissError={() => setError(null)}
        />
      </main>
      
      {npcPanelOpen && activeConv && (
        <NpcPanel
          templates={npcTemplates}
          activeNpcs={activeConv.activeNpcs || []}
          onToggle={toggleNpc}
          onAddCustom={addCustomNpc}
          onClose={() => setNpcPanelOpen(false)}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showCharModal && (
        <CharacterModal
          character={editingChar}
          onSave={handleSaveCharacter}
          onClose={() => { setShowCharModal(false); setEditingChar(null) }}
        />
      )}
    </div>
  )
}
