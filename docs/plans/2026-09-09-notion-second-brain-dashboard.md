# Notion 세컨드 브레인 대시보드 Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** 노션의 두 인사이트 DB(Insight 업무/개인)에 파편적으로 쌓이기만 하는 발상들을, 로컬 전용 대시보드의 버튼 클릭으로 서로 연결하고(연결) 상위 원칙으로 묶고(패턴) 실행 가능한 행동으로 전환(실행제안)시켜 다시 노션 `AI 위키` DB에 기록하는 도구를 만든다.

**Architecture:** React(Vite) 프론트엔드(초기 화면 껍데기는 Lovable 크레딧으로 생성) + 로컬 Express 백엔드. 백엔드는 Notion 공식 API(`@notionhq/client`)로 직접 읽고 쓰며, 분석은 별도 API 키 없이 로컬 headless Claude Code(`claude -p`)를 서브프로세스로 실행해 수행한다. 영구 저장소는 노션 자체이며, 로컬 DB나 외부 호스팅은 없음 — `localhost`에서만 동작.

**Tech Stack:** 기존 React 19 + Vite + TypeScript(유지) / 신규: Express, `@notionhq/client`, `dotenv`, `cors`, `vitest`(백엔드 테스트), Node `child_process`(claude CLI 실행)

**사전 확정된 노션 리소스 (2026-09-09 생성 완료):**
| 대상 | Data Source ID |
|---|---|
| Insight (업무) | `334e42c5-1f80-813d-99c4-000b1f3a0451` |
| Insight (개인) | `33798681-f6d0-4692-8a63-b8e68629f4d8` |
| AI 위키 (신규 생성됨) | `ff9f2054-810c-4635-acb8-06e4655eb7dd` |

`AI 위키` DB: https://app.notion.com/p/19a40cd914af4d66a4ab46dee9b4e195 — 속성: `위키제목`(title), `유형`(연결/패턴/실행제안), `원천_업무Insight`(relation, dual), `원천_개인Insight`(relation, dual), `요약`(text), `실행상태`(숙성중/실행후보/실행완료/보류), `생성일`/`갱신일`(auto)

---

## Task 0: 노션 Integration 준비 (수동 작업, 코드 없음)

1. https://www.notion.so/my-integrations 에서 새 Internal Integration 생성 — 이름: `세컨드브레인로컬`, 워크스페이스: 본인 워크스페이스
2. 발급된 토큰(`ntn_...`)을 메모해둔다 (Task 2에서 `.env.local`에 저장)
3. 노션에서 아래 3개 DB 각각에 이 integration을 연결 (DB 페이지 우측 상단 `···` → `연결 추가` → `세컨드브레인로컬`)
   - Insight (업무) — https://app.notion.com/p/334e42c51f80802f9ad8f7a0e5087cff
   - Insight (개인) — https://app.notion.com/p/457795b00ae2470ba4d097f77a550e77
   - AI 위키 — https://app.notion.com/p/19a40cd914af4d66a4ab46dee9b4e195
4. 확인: 세 DB 모두 `···` 메뉴에 `세컨드브레인로컬`이 연결된 항목으로 보이면 완료

이 작업 없이는 Task 3 이후 테스트가 실패한다 (401 unauthorized).

---

## Task 1: 프로젝트 의존성 및 환경변수

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `server/` (디렉터리)

**Step 1: 의존성 설치**

```bash
npm install express cors @notionhq/client dotenv
npm install -D @types/express @types/cors vitest tsx
```

**Step 2: `package.json`의 `scripts`에 추가**

```json
"server": "tsx watch server/index.ts",
"test": "vitest run"
```

**Step 3: `.env.example` 생성**

```
NOTION_TOKEN=
NOTION_DS_INSIGHT_WORK=334e42c5-1f80-813d-99c4-000b1f3a0451
NOTION_DS_INSIGHT_PERSONAL=33798681-f6d0-4692-8a63-b8e68629f4d8
NOTION_DS_AI_WIKI=ff9f2054-810c-4635-acb8-06e4655eb7dd
PORT=3001
```

**Step 4: `.env.local` 생성 (커밋되지 않음 — 기존 `.gitignore`의 `*.local`이 이미 커버)**

`.env.example`을 복사해 `NOTION_TOKEN`에 Task 0에서 발급받은 실제 토큰을 채운다.

**Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add backend deps for second-brain dashboard"
```

(`.env.local`은 gitignore 대상이므로 add하지 않음 — `git status`로 확인)

---

## Task 2: Notion 클라이언트 모듈

**Files:**
- Create: `server/notion.ts`
- Test: `server/notion.test.ts`

**Step 1: 실패하는 테스트 작성**

```typescript
// server/notion.test.ts
import { describe, it, expect, vi } from "vitest";
import { getPendingInsights } from "./notion";

vi.mock("@notionhq/client", () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      dataSources: {
        query: vi.fn().mockResolvedValue({
          results: [
            {
              id: "page-1",
              properties: {
                발상제목: { title: [{ plain_text: "예시 인사이트" }] },
                진행상태: { status: { name: "수집" } },
              },
            },
          ],
        }),
      },
    })),
  };
});

describe("getPendingInsights", () => {
  it("진행상태가 수집인 항목만 반환한다", async () => {
    const result = await getPendingInsights("some-data-source-id");
    expect(result).toEqual([
      { id: "page-1", title: "예시 인사이트" },
    ]);
  });
});
```

**Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run server/notion.test.ts`
Expected: FAIL — `Cannot find module './notion'`

**Step 3: 최소 구현**

```typescript
// server/notion.ts
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export interface PendingInsight {
  id: string;
  title: string;
}

export async function getPendingInsights(dataSourceId: string): Promise<PendingInsight[]> {
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: "진행상태", status: { equals: "수집" } },
  });

  return res.results.map((page: any) => ({
    id: page.id,
    title: page.properties["발상제목"]?.title?.[0]?.plain_text ?? "(제목 없음)",
  }));
}
```

**Step 4: 테스트 재실행 → 통과 확인**

Run: `npx vitest run server/notion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add server/notion.ts server/notion.test.ts
git commit -m "feat: add Notion client for reading pending insights"
```

---

## Task 3: Express 서버 + `/api/insights/pending`

**Files:**
- Create: `server/index.ts`
- Test: `server/index.test.ts`

**Step 1: 실패하는 테스트**

```typescript
// server/index.test.ts
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("./notion", () => ({
  getPendingInsights: vi.fn().mockResolvedValue([{ id: "page-1", title: "예시" }]),
}));

import { app } from "./index";

describe("GET /api/insights/pending", () => {
  it("업무+개인 미처리 인사이트를 합쳐 반환한다", async () => {
    const res = await request(app).get("/api/insights/pending");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
```

`npm install -D supertest @types/supertest` 추가 필요 (Task 1에 누락된 항목 — 이 태스크에서 설치).

**Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run server/index.test.ts`
Expected: FAIL — `Cannot find module './index'`

**Step 3: 최소 구현**

```typescript
// server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { getPendingInsights } from "./notion";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/insights/pending", async (_req, res) => {
  const [work, personal] = await Promise.all([
    getPendingInsights(process.env.NOTION_DS_INSIGHT_WORK!),
    getPendingInsights(process.env.NOTION_DS_INSIGHT_PERSONAL!),
  ]);
  res.json([...work, ...personal]);
});

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`local-only server on http://localhost:${port}`));
}
```

**Step 4: 테스트 재실행 → 통과 확인**

Run: `npx vitest run server/index.test.ts`
Expected: PASS

**Step 5: 수동 확인 (실제 노션 연결)**

```bash
npm run server
curl http://localhost:3001/api/insights/pending
```

Expected: 실제 `수집` 상태 인사이트 JSON 배열

**Step 6: Commit**

```bash
git add server/index.ts server/index.test.ts package.json package-lock.json
git commit -m "feat: add local Express server with pending insights endpoint"
```

---

## Task 4: headless Claude Code 호출 모듈

**Files:**
- Create: `server/claude.ts`
- Test: `server/claude.test.ts`

**Step 1: 실패하는 테스트**

```typescript
// server/claude.test.ts
import { describe, it, expect, vi } from "vitest";
import * as child_process from "node:child_process";
import { runClaude } from "./claude";

vi.mock("node:child_process");

describe("runClaude", () => {
  it("claude -p 를 실행하고 stdout을 반환한다", async () => {
    vi.mocked(child_process.execFile).mockImplementation((_cmd, _args, _opts, cb: any) => {
      cb(null, { stdout: "분석 결과 텍스트", stderr: "" });
      return {} as any;
    });

    const result = await runClaude("이 인사이트들을 분석해줘: ...");
    expect(result).toBe("분석 결과 텍스트");
  });
});
```

**Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run server/claude.test.ts`
Expected: FAIL — `Cannot find module './claude'`

