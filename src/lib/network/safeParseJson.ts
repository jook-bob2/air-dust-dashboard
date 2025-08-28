/**
 * 응답을 안전하게 JSON으로 파싱하는 유틸리티 함수
 * - XML, HTML 등 비정상 응답 처리
 * - 빈 응답 처리
 * - JSON 파싱 오류 처리
 */
export async function safeParseJson<T>(res: Response): Promise<T | null> {
  // 응답 텍스트 먼저 읽기 (일부 서버가 content-type을 잘못 설정하는 문제 대응)
  let text: string;
  try {
    text = await res.text();
  } catch (error) {
    console.warn('응답 텍스트를 읽을 수 없음:', error);
    return null;
  }

  const contentType = res.headers.get('content-type') || '';

  // 빈 응답 처리
  if (!text || text.trim() === '') {
    console.warn('API 응답이 비어 있습니다');
    return null;
  }

  // content-type이 XML/HTML로 표기되어 있어도, 본문이 JSON이면 JSON으로 파싱 시도
  const looksLikeJson = text.trim().startsWith('{') || text.trim().startsWith('[');
  if (looksLikeJson) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('JSON 파싱 경고:', error);
      const preview = text.length > 200 ? `${text.substring(0, 200)}...` : text;
      console.warn('파싱할 수 없는 응답(미리보기):', preview);
      return null;
    }
  }

  // XML/HTML 응답 여부 확인
  if (contentType.includes('text/html') || text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
    console.warn('API 서버에서 HTML 응답 반환');
    return null;
  }
  if (contentType.includes('text/xml') || contentType.includes('application/xml') || text.trim().startsWith('<?xml') || text.trim().startsWith('<OpenAPI_ServiceResponse')) {
    console.warn('API 서버에서 XML 응답 반환');
    return null;
  }

  // 마지막 방어: content-type이 json인데도 본문이 json이 아닐 때
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('JSON 파싱 경고:', error);
    const preview = text.length > 200 ? `${text.substring(0, 200)}...` : text;
    console.warn('파싱할 수 없는 응답(미리보기):', preview);
    return null;
  }
}
