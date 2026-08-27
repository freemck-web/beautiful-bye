import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Info,
  ChevronRight,
  CheckCircle2,
  Circle,
  HelpCircle,
  MapPin,
  LayoutDashboard,
  Building2,
  ListChecks,
  RotateCcw,
  Flame,
  Trees,
  Sun,
  Moon,
} from "lucide-react";

// ---------- Data ----------
type FuneralHome = {
  id: string;
  rank: number;
  name: string;
  badge: string;
  address: string;
  phone: string;
  type: string;
  hours: string;
  avgDailyCost: number;
  costRange: string;
  note: string;
  backup: { rank: number; name: string; phone: string } | null;
};

const FUNERAL_HOMES: FuneralHome[] = [
  { id: "fh-01", rank: 1, name: "아산충무병원 국화원", badge: "★ 1순위 추천", address: "충청남도 아산시 문화로 381 (모종동)", phone: "041-548-7444", type: "병원부설", hours: "24시간 연중무휴", avgDailyCost: 780000, costRange: "약 110만~870만원 (규모에 따라)", note: "병원 직영 — 임종~안치 동선 가장 유리. 충무병원 이용 시 최우선.", backup: { rank: 2, name: "한국병원장례식장", phone: "041-531-4444" } },
  { id: "fh-02", rank: 2, name: "한국병원장례식장", badge: "2순위", address: "충청남도 아산시 번영로230번길 13 (모종동)", phone: "041-531-4444", type: "병원부설", hours: "24시간 연중무휴", avgDailyCost: 840000, costRange: "약 114만~873만원", note: "빈소 2실(20~80평), 주차 60대. 1순위에서 505m — 같은 모종동 권역.", backup: { rank: 3, name: "온양장례식장", phone: "041-547-4444" } },
  { id: "fh-03", rank: 3, name: "온양장례식장", badge: "3순위", address: "충청남도 아산시 곡교천로 171 (온천동)", phone: "041-547-4444", type: "전문 장례식장", hours: "24시간 연중무휴", avgDailyCost: 720000, costRange: "약 100만~800만원", note: "온양 시내 중심 접근성. 비용 상대적으로 저렴.", backup: { rank: 4, name: "아산제일장례식장", phone: "041-545-4444" } },
  { id: "fh-04", rank: 4, name: "아산제일장례식장", badge: "4순위", address: "충청남도 아산시 시민로 40 (신인동, 장례문화원)", phone: "041-545-4444", type: "전문 장례식장", hours: "24시간 연중무휴", avgDailyCost: 900000, costRange: "약 130만~900만원", note: "규모 있는 전문 장례식장.", backup: { rank: 5, name: "교원예움 아산장례식장", phone: "041-549-4441" } },
  { id: "fh-05", rank: 5, name: "교원예움 아산장례식장", badge: "5순위", address: "충청남도 아산시 신정로 713 (방축동)", phone: "041-549-4441", type: "전문 장례식장", hours: "24시간 연중무휴", avgDailyCost: 832000, costRange: "약 104만~858만원", note: "빈소 3실(60~80평), 주차 200대 — 대형 시설.", backup: { rank: 6, name: "배방장례식장", phone: "041-544-1500" } },
  { id: "fh-06", rank: 6, name: "배방장례식장", badge: "6순위", address: "충청남도 아산시 배방읍 갈산교로 38 (구령리)", phone: "041-544-1500", type: "전문 장례식장", hours: "24시간 연중무휴", avgDailyCost: 660000, costRange: "약 90만~700만원", note: "배방·아산신도시권 거주 시 유리.", backup: { rank: 7, name: "아산유리요양병원 장례식장", phone: "041-549-1044" } },
  { id: "fh-07", rank: 7, name: "아산유리요양병원 장례식장", badge: "7순위 (최후 백업)", address: "충청남도 아산시 도고면 도고면로 179 (기곡리)", phone: "041-549-1044", type: "병원부설", hours: "24시간 연중무휴", avgDailyCost: 840000, costRange: "약 114만~840만원", note: "도고면 위치 — 자택에서 가장 먼 최후 백업.", backup: null },
];

type Crematorium = {
  id: string;
  rank: number;
  name: string;
  badge: string;
  address: string;
  phone: string | null;
  distance: string;
  highlight?: string;
  cost?: Record<string, string>;
  reservation?: string;
  backup: { rank: number; name: string; distance: string } | null;
};

