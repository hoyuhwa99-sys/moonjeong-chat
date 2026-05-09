// API 듀얼 모드: OpenRouter + Anthropic

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export const MODELS = {
  anthropic: [
    { id: 'claude-opus-4-5', label: 'Claude Opus 4.5 (최고 품질)' },
    { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (균형)' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (빠름)' },
  ],
  openrouter: [
    { id: 'anthropic/claude-opus-4.5', label: 'Claude Opus 4.5' },
    { id: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
    { id: 'openai/gpt-4o', label: 'GPT-4o' },
    { id: 'google/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
    { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
  ],
}

function buildStatePrompt(character) {
  const { affection, tension } = character.state
  const affLevel = affection < 30 ? '낮음' : affection < 60 ? '보통' : affection < 85 ? '높음' : '매우 높음'
  const tenLevel = tension < 30 ? '낮음(편안)' : tension < 60 ? '보통' : tension < 85 ? '높음' : '매우 높음'
  
  return `

# 현재 상태
- 호감도: ${affection}/100 (${affLevel})
- 긴장감: ${tension}/100 (${tenLevel})

이 상태를 연기에 반영하세요. 수치를 직접 언급하지는 마세요.`
}

function buildNpcPrompt(activeNpcs) {
  if (!activeNpcs || activeNpcs.length === 0) return ''
  
  const npcList = activeNpcs.map(n => `- ${n.name} (${n.role}): ${n.description}`).join('\n')
  return `

# 현재 장면에 등장한 NPC
${npcList}

이들이 등장하는 상황이라면, 필요시 그들의 대사나 행동을 자연스럽게 묘사할 수 있습니다. 단, 메인 캐릭터는 어디까지나 당신이며, NPC는 조연으로만 등장합니다.`
}

// 상태 변화 감지 지시
const STATE_UPDATE_INSTRUCTION = `

# 상태 업데이트 규칙
대사를 마친 후, 이번 대화로 인한 호감도/긴장감 변화를 JSON 블록으로 추가하세요. 변화가 없으면 0으로 표기.
반드시 마지막에 이 형식으로:

<state>
{"affectionDelta": 숫자, "tensionDelta": 숫자, "reason": "한 줄 이유"}
</state>

변화량은 보통 -5 ~ +5 범위. 큰 사건일 때만 -10 ~ +10.`

export function buildSystemPrompt(character, activeNpcs = []) {
  return character.systemPrompt + buildStatePrompt(character) + buildNpcPrompt(activeNpcs) + STATE_UPDATE_INSTRUCTION
}

// 응답에서 상태 업데이트 파싱
export function parseStateUpdate(text) {
  const match = text.match(/<state>\s*(\{[\s\S]*?\})\s*<\/state>/)
  if (!match) return { cleanText: text, stateUpdate: null }
  
  try {
    const stateUpdate = JSON.parse(match[1])
    const cleanText = text.replace(/<state>[\s\S]*?<\/state>/, '').trim()
    return { cleanText, stateUpdate }
  } catch (e) {
    return { cleanText: text, stateUpdate: null }
  }
}

// Anthropic API 호출
async function callAnthropic({ apiKey, model, systemPrompt, messages }) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })
  
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic 오류 (${response.status}): ${err}`)
  }
  
  const data = await response.json()
  return data.content[0].text
}

// OpenRouter API 호출
async function callOpenRouter({ apiKey, model, systemPrompt, messages }) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
'X-Title': 'Moonjeong Chat',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
  })
  
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter 오류 (${response.status}): ${err}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// 메인 호출 함수
export async function callAI({ provider, apiKey, model, systemPrompt, messages }) {
  if (!apiKey) throw new Error('API 키를 입력해주세요')
  
  if (provider === 'anthropic') {
    return callAnthropic({ apiKey, model, systemPrompt, messages })
  } else {
    return callOpenRouter({ apiKey, model, systemPrompt, messages })
  }
}
