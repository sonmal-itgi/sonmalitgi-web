import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Lesson from "./Lesson.jsx";

/**
 * LessonRoute
 * - /lesson/:id로 진입했을 때 id에 접두어(mid-, adv-, 등)가 있으면 제거해 숫자 id로 정규화합니다.
 * - 정규화 결과가 기존과 다르면 /lesson/{정규화된숫자}로 replace 리다이렉트합니다.
 * - 이미 숫자인 경우에는 그대로 Lesson을 렌더링합니다.
 */
export default function LessonRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const normalized = useMemo(() => {
    if (!id) return id;

    // 접두어 목록(소문자 기준) - 하이픈/언더스코어/한글 변형까지 대응
    const prefixes = [
      "mid-",
      "adv-",
      "mid_",
      "adv_",
      "m-",
      "a-",
      "m_",
      "a_",
      "중급-",
      "고급-",
      "beg-",
      "beginner-",
    ];

    let next = id;
    const lower = id.toLowerCase();
    for (const p of prefixes) {
      if (lower.startsWith(p)) {
        next = id.slice(p.length);
        break;
      }
    }

    // 숫자만 추출(예: "mid_12a" -> "12")
    if (!/^\d+$/.test(next)) {
      const m = next.match(/(\d+)/);
      if (m) {
        next = m[1];
      } else {
        // 숫자를 전혀 못 찾았으면 안전하게 1로 폴백
        next = "1";
      }
    }

    return next;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (!normalized) return;

    // 정규화 결과가 다르면 /lesson/{normalized} 로 이동
    if (normalized !== id) {
      const search = location.search || "";
      navigate(`/lesson/${normalized}${search}`, { replace: true });
    }
  }, [id, normalized, location.search, navigate]);

  // 리다이렉트가 필요한 경우에는 빈 렌더링
  if (normalized !== id) return null;

  // 그대로 렌더링
  return <Lesson key={normalized} />;
}
