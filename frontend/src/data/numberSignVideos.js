/*
 * [한국수어사전 콘텐츠 이용 안내]
 * 본 서비스의 일부 수어 학습 콘텐츠는 국립국어원 한국수어사전에서 제공하는 자료를 참조합니다.
 * CC BY-NC-ND 2.0 대한민국 라이선스가 적용되는 콘텐츠는 저작자표시, 비영리, 변경금지 조건을 준수해야 합니다.
 * 원본 영상을 임의로 수정하거나, 별도 허가 없이 다운로드 및 재배포하지 않습니다.
 * 공식적으로 허용된 임베드 방식 또는 원본 상세 페이지 연결 방식만 사용합니다.
 * 주의: 코드 주석은 개발자용 안내이며, 실제 웹페이지에도 이용자가 확인할 수 있는 출처 및 라이선스 정보를 표시해야 합니다.
 */

export const numberSignSource = {
  name: '국립국어원 한국수어사전',
  license: 'CC BY-NC-ND 2.0 대한민국',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/2.0/kr/',
  policyUrl: 'https://sldict.korean.go.kr/front/main/copyRightPolicy.do',
};

const detailPage = 'https://sldict.korean.go.kr/front/sign/signContentsView.do?origin_no=';

// 확인된 원본 영상 상세 페이지를 기존 평가 콘텐츠 ID로 연결한다.
export const numberSignVideos = {
  FS0801: { headword: '하나, 일, 한번', detailUrl: detailPage + '12573' },
  FS0802: { headword: '둘, 이', detailUrl: detailPage + '11057' },
  FS0803: { headword: '삼, 셋', detailUrl: detailPage + '11311' },
  FS0804: { headword: '넷, 사', detailUrl: detailPage + '12528' },
  FS0805: { headword: '다섯, 오', detailUrl: detailPage + '11055' },
  FS0806: { headword: '육, 여섯', detailUrl: detailPage + '12841' },
  FS0807: { headword: '일곱, 칠', detailUrl: detailPage + '12674' },
  FS0808: { headword: '여덟, 팔', detailUrl: detailPage + '11419' },
  FS0809: { headword: '아홉, 구', detailUrl: detailPage + '11315' },
  FS0810: { headword: '십, 열', detailUrl: detailPage + '10919' },
};