**Step 3: 최소 구현**

```typescript
// server/claude.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runClaude(prompt: string): Promise<string> {
  const { stdout } = await execFileAsync("claude", ["-p", prompt], {
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
}
```

**Step 4: 테스트 재실행 → 통과 확인**

Run: `npx vitest run server/claude.test.ts`
Expected: PASS

**Step 5: 수동 확인 (실제 로컬 claude CLI 필요)**

```bash
node -e "require('tsx/cjs'); require('./server/claude.ts').runClaude('1+1은?').then(console.log)"
```

Expected: 실제 claude CLI 응답 텍스트 출력 (로컬 환경에 `claude` CLI가 PATH에 있어야 함 — 없으면 이 단계는 스킵하고 다음 태스크에서 통합 시 확인)

**Step 6: Commit**

```bash
git add server/claude.ts server/claude.test.ts
git commit -m "feat: add headless Claude Code invocation wrapper"
```

---

## Task 5: `POST /api/wiki/link` — 연결 파이프라인

**Files:**
- Modify: `server/notion.ts` (위키 노드 조회/생성 함수 추가)
- Modify: `server/index.ts`
- Test: `server/index.test.ts` (케이스 추가)

**Step 1: `server/notion.ts`에 함수 2개 추가 (실패 테스트 먼저)**

```typescript
// server/notion.test.ts 에 추가
it("getExistingWikiSummaries: 기존 위키 요약 목록을 반환한다", async () => {
  const result = await getExistingWikiSummaries();
  expect(Array.isArray(result)).toBe(true);
});

it("createWikiEntry: AI 위키 페이지를 생성한다", async () => {
  const id = await createWikiEntry({
    title: "예시 연결",
    type: "연결",
    summary: "두 인사이트가 같은 주제를 다룸",
    sourceInsightIds: ["page-1"],
  });
  expect(id).toBeTruthy();
});
```

**Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run server/notion.test.ts`
Expected: FAIL — 함수 미정의

**Step 3: 구현 추가**

```typescript
// server/notion.ts 에 추가
export interface WikiSummary {
  id: string;
  title: string;
  type: string;
  summary: string;
}

export async function getExistingWikiSummaries(): Promise<WikiSummary[]> {
  const res = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DS_AI_WIKI!,
  });
  return res.results.map((page: any) => ({
    id: page.id,
    title: page.properties["위키제목"]?.title?.[0]?.plain_text ?? "",
    type: page.properties["유형"]?.select?.name ?? "",
    summary: page.properties["요약"]?.rich_text?.[0]?.plain_text ?? "",
  }));
}