const CREMATORIUMS: Crematorium[] = [
  {
    id: "crem-01", rank: 1, name: "천안추모공원", badge: "★ 1순위 · 아산 준관내",
    address: "충청남도 천안시 동남구 광덕면 밤나무골길 38 (원덕리)",
    phone: "041-529-5141", distance: "약 16km",
    highlight: "아산 거주자는 '준관내' 요금 40만원 적용 (관외 80만원 아님)",
    cost: { "천안 거주 (관내)": "10만원", "아산 등 준관내": "40만원", "그 외 관외": "80만원" },
    reservation: "장례식장에서 대행 접수 가능 / 직접 예약: www.15774129.go.kr",
    backup: { rank: 2, name: "홍성추모공원화장장", distance: "약 30km" },
  },
  { id: "crem-02", rank: 2, name: "홍성추모공원화장장", badge: "2순위 (천안 만실 시)", address: "충청남도 홍성군 금마면 금마로516번길 85 (봉서리)", phone: null, distance: "약 30km", backup: { rank: 3, name: "공주나래원", distance: "약 43km" } },
  { id: "crem-03", rank: 3, name: "공주나래원", badge: "3순위 (2차 백업)", address: "충청남도 공주시 이인면 삼배실길 70 (운암리)", phone: null, distance: "약 43km", backup: null },
];

const GLOSSARY = [
  { term: "발인", plain: "고인을 장례식장에서 장지로 모시고 떠나는 절차" },
  { term: "입관", plain: "고인을 관에 모시는 절차" },
  { term: "삼우제", plain: "장례 후 3일째에 묘소·봉안당에 다시 찾아가 지내는 의식" },
  { term: "수의", plain: "고인에게 입혀 드리는 옷 (장례식장 내 구매 시 반드시 가격 비교)" },
  { term: "빈소", plain: "장례를 치르는 방. 규모(평수)에 따라 비용이 크게 달라짐" },
  { term: "봉안당", plain: "화장한 유골을 모시는 실내 시설" },
];

// ---------- Checklist ----------
type StepId = string;
type Step = { id: StepId; label: string; hint?: string };
type Stage = { id: string; label: string; timing: string; steps: Step[] };

const STAGE_0: Stage = {
  id: "s0", label: "0단계 · 사전 준비", timing: "평소에",
  steps: [
    { id: "s0-1", label: "아산 지역 장례식장 우선순위 확인", hint: "'시설 정보' 탭에서 1~7순위를 미리 훑어보세요." },
    { id: "s0-2", label: "화장시설(천안추모공원) 연락처 확인" },
    { id: "s0-3", label: "회사 상조 서비스 연락처 확인" },
  ],
};
const STAGE_1: Stage = {
  id: "s1", label: "1단계 · 임종 직후", timing: "0~2시간",
  steps: [
    { id: "s1-1", label: "사망진단서 / 시체검안서 발급 요청", hint: "병원 원무과에 요청. 장례·화장 예약, 사망신고에 모두 필요합니다." },
    { id: "s1-2", label: "1순위 장례식장 전화 — 빈소 가능 여부 확인", hint: "만실이면 곧바로 2순위로 전화하세요." },
    { id: "s1-3", label: "(선택) 회사 상조 서비스 연락" },
  ],
};
const STAGE_2_CREMATION: Stage = {
  id: "s2c", label: "2단계 · 장례 준비 (화장)", timing: "당일~다음날",
  steps: [
    { id: "s2c-1", label: "천안추모공원 화장 예약 확인", hint: "장례식장 대행 또는 직접 예약(041-529-5141 · www.15774129.go.kr)" },
    { id: "s2c-2", label: "봉안당 / 수목장 등 장지 결정" },
    { id: "s2c-3", label: "수의 가격 사전 확인 (바가지 주의)" },
    { id: "s2c-4", label: "빈소 용품 목록 및 비용 확인" },
    { id: "s2c-5", label: "부고 연락 발송" },
  ],
};
const STAGE_2_BURIAL: Stage = {
  id: "s2b", label: "2단계 · 장례 준비 (매장)", timing: "당일~다음날",
  steps: [
    { id: "s2b-1", label: "묘지 / 납골당 계약 확인" },
    { id: "s2b-2", label: "수의 가격 사전 확인 (바가지 주의)" },
    { id: "s2b-3", label: "빈소 용품 목록 및 비용 확인" },
    { id: "s2b-4", label: "부고 연락 발송" },
  ],
};
const STAGE_3: Stage = {
  id: "s3", label: "3단계 · 장례식 진행", timing: "2~3일",
  steps: [
    { id: "s3-1", label: "입관 일정 확인", hint: "입관 — 고인을 관에 모시는 절차" },
    { id: "s3-2", label: "발인 시간 확인", hint: "발인 — 장례식장에서 장지로 모시고 떠나는 절차" },
    { id: "s3-3", label: "화장 / 하관 시간 확인" },
    { id: "s3-4", label: "삼우제 일정 잡기", hint: "삼우제 — 장례 후 3일째 묘소·봉안당 방문 의식" },
  ],
};

