export interface SubscriptionPreset {
  name: string;
  iconLabel: string;
  color: string;
  category: string;
}

/**
 * 대한민국에서 가장 많이 사용하는 구독 서비스 50가지.
 * 사용자가 이름을 입력하면 이 목록과 비교해 가장 유사한 서비스를 추천한다.
 */
export const KOREAN_SUBSCRIPTIONS: SubscriptionPreset[] = [
  { name: "넷플릭스", iconLabel: "N", color: "#E50914", category: "OTT" },
  { name: "유튜브 프리미엄", iconLabel: "▶", color: "#FF0000", category: "OTT" },
  { name: "디즈니플러스", iconLabel: "D+", color: "#113CCF", category: "OTT" },
  { name: "웨이브", iconLabel: "W", color: "#1D9FE0", category: "OTT" },
  { name: "티빙", iconLabel: "T", color: "#FF1F5A", category: "OTT" },
  { name: "왓챠", iconLabel: "W", color: "#FF0558", category: "OTT" },
  { name: "쿠팡플레이", iconLabel: "CP", color: "#1367DA", category: "OTT" },
  { name: "라프텔", iconLabel: "L", color: "#4E3CFA", category: "OTT" },
  { name: "애플TV+", iconLabel: "TV", color: "#111111", category: "OTT" },
  { name: "스포티파이", iconLabel: "S", color: "#1DB954", category: "음악" },
  { name: "유튜브 뮤직", iconLabel: "M", color: "#FF0000", category: "음악" },
  { name: "멜론", iconLabel: "M", color: "#00CD3C", category: "음악" },
  { name: "지니뮤직", iconLabel: "G", color: "#1E9CE8", category: "음악" },
  { name: "플로", iconLabel: "F", color: "#6A34FF", category: "음악" },
  { name: "애플 뮤직", iconLabel: "A", color: "#FA233B", category: "음악" },
  { name: "사운드클라우드", iconLabel: "SC", color: "#FF7700", category: "음악" },
  { name: "챗GPT 플러스", iconLabel: "AI", color: "#10A37F", category: "AI" },
  { name: "노션", iconLabel: "N", color: "#111111", category: "생산성" },
  { name: "어도비 크리에이티브 클라우드", iconLabel: "Ai", color: "#DA1F26", category: "생산성" },
  { name: "MS 365", iconLabel: "M365", color: "#EB3C00", category: "생산성" },
  { name: "아이클라우드+", iconLabel: "iC", color: "#3693F3", category: "클라우드" },
  { name: "구글 원", iconLabel: "G", color: "#4285F4", category: "클라우드" },
  { name: "네이버플러스 멤버십", iconLabel: "N", color: "#03C75A", category: "멤버십" },
  { name: "쿠팡 와우 멤버십", iconLabel: "C", color: "#1367DA", category: "멤버십" },
  { name: "밀리의 서재", iconLabel: "밀", color: "#F58020", category: "독서" },
  { name: "리디셀렉트", iconLabel: "R", color: "#1A2B49", category: "독서" },
  { name: "예스24 북클럽", iconLabel: "Y", color: "#0068B7", category: "독서" },
  { name: "클래스101", iconLabel: "101", color: "#181818", category: "교육" },
  { name: "패스트캠퍼스", iconLabel: "FC", color: "#1B2A4E", category: "교육" },
  { name: "카카오톡 이모티콘 플러스", iconLabel: "K", color: "#FEE500", category: "기타" },
  { name: "배달의민족 배민클럽", iconLabel: "배", color: "#2AC1BC", category: "멤버십" },
  { name: "요기요 요기패스", iconLabel: "요", color: "#FA0050", category: "멤버십" },
  { name: "마켓컬리 컬리멤버스", iconLabel: "컬", color: "#5F0080", category: "멤버십" },
  { name: "신세계 유니버스 클럽", iconLabel: "신", color: "#111111", category: "멤버십" },
  { name: "토스 프라임", iconLabel: "토", color: "#0064FF", category: "멤버십" },
  { name: "아마존 프라임", iconLabel: "a", color: "#FF9900", category: "멤버십" },
  { name: "펫프렌즈 멤버십", iconLabel: "펫", color: "#FF6B35", category: "멤버십" },
  { name: "플레이스테이션 플러스", iconLabel: "PS", color: "#003791", category: "게임" },
  { name: "엑스박스 게임패스", iconLabel: "X", color: "#107C10", category: "게임" },
  { name: "닌텐도 스위치 온라인", iconLabel: "닌", color: "#E60012", category: "게임" },
  { name: "유데미", iconLabel: "U", color: "#A435F0", category: "교육" },
  { name: "인프런", iconLabel: "인", color: "#1273EB", category: "교육" },
  { name: "링글", iconLabel: "R", color: "#1B2B4B", category: "교육" },
  { name: "탈잉", iconLabel: "탈", color: "#4E3CFA", category: "교육" },
  { name: "클로드 프로", iconLabel: "C", color: "#D97757", category: "AI" },
  { name: "퍼플렉시티 프로", iconLabel: "P", color: "#20808D", category: "AI" },
  { name: "제미나이 어드밴스", iconLabel: "G", color: "#4285F4", category: "AI" },
  { name: "캔바 프로", iconLabel: "Ca", color: "#00C4CC", category: "생산성" },
  { name: "피그마", iconLabel: "F", color: "#F24E1E", category: "생산성" },
  { name: "퍼블리", iconLabel: "퍼", color: "#181818", category: "콘텐츠" },
];

const DEFAULT_PRESET: Pick<SubscriptionPreset, "iconLabel" | "color"> = {
  iconLabel: "S",
  color: "#18CFC3",
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s+.\-_/·]/g, "");
}

/** Iterative Levenshtein distance between two strings. */
function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[rows - 1][cols - 1];
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (nb.includes(na) || na.includes(nb)) return 0.9;

  const distance = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - distance / maxLen;
}

export interface SuggestionResult extends SubscriptionPreset {
  score: number;
}

/** 입력값과 가장 유사한 구독 서비스를 점수순으로 반환한다. */
export function suggestSubscriptions(query: string, limit = 4): SuggestionResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return KOREAN_SUBSCRIPTIONS.map((preset) => ({
    ...preset,
    score: similarity(trimmed, preset.name),
  }))
    .filter((result) => result.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** 저장 시 사용할 아이콘/컬러를 이름 기준으로 찾아준다. 일치하는 프리셋이 없으면 기본값. */
export function resolvePresetByName(name: string): Pick<SubscriptionPreset, "iconLabel" | "color"> {
  const exact = KOREAN_SUBSCRIPTIONS.find((p) => normalize(p.name) === normalize(name));
  if (exact) return { iconLabel: exact.iconLabel, color: exact.color };

  const [best] = suggestSubscriptions(name, 1);
  if (best && best.score >= 0.6) return { iconLabel: best.iconLabel, color: best.color };

  return { ...DEFAULT_PRESET, iconLabel: name.trim().charAt(0).toUpperCase() || "S" };
}
