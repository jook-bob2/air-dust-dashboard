/**
 * 응답을 안전하게 JSON으로 파싱하는 유틸리티 함수
 * - XML, HTML 등 비정상 응답 처리
 * - 빈 응답 처리
 * - JSON 파싱 오류 처리
 */
export async function safeParseJson<T>(res: Response): Promise<T | null> {
  // 헤더를 통한 초기 검증
  const contentType = res.headers.get('content-type');

  // 응답이 HTML이나 XML인지 확인 (API 오류 대응)
  if (contentType) {
    if (contentType.includes('text/html')) {
      console.warn('API 서버에서 HTML 응답 반환');
      return null;
    }
    if (contentType.includes('text/xml') || contentType.includes('application/xml')) {
      console.warn('API 서버에서 XML 응답 반환');
      return null;
    }
  }

  // 응답 텍스트 가져오기
  let text: string;
  try {
    text = await res.text();
  } catch (error) {
    console.warn('응답 텍스트를 읽을 수 없음:', error);
    return null;
  }

  // 빈 응답 처리
  if (!text || text.trim() === '') {
    console.warn('API 응답이 비어 있습니다');
    return null;
  }

  // XML 응답 여부 확인 (Content-Type 헤더가 없는 경우를 위한 추가 검사)
  if (text.startsWith('<?xml') || text.startsWith('<OpenAPI_ServiceResponse')) {
    console.warn('API 응답이 XML입니다. 오류 발생 가능성 있음');
    return null;
  }

  // HTML 응답 여부 확인 (Content-Type 헤더가 없는 경우를 위한 추가 검사)
  if (text.startsWith('<!DOCTYPE html>') || text.startsWith('<html')) {
    console.warn('API 응답이 HTML입니다. 오류 발생 가능성 있음');
    return null;
  }

  // JSON 파싱 시도
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('JSON 파싱 경고:', error);
    // 디버깅을 위해 응답의 일부만 로깅 (너무 길 수 있으므로)
    const preview = text.length > 200 ? `${text.substring(0, 200)}...` : text;
    console.warn('파싱할 수 없는 응답(미리보기):', preview);
    return null;
  }
}
