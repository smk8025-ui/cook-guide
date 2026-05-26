# 📅 [냉털쿡] Next.js 기반 풀스택 개발 로드맵 및 Task Checklist

본 문서는 **Next.js (App Router)** 프레임워크를 기반으로 한 '냉털쿡' 애플리케이션의 풀스택 구현 로드맵입니다. 프런트엔드와 백엔드(API Routes, Server Actions)를 단일 Next.js 프로젝트로 통합 구성하여 효율적인 개발이 가능하도록 의존성 순서대로 설계되었습니다.

---

## 🏗️ Phase 1: Next.js 개발 환경 및 데이터베이스 세팅 (Setup & Infra)
- [x] **Next.js 프로젝트 초기화**
  - [x] `create-next-app`을 이용한 프로젝트 구성 (App Router, TypeScript, Tailwind 또는 Vanilla CSS)
  - [x] 반응형 최적화를 위한 공통 CSS/디자인 시스템 및 전역 레이아웃 설정
  - [x] 하단 탭 바 공통 네비게이션 컴포넌트 개발 (`components/BottomNav.tsx`)
- [ ] **데이터베이스 및 ORM 세팅**
  - [ ] 데이터베이스 인스턴스 구축 및 연결 설정 (MongoDB/PostgreSQL/MySQL 등)
  - [ ] **Prisma / Drizzle ORM** 세팅 및 데이터 스키마 정의 (Users, Inventory, Bookmark, ShoppingList)
  - [ ] 식재료 기본 사전 데이터 시딩(Seeding) 스크립트 작성 및 반영

## 🔐 Phase 2: 사용자 인증 및 메인 홈 구현 (Auth & Home Layout)
- [ ] **Next.js 보안 인증 시스템 구축**
  - [ ] **NextAuth.js (Auth.js)** 또는 Custom JWT를 연동한 인증 API 구현 (`app/api/auth` 혹은 Route Handlers)
  - [ ] 회원가입 시 비밀번호 단방향 암호화(bcrypt) 해싱 처리 적용 (NFR-04)
  - [ ] Next.js **Middleware** (`middleware.ts`)를 활용한 로그인 여부별 페이지 접근 제어 구현
- [ ] **인증 연동 화면 개발**
  - [ ] `app/login/page.tsx`: 로그인/회원가입 화면 개발 (SCR-01)
  - [ ] `app/page.tsx`: 메인 홈 화면 및 오늘 추천 메뉴 리스트 노출 (SCR-02)

## 🎙️ Phase 3: 재료 입력 및 검색 수단 다양화 구현 (Ingredient Input)
- [ ] **재료 입력 화면 및 직접 입력 기능 구현**
  - [ ] `app/ingredients/page.tsx`: 재료 입력 화면 마크업 및 입력 칩(Chip) 상태 관리 (SCR-03, FR-01)
  - [ ] 실시간 자동완성을 위한 Next.js API Route 구축 (`app/api/search/route.ts`)
- [ ] **입력 수단 다양화 (사진 및 음성 인식) 연동 (FR-02)**
  - [ ] **음성 인식 (STT)**: 웹 마이크 API(Web Audio) 및 STT API를 연동하여 마이크 아이콘(🎙️) 클릭 시 음성을 텍스트로 변환해 자동완성 입력 연동
  - [ ] **사진 인식 (AI)**: 카메라 연동/갤러리 파일 업로드 모듈 탑재 및 이미지 기반 식재료 자동 식별 Route Handler 구현 (`app/api/vision/route.ts`)

## 🧠 Phase 4: AI 추천 엔진 및 결과 화면 연동 (AI Match & Recommendations)
- [ ] **AI 레시피 추천 비즈니스 로직 연동 (FR-03)**
  - [ ] 사용자가 선택한 재료 목록을 기반으로 AI 레시피 데이터 매칭 Route Handler 구축 (`app/api/recommend/route.ts`)
  - [ ] 추천 알고리즘 쿼리 튜닝 및 빠른 응답을 위한 Next.js Route 캐싱 전략 설정 (3초 이내 응답 보장, NFR-01)
- [ ] **추천 결과 화면 구현**
  - [ ] `app/recommend/page.tsx`: 추천 결과 화면 및 요약 요리 카드 목록 노출 (SCR-04)
  - [ ] **[FR-04] 부족한 재료 텍스트 및 장보기 퀵 버튼(🛒) 연동**
    - [ ] 각 요리 카드에 부족한 재료 강조 노출
    - [ ] 장보기 추가 버튼 클릭 시 화면 전환 없이 백그라운드 데이터베이스에 추가하는 **Next.js Server Action** 구현 (FR-08)

## 📖 Phase 5: 상세 레시피 가이드 및 즐겨찾기 보관함 구현 (Detail & Bookmarks)
- [ ] **동적 라우팅 기반 레시피 상세 정보 구현**
  - [ ] `app/recipe/[id]/page.tsx`: 동적 라우트 상세 페이지 개발 (SCR-06, FR-05, FR-06)
  - [ ] 요리 난이도, 조리 시간, 재료 상세량 및 단계별 조리 가이드 렌더링
  - [ ] 진행 단계를 추적하는 체크박스 인터랙션 및 Wake Lock API(화면 켜짐 유지) 구현
- [ ] **즐겨찾기 보관함 구현 (FR-07)**
  - [ ] `app/favorites/page.tsx`: 북마크 목록 화면 및 일괄 삭제/편집 모드 구현 (SCR-05)
  - [ ] 북마크 하트 아이콘 토글 처리용 **Server Action** 개발

## 🛒 Phase 6: 장보기 및 이커머스 쇼핑 연동 (Shopping List)
- [ ] **장보기 목록 관리 화면 및 외부 연동**
  - [ ] `app/shopping-list/page.tsx`: 내 장보기 리스트 화면 구현 (FR-08)
  - [ ] 부족한 식재료의 외부 커머스 쇼핑몰(쿠팡, 마켓컬리 등) 즉시 결제 및 구매 연동 페이지/딥링크 연동

## 🧪 Phase 7: 성능 최적화 및 빌드 테스트 (QA & Deploy)
- [ ] **Next.js 최적화 성능 검증**
  - [ ] 서버 사이드 렌더링(SSR) 및 정적 생성(SSG/ISR) 설정을 통한 초기 페이지 로딩 최적화
  - [ ] Lighthouse Audit을 통한 사용성(NFR-02) 및 모바일 반응형 웹 테스트
  - [ ] 빌드 테스트 (`npm run build`) 및 엣지 기능 연동을 통한 성능 검토 (NFR-01)
