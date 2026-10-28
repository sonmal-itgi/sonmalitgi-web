// Video URLs can be assigned per expression; the optional base uses CONTENT_ID.mp4.
export function referenceVideoUrl(expression, videoBase = '') {
  if (expression.videoUrl) return expression.videoUrl;
  if (!expression.contentId || !videoBase.trim()) return null;
  return `${videoBase.replace(/\/+$/, '')}/${encodeURIComponent(expression.contentId)}.mp4`;
}

// This is a UI progression rule, not server verification of an AI result.
export function canAdvanceExpression(expression, watched, result) {
  return Boolean(watched && expression.contentId
    && result?.type === 'final' && result.result === 'PASS'
    && result.target_id === expression.contentId
    && result.predicted_id === expression.contentId
    && result.model_mode && result.model_mode !== 'demo');
}
