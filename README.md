# 문정현 캐릭터 챗

캐릭터 AI 챗봇 웹앱. 츤데레 연하남 문정현(26)과 연상 누나(35)의 연상연하 로맨스 설정.

## 주요 기능

- **듀얼 API 모드**: Anthropic / OpenRouter 실시간 전환
- **상태 시스템**: 호감도·긴장감이 대화에 따라 자동 변동
- **다중 캐릭터**: 캐릭터 추가/편집/삭제, 자유로운 페르소나 커스텀
- **NPC 시스템**: 서연(친구), 김 팀장(상사), 이준호(라이벌) 등 조연 투입
- **대화 저장**: localStorage 기반, 캐릭터별 여러 대화 분기 가능
- **데이터 백업**: JSON 내보내기/가져오기 (API 키는 제외)
- **반응형 UI**: 데스크탑·모바일 대응

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 열기.

## Vercel 배포

### 방법 1: CLI
```bash
npm install -g vercel
vercel
```

### 방법 2: GitHub 연동
1. GitHub에 리포지토리 생성 후 push
2. [vercel.com](https://vercel.com) → New Project → GitHub 리포 선택
3. Framework: Vite 자동 감지 → Deploy

배포 후 도메인이 발급됩니다. `vercel.json`에 설정이 포함되어 있어 추가 작업 불필요.

## API 키 발급

처음 실행하면 우측 상단 ⚙ 아이콘에서 API 키 입력 필요.

- **Anthropic**: https://console.anthropic.com/settings/keys
- **OpenRouter**: https://openrouter.ai/keys (여러 모델 하나로 통합 사용 가능)

⚠ 키는 브라우저 localStorage에만 저장되며 외부로 전송되지 않음.

## 상태 시스템 동작 방식

매 응답마다 캐릭터가 내부적으로 호감도/긴장감 변화를 판단하여 `<state>` JSON 블록을 생성. 이 블록은 사용자에게 보이지 않고 상태바만 업데이트됨. 상태 바 옆 +/− 버튼으로 수동 조정도 가능.

- 호감도(affection): 0-100. 높을수록 은근히 다정
- 긴장감(tension): 0-100. 높을수록 말이 날카롭거나 당황함

## 캐릭터 커스터마이징

사이드바 "캐릭터 + 추가" 클릭 → 시스템 프롬프트에 상세 설정 작성. 템플릿이 기본 제공됨. 기존 문정현 캐릭터를 참고해 자신만의 캐릭터를 만들 수 있음.

## 기술 스택

- Vite + React 18
- localStorage (서버 없음, 완전 클라이언트사이드)
- Anthropic API / OpenRouter API 직접 호출
- Vercel 배포

## 파일 구조

```
src/
├── App.jsx                 # 메인 상태 관리
├── App.css                 # 전역 스타일
├── characters/
│   └── defaults.js         # 기본 캐릭터 & NPC 템플릿
├── components/
│   ├── Sidebar.jsx         # 좌측 캐릭터/대화 리스트
│   ├── ChatArea.jsx        # 메인 채팅 화면
│   ├── SettingsModal.jsx   # 설정 모달
│   ├── CharacterModal.jsx  # 캐릭터 편집 모달
│   └── NpcPanel.jsx        # 우측 NPC 관리
└── lib/
    ├── api.js              # Anthropic/OpenRouter 호출
    └── storage.js          # localStorage 래퍼
```

## 주의사항

- 브라우저에서 Anthropic API를 직접 호출하기 위해 `anthropic-dangerous-direct-browser-access` 헤더 사용. 개인 사용 목적에는 안전하지만, 배포 시 API 키를 다른 사람과 공유하지 말 것
- 여러 기기에서 동기화하려면 설정에서 "내보내기" 후 다른 기기에서 "가져오기"