export async function createWikiEntry(entry: {
  title: string;
  type: "연결" | "패턴" | "실행제안";
  summary: string;
  sourceInsightIds: string[];
  status?: "숙성중" | "실행후보" | "실행완료" | "보류";
}): Promise<string> {
  const page = await notion.pages.create({
    parent: { data_source_id: process.env.NOTION_DS_AI_WIKI! } as any,
    properties: {
      위키제목: { title: [{ text: { content: entry.title } }] },
      유형: { select: { name: entry.type } },
      요약: { rich_text: [{ text: { content: entry.summary } }] },
      실행상태: { select: { name: entry.status ?? "숙성중" } },
      // 원천_업무Insight / 원천_개인Insight relation 연결은
      // sourceInsightIds가 어느 DB 소속인지에 따라 분기 필요 —
      // 실행 시점에 페이지가 어느 DB 소속인지 함께 넘기도록
      // getPendingInsights 반환 타입에 sourceDb 필드를 추가해 확장한다.
    },
  });
  return page.id;
}
```

> **주의:** relation 연결 코드는 `getPendingInsights`가 어느 원천 DB에서 왔는지(`sourceDb: "업무" | "개인"`) 함께 반환하도록 Task 2를 확장한 뒤 채운다 — 지금 단계는 위키 노드 생성 골격까지만.

**Step 4: 테스트 재실행 → 통과 확인**

**Step 5: `POST /api/wiki/link` 엔드포인트 추가**

```typescript
// server/index.ts 에 추가
app.post("/api/wiki/link", async (req, res) => {
  const { insightId, insightTitle } = req.body;
  const existing = await getExistingWikiSummaries();

  const prompt = `다음은 세컨드 브레인 위키에 이미 있는 노드들이다:\n${existing
    .map((w) => `- [${w.type}] ${w.title}: ${w.summary}`)
    .join("\n")}\n\n새 인사이트: "${insightTitle}"\n\n이 인사이트가 기존 노드와 의미적으로 연결되는지 판단하고, 연결된다면 왜 연결되는지 한 문단으로 설명해줘. JSON으로 {"title": string, "summary": string} 형식으로만 답해.`;

  const raw = await runClaude(prompt);
  const parsed = JSON.parse(raw);

  const wikiId = await createWikiEntry({
    title: parsed.title,
    type: "연결",
    summary: parsed.summary,
    sourceInsightIds: [insightId],
  });

  res.json({ wikiId });
});
```

**Step 6: Commit**

```bash
git add server/notion.ts server/index.ts server/index.test.ts server/notion.test.ts
git commit -m "feat: add wiki link generation pipeline"
```

---

## Task 6: `/api/wiki/synthesize`, `/api/wiki/actionable`, `PATCH /api/wiki/:id/status`

Task 5와 동일한 패턴(테스트 → 최소 구현 → 커밋)을 반복한다. 프롬프트만 다르다:

- **`POST /api/wiki/synthesize`**: 유형이 `연결`인 노드가 같은 주제로 3개 이상 모이면, `유형: 패턴`으로 상위 노드를 새로 생성하는 프롬프트
- **`POST /api/wiki/actionable`**: `실행상태: 숙성중`인 노드들을 모아 "지금 실행 가능한 구체 행동이 있는가"를 묻고, 있으면 `유형: 실행제안` + `실행상태: 실행후보`로 갱신하는 프롬프트
- **`PATCH /api/wiki/:id/status`**: 단순 Notion 페이지 속성 업데이트 (LLM 호출 없음) — 실행 후보 보드에서 체크 시 `실행완료`로 변경

각 엔드포인트마다 Task 5의 Step 1~6 패턴을 그대로 적용.

---

## Task 7: 로컬 종단 간(E2E) 수동 검증

**Files:** 없음 (수동 체크리스트)

1. `.env.local`에 실제 `NOTION_TOKEN` 있는지 확인
2. `npm run server` 실행 (localhost:3001)
3. `curl http://localhost:3001/api/insights/pending` — `수집` 상태 인사이트가 나오는지 확인
4. 그중 하나의 `id`로 `curl -X POST http://localhost:3001/api/wiki/link -H "Content-Type: application/json" -d '{"insightId":"...", "insightTitle":"..."}'`
5. 노션 `AI 위키` DB를 열어 새 페이지가 실제로 생겼는지 육안 확인
6. 서버가 `0.0.0.0`이 아니라 `localhost`에만 바인딩되어 있는지 재확인 (Express 기본값이 `localhost`이므로 별도 설정 불필요 — `app.listen(port, "0.0.0.0", ...)`처럼 명시적으로 확장하지 않도록 주의)

---

## Lovable 화면 생성 일정 (Day 1~5, 크레딧 5개/일 — 코드 태스크 아님)

이 구간은 로컬 코드가 아니라 Lovable MCP로 진행. **매번 "백엔드/DB 연동 요청 금지, 더미 데이터만 사용"을 프롬프트에 명시.**

| Day | Lovable 프롬프트 요지 | 산출물 |
|---|---|---|
| 1 | "레이아웃 셸 + 좌측 네비게이션(홈/지식그래프/위키브라우저/실행후보) 만들어줘. 백엔드 연동 없이 더미 데이터로." | 레이아웃 컴포넌트 |
| 2 | "홈 화면: 오래된 미연결 인사이트 카드, 최근 패턴 카드, 실행후보 3개 카드. 더미 데이터로." | 홈 뷰 |
| 3 | "위키 브라우저: 리스트+검색+유형 필터(연결/패턴/실행제안). 더미 데이터로." | 위키 브라우저 뷰 |
| 4 | "생성 패널: 소스 선택 드롭다운 + '위키 생성' 버튼 + 로딩 상태 애니메이션. 버튼은 아직 아무 동작 안 해도 됨." | 생성 패널 뷰 |
| 5 | "지식 그래프: 노드-링크 시각화 자리(라이브러리는 react-force-graph 등 제안받되 실제 연결은 더미 데이터로), 반응형 다듬기." | 그래프 뷰 + 마무리 |

크레딧 소진 후: `git pull`로 로컬에 받아, 위 Task 1~7에서 만든 API에 더미 데이터를 실제 `fetch("http://localhost:3001/api/...")`로 교체 + `lovable-tagger` 등 빌드 플러그인 잔재 제거.