type Choice = "" | "cremation" | "burial";
type Persisted = { checked: Record<StepId, boolean>; choice: Choice };
const STORAGE = "last-journey:v1";

function loadState(): Persisted {
  if (typeof window === "undefined") return { checked: {}, choice: "" };
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return { checked: {}, choice: "" };
    return JSON.parse(raw);
  } catch {
    return { checked: {}, choice: "" };
  }
}

// ---------- Theme ----------
type Theme = "dark" | "light";
const THEME_STORAGE = "last-journey:theme";

function loadTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function mapUrl(address: string) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
}

export default function App() {
  const [state, setState] = useState<Persisted>({ checked: {}, choice: "" });
  const [theme, setTheme] = useState<Theme>("dark");
  const [tab, setTab] = useState<"dashboard" | "facilities" | "checklist" | "help">("dashboard");

  useEffect(() => {
    setState(loadState());
    setTheme(loadTheme());
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_STORAGE, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const stages = useMemo(() => {
    const branch = state.choice === "cremation" ? STAGE_2_CREMATION : state.choice === "burial" ? STAGE_2_BURIAL : null;
    return [STAGE_0, STAGE_1, ...(branch ? [branch] : []), STAGE_3];
  }, [state.choice]);

  const allSteps = useMemo(() => stages.flatMap((s) => s.steps), [stages]);
  const total = allSteps.length;
  const doneCount = allSteps.filter((s) => state.checked[s.id]).length;
  const progressPct = total ? (doneCount / total) * 100 : 0;

  const toggle = (id: StepId) =>
    setState((s) => ({ ...s, checked: { ...s.checked, [id]: !s.checked[id] } }));
  const setChoice = (c: Choice) => setState((s) => ({ ...s, choice: c }));
  const resetAll = () => {
    if (confirm("모든 체크 항목을 초기화할까요?")) setState({ checked: {}, choice: "" });
  };
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const TABS: { id: typeof tab; label: string; Icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "대시보드", Icon: LayoutDashboard },
    { id: "checklist", label: "체크리스트", Icon: ListChecks },
    { id: "facilities", label: "시설 정보", Icon: Building2 },
    { id: "help", label: "도움말", Icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-[480px] mx-auto relative">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl font-bold tracking-tight text-gradient-brand truncate">
              마지막 길
            </span>
            <span className="text-sm font-semibold text-muted-foreground truncate">체크리스트</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface border border-border/50 text-muted-foreground"
              aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-surface border border-border/50 text-muted-foreground"
              aria-label="초기화"
            >
              <RotateCcw className="w-3 h-3" /> 초기화
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 pb-28">
        {tab === "dashboard" && (
          <>
            <section className="rounded-3xl p-5 ring-gradient-brand shadow-brand">
              <div className="text-xs font-semibold text-muted-foreground">진행 현황</div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-3xl font-bold text-gradient-brand">
                  {doneCount}
                  <span className="text-lg text-muted-foreground"> / {total}</span>
                </div>
                <div className="text-xs text-muted-foreground">{Math.round(progressPct)}% 완료</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-surface-elevated overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                항목은 언제든 체크했다 풀 수 있고, 단계 사이도 자유롭게 오갈 수 있어요.
              </p>
            </section>

            <section className="rounded-2xl bg-surface border border-border/60 p-4">
              <div className="text-xs font-semibold text-muted-foreground">장례 방식 선택</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChoice("cremation")}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 border transition ${
                    state.choice === "cremation"
                      ? "bg-gradient-brand text-white border-transparent shadow-brand"
                      : "bg-background border-border/60 text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <Flame className="w-4 h-4" /> 화장
                </button>
                <button
                  onClick={() => setChoice("burial")}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 border transition ${
                    state.choice === "burial"
                      ? "bg-gradient-brand text-white border-transparent shadow-brand"
                      : "bg-background border-border/60 text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <Trees className="w-4 h-4" /> 매장
                </button>
              </div>
              {state.choice && (
                <button
                  onClick={() => setChoice("")}
                  className="mt-2 text-[11px] text-muted-foreground underline underline-offset-2"
                >
                  선택 해제
                </button>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                선택하면 2단계에 맞는 항목이 체크리스트에 자동으로 나타납니다.
              </p>
            </section>

            <section className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground px-1">단계별 진행</div>
              {stages.map((stage) => {
                const total = stage.steps.length;
                const dc = stage.steps.filter((s) => state.checked[s.id]).length;
                const pct = total ? (dc / total) * 100 : 0;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setTab("checklist")}
                    className="w-full text-left rounded-2xl bg-surface border border-border/60 p-3 hover:bg-surface-elevated transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{stage.label}</div>
                        <div className="text-[11px] text-muted-foreground">{stage.timing}</div>
                      </div>
                      <div className="text-[11px] font-semibold text-muted-foreground shrink-0">
                        {dc}/{total}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                      <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
              <div className="text-[12px] leading-relaxed text-foreground">
                포화도(예약 가능 여부)는 실시간 연동되지 않습니다. 임종 시점에 반드시 전화로 직접 확인하세요.
              </div>
            </section>
          </>
        )}

        {tab === "checklist" && (
          <>
            <section className="rounded-2xl bg-surface border border-border/60 p-3 flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground">전체 진행</div>
              <div className="text-xs font-bold text-gradient-brand">{doneCount} / {total}</div>
            </section>

            {stages.map((stage) => (
              <section
                key={stage.id}
                className="rounded-2xl overflow-hidden bg-surface border border-border/60"
              >
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/60 bg-gradient-brand-soft">
                  <div className="text-sm font-bold">{stage.label}</div>
                  <div className="text-[11px] text-muted-foreground">{stage.timing}</div>
                </div>
                <ul>
                  {stage.steps.map((s, idx) => {
                    const isDone = !!state.checked[s.id];
                    return (
                      <li key={s.id} className={idx === 0 ? "" : "border-t border-border/60"}>
                        <button
                          onClick={() => toggle(s.id)}
                          className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-elevated transition"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-brand-green" />
                          ) : (
                            <Circle className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-[14px] leading-snug ${
                                isDone ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {s.label}
                            </div>
                            {s.hint && (
                              <div className="text-[12px] mt-1 leading-relaxed text-muted-foreground">
                                {s.hint}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {!state.choice && (
              <section className="rounded-2xl bg-surface border border-dashed border-border/60 p-4">
                <div className="text-sm font-bold">화장/매장을 선택하면 2단계가 열려요</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setChoice("cremation")}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold bg-gradient-brand text-white shadow-brand flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-4 h-4" /> 화장
                  </button>
                  <button
                    onClick={() => setChoice("burial")}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold bg-background border border-border/60 flex items-center justify-center gap-1.5"
                  >
                    <Trees className="w-4 h-4" /> 매장
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-2xl bg-surface border border-dashed border-border/60 p-4">
              <div className="text-sm font-bold">4단계 · 장례 후 행정</div>
              <div className="text-[12px] mt-1 text-muted-foreground">
                사망신고 · 금융계좌 · 건강보험 · 상속 절차 — 곧 업데이트됩니다.
              </div>
            </section>
          </>
        )}

        {tab === "facilities" && (
          <>
            <section className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
              <div className="text-[12px] leading-relaxed text-foreground">
                반드시 <b>전화로 가능 여부를 확인</b>한 후 방문하세요.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold px-1 text-muted-foreground">
                장례식장 · 우선순위 {FUNERAL_HOMES.length}곳
              </h2>
              {FUNERAL_HOMES.map((f) => (
                <article
                  key={f.id}
                  className={`rounded-2xl bg-surface p-4 ${
                    f.rank === 1 ? "ring-gradient-brand shadow-brand" : "border border-border/60"
                  }`}
                >
                  <div
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                      f.rank === 1 ? "bg-gradient-brand text-white" : "bg-surface-elevated text-muted-foreground"
                    }`}
                  >
                    {f.badge}
                  </div>
                  <div className="mt-2 text-lg font-bold leading-snug">{f.name}</div>
                  <div className="text-[12px] mt-0.5 text-muted-foreground">{f.type} · {f.hours}</div>
                  <div className="text-[12px] mt-1 flex items-start gap-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {f.address}
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] text-muted-foreground">1일 빈소 평균</div>
                    <div className="text-xl font-bold text-gradient-brand">
                      {f.avgDailyCost.toLocaleString()}원
                    </div>
                    <div className="text-[11px] text-muted-foreground">{f.costRange}</div>
                  </div>

                  <div className="text-[12px] mt-2 leading-relaxed text-muted-foreground">{f.note}</div>

                  <a
                    href={`tel:${f.phone}`}
                    className="mt-3 flex items-center justify-center gap-2 w-full rounded-xl font-bold text-base py-3 bg-brand-blue text-white"
                  >
                    <Phone className="w-4 h-4" /> {f.phone}
                  </a>
                  <a
                    href={mapUrl(f.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl font-semibold text-sm py-2.5 bg-background border border-border/60"
                  >
                    <MapPin className="w-4 h-4" /> 지도 보기
                  </a>

                  {f.backup && (
                    <div className="mt-3 rounded-lg px-3 py-2 text-[12px] flex items-center gap-1 bg-surface-elevated text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5" />
                      {f.rank}순위 안 되면 → {f.backup.rank}순위 {f.backup.name}
                      <span className="ml-1 text-foreground">{f.backup.phone}</span>
                    </div>
                  )}
                </article>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold px-1 text-muted-foreground mt-2">화장시설 · 우선순위</h2>
              {CREMATORIUMS.map((c) => (
                <article
                  key={c.id}
                  className={`rounded-2xl bg-surface p-4 ${
                    c.rank === 1 ? "ring-gradient-brand shadow-brand" : "border border-border/60"
                  }`}
                >
                  <div
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                      c.rank === 1 ? "bg-gradient-brand text-white" : "bg-surface-elevated text-muted-foreground"
                    }`}
                  >
                    {c.badge}
                  </div>
                  <div className="mt-2 text-lg font-bold leading-snug">{c.name}</div>
                  <div className="text-[12px] mt-0.5 text-muted-foreground">아산 자택에서 {c.distance}</div>
                  <div className="text-[12px] mt-1 flex items-start gap-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {c.address}
                  </div>

                  {c.highlight && (
                    <div className="mt-3 rounded-lg px-3 py-2 text-[12px] font-semibold bg-gradient-brand-soft text-foreground border border-border/60">
                      💡 {c.highlight}
                    </div>
                  )}

                  {c.cost && (
                    <div className="mt-3 rounded-lg p-3 bg-surface-elevated">
                      {Object.entries(c.cost).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[13px] py-0.5">
                          <span className="text-muted-foreground">{k}</span>
                          <span className={`font-semibold ${k.includes("아산") ? "text-gradient-brand" : ""}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {c.reservation && (
                    <div className="text-[12px] mt-2 leading-relaxed text-muted-foreground">
                      예약: {c.reservation}
                    </div>
                  )}

                  {c.phone ? (
                    <a
                      href={`tel:${c.phone}`}
                      className="mt-3 flex items-center justify-center gap-2 w-full rounded-xl font-bold text-base py-3 bg-brand-blue text-white"
                    >
                      <Phone className="w-4 h-4" /> {c.phone}
                    </a>
                  ) : (
                    <div className="mt-3 rounded-xl text-center text-[12px] py-2.5 bg-surface-elevated text-muted-foreground">
                      전화번호는 임종 시점에 검색하여 확인
                    </div>
                  )}
                  <a
                    href={mapUrl(c.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl font-semibold text-sm py-2.5 bg-background border border-border/60"
                  >
                    <MapPin className="w-4 h-4" /> 지도 보기
                  </a>

                  {c.backup && (
                    <div className="mt-3 rounded-lg px-3 py-2 text-[12px] flex items-center gap-1 bg-surface-elevated text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5" />
                      만실이면 → {c.backup.rank}순위 {c.backup.name} ({c.backup.distance})
                    </div>
                  )}
                </article>
              ))}
            </section>
          </>
        )}

        {tab === "help" && (
          <>
            <section>
              <h2 className="text-sm font-bold mb-2 flex items-center gap-2 px-1 text-muted-foreground">
                <HelpCircle className="w-4 h-4" /> 장례 용어 풀이
              </h2>
              <ul className="rounded-2xl overflow-hidden bg-surface border border-border/60">
                {GLOSSARY.map((g, i) => (
                  <li key={g.term} className={i === 0 ? "px-4 py-3" : "px-4 py-3 border-t border-border/60"}>
                    <div className="text-sm font-bold">{g.term}</div>
                    <div className="text-[12px] mt-1 leading-relaxed text-muted-foreground">{g.plain}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-surface border border-border/60 p-4 text-[12px] leading-relaxed text-muted-foreground">
              <div className="font-bold mb-1 text-foreground">데이터 출처</div>
              보건복지부 e하늘 장사정보시스템 공공데이터 / 한국장례문화진흥원 (2026년 6월 조사).
              비용·연락처는 변경될 수 있으므로 임종 시점에 반드시 직접 확인이 필요합니다.
            </section>
          </>
        )}
      </main>

      <nav
        className="fixed bottom-0 inset-x-0 z-20 max-w-[480px] mx-auto backdrop-blur-xl bg-background/80 border-t border-border/60"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  active ? "text-gradient-brand" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
