/*
 * [한국수어사전 콘텐츠 이용 안내]
 * 본 서비스의 일부 수어 학습 콘텐츠는 국립국어원 한국수어사전에서 제공하는 자료를 참조합니다.
 * CC BY-NC-ND 2.0 대한민국 라이선스가 적용되는 콘텐츠는 저작자표시, 비영리, 변경금지 조건을 준수해야 합니다.
 * 원본 영상을 임의로 수정하거나, 별도 허가 없이 다운로드 및 재배포하지 않습니다.
 * 확인된 원본 미디어를 직접 연결하고 사전 상세 페이지와 출처를 함께 표시합니다.
 * 주의: 코드 주석은 개발자용 안내이며, 실제 웹페이지에도 이용자가 확인할 수 있는 출처 및 라이선스 정보를 표시해야 합니다.
 */

export const numberSignSource = {
  name: '국립국어원 한국수어사전',
  license: 'CC BY-NC-ND 2.0 대한민국',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/2.0/kr/',
};

const detailPage = 'https://sldict.korean.go.kr/front/sign/signContentsView.do?origin_no=';

const mediaBase = 'https://sldict.korean.go.kr/multimedia/multimedia_files/convert/';

// 사전의 원본 미디어와 상세 페이지를 기존 평가 콘텐츠 ID로 연결한다.
export const numberSignVideos = {
  FS0801: {
    headword: '하나, 일, 한번',
    detailUrl: detailPage + '12573',
    videoUrl: mediaBase + '20220811/1009715/MOV000360025_700X466.webm',
    imageUrl: mediaBase + '20151210/225407/IMG000218038_700X466.jpg',
    handshape: '오른 주먹의 1지를 펴서 바닥이 밖으로 향하게 세운다.',
  },
  FS0802: {
    headword: '둘, 이',
    detailUrl: detailPage + '11057',
    videoUrl: mediaBase + '20220802/1005875/MOV000359877_700X466.webm',
    imageUrl: mediaBase + '20151128/217929/IMG000209339_700X466.jpg',
    handshape: '오른 주먹의 1·2지를 펴서 벌려 바닥이 밖으로 향하게 세운다.',
  },
  FS0803: {
    headword: '삼, 셋',
    detailUrl: detailPage + '11311',
    videoUrl: mediaBase + '20220802/1005904/MOV000359906_700X466.webm',
    imageUrl: mediaBase + '20151208/223809/IMG000216204_700X466.jpg',
    handshape: '오른 주먹의 1·2·3지를 펴서 바닥이 밖으로 향하게 세운다.',
  },
  FS0804: {
    headword: '넷, 사',
    detailUrl: detailPage + '12528',
    videoUrl: mediaBase + '20220811/1009711/MOV000360021_700X466.webm',
    imageUrl: mediaBase + '20151129/218535/IMG000210060_700X466.jpg',
    handshape: '5지를 접고 1·2·3·4지를 벌려 바닥이 밖으로 향하게 세운다.',
  },
  FS0805: {
    headword: '다섯, 오',
    detailUrl: detailPage + '11055',
    videoUrl: mediaBase + '20220802/1005874/MOV000359876_700X466.webm',
    imageUrl: mediaBase + '20151127/217411/IMG000208737_700X466.jpg',
    handshape: '손등이 안으로 향하게 쥔 오른 주먹의 5지를 펴서 눕힌다.',
  },
  FS0806: {
    headword: '육, 여섯',
    detailUrl: detailPage + '12841',
    videoUrl: mediaBase + '20220811/1009786/MOV000360083_700X466.webm',
    imageUrl: mediaBase + '20151226/234938/IMG000229999_700X466.jpg',
    handshape: '오른 주먹의 1·5지를 펴서 등이 밖으로 향하게 모로 세운다.',
  },
  FS0807: {
    headword: '일곱, 칠',
    detailUrl: detailPage + '12674',
    videoUrl: mediaBase + '20220811/1009775/MOV000360072_700X466.webm',
    imageUrl: mediaBase + '20151206/222760/IMG000214931_700X466.jpg',
    handshape: '오른 주먹의 1·2·5지를 펴서 벌려 등이 밖으로 향하게 모로 세운다',
  },
  FS0808: {
    headword: '여덟, 팔',
    detailUrl: detailPage + '11419',
    videoUrl: mediaBase + '20220811/1009769/MOV000360066_700X466.webm',
    imageUrl: mediaBase + '20151207/223237/IMG000215495_700X466.jpg',
    handshape: '오른손을, 4지를 접고 나머지 손가락을 벌려 손등이 밖으로 향하게 비스듬히 세운다.',
  },
  FS0809: {
    headword: '아홉, 구',
    detailUrl: detailPage + '11315',
    videoUrl: mediaBase + '20220811/1009766/MOV000360063_700X466.webm',
    imageUrl: mediaBase + '20151210/225170/IMG000217770_700X466.jpg',
    handshape: '오른손을 펴서 손바닥이 안으로 향하게 비스듬히 세운다.',
  },
  FS0810: {
    headword: '십, 열',
    detailUrl: detailPage + '10919',
    videoUrl: mediaBase + '20220802/1005853/MOV000359855_700X466.webm',
    imageUrl: mediaBase + '20151225/234351/IMG000229202_700X466.jpg',
    handshape: '오른 주먹의 1지를 펴서 약간 구부려 끝이 밖으로 향하게 하여 좌우로 약간 흔든다.',
  },
};
