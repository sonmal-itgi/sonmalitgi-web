import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/**
 * LessonAlias
 * - /lesson/mid-:id 또는 /lesson/adv-:id 로 접근했을 때
 *   /lesson/:id 로 즉시 리다이렉트합니다.
 * - 쿼리스트링이 있으면 그대로 보존합니다.
 */
export default function LessonAlias() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = location.search || "";
    navigate(`/lesson/${id}${search}`, { replace: true });
  }, [id, location.search, navigate]);

  return null;
}
