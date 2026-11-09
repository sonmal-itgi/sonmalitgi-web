/*
 * [한국수어사전 콘텐츠 이용 안내]
 * 본 서비스의 일부 수어 학습 콘텐츠는 국립국어원 한국수어사전에서 제공하는 자료를 참조합니다.
 * CC BY-NC-ND 2.0 대한민국 라이선스가 적용되는 콘텐츠는 저작자표시, 비영리, 변경금지 조건을 준수해야 합니다.
 * 원본 영상을 임의로 수정하거나, 별도 허가 없이 다운로드 및 재배포하지 않습니다.
 * 확인된 원본 미디어를 직접 연결하고 사전 상세 페이지와 출처를 함께 표시합니다.
 * 주의: 코드 주석은 개발자용 안내이며, 실제 웹페이지에도 이용자가 확인할 수 있는 출처 및 라이선스 정보를 표시해야 합니다.
 */

export const dictionarySignSource = {
  name: '국립국어원 한국수어사전',
  license: 'CC BY-NC-ND 2.0 대한민국',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/2.0/kr/',
};

const detailPage = 'https://sldict.korean.go.kr/front/sign/signContentsView.do?origin_no=';

const mediaBase = 'https://sldict.korean.go.kr/multimedia/multimedia_files/convert/';

// 사전의 원본 미디어와 상세 페이지를 평가 콘텐츠 ID 또는 숫자 표기로 연결한다.
export const dictionarySignVideos = {
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
  '11': {
    headword: '열하나, 십일',
    detailUrl: detailPage + '11425',
    videoUrl: mediaBase + '20220811/1009762/MOV000360059_700X466.webm',
    imageUrl: mediaBase + '20151207/223681/IMG000216049_700X466.jpg',
    handshape: '오른 주먹의 1지를 펴서 바닥이 밖으로 향하게 세워 굽혔다 편다.',
  },
  '12': {
    headword: '십이, 열둘',
    detailUrl: detailPage + '10923',
    videoUrl: mediaBase + '20220811/1009761/MOV000360058_700X466.webm',
    imageUrl: mediaBase + '20151225/234362/IMG000229221_700X466.jpg',
    handshape: '오른 주먹의 1지를 굽히고 2지를 펴서 바닥이 밖으로 향하게 세운다.',
  },
  FS0823: {
    headword: '두 사람',
    detailUrl: detailPage + '2259',
    videoUrl: mediaBase + '20220801/1005046/MOV000359774_700X466.webm',
    imageUrl: mediaBase + '20151125/216176/IMG000207276_700X466.jpg',
    handshape: '왼 주먹에서 1·2지를 펴고 손바닥을 오른쪽으로 향하게 세운다. 그 오른쪽 아래에서 오른 주먹의 4·5지를 펴 세운 뒤 손목을 좌우로 가볍게 두 번 돌린다.',
  },
  WORD1290: {
    headword: '감사',
    detailUrl: detailPage + '2372',
    videoUrl: mediaBase + '20191028/632085/MOV000243986_700X466.webm',
    imageUrl: mediaBase + '20151204/221972/IMG000214002_700X466.jpg',
    handshape: '왼손을 손등이 위로 향하게 펴고, 오른손을 모로 세워 넷째 손가락 옆면으로 왼 손등을 두 번 댄다.',
  },
  WORD1201: {
    headword: '죄송',
    detailUrl: detailPage + '9917',
    videoUrl: mediaBase + '20191022/630183/MOV000253802_700X466.webm',
    imageUrl: mediaBase + '20151231/238194/IMG000234152_700X466.jpg',
    handshape: '오른손 엄지와 새끼손가락 끝을 맞대어 이마에 댄 뒤, 두 손가락을 펴면서 왼 손등 위에 내려놓는다.',
  },
  WORD1589: {
    headword: '부탁',
    detailUrl: detailPage + '22',
    videoUrl: mediaBase + '20191016/628275/MOV000254602_700X466.webm',
    imageUrl: mediaBase + '20151117/211360/IMG000201649_700X466.jpg',
    handshape: '왼 주먹의 새끼손가락을 펴 세우고, 모로 세운 오른손의 손끝이 그 손가락 등을 향하게 한 뒤 위아래로 두 번 흔든다.',
  },
  WORD1191: {
    headword: '좋다',
    detailUrl: detailPage + '9078',
    videoUrl: mediaBase + '20191022/629987/MOV000259382_700X466.webm',
    imageUrl: mediaBase + '20151231/238156/IMG000234137_700X466.jpg',
    handshape: '오른 주먹을 들어 엄지와 새끼손가락의 옆면이 코에 닿게 한다.',
  },
  WORD1185: {
    headword: '알다',
    detailUrl: detailPage + '6031',
    videoUrl: mediaBase + '20191011/626557/MOV000256441_700X466.webm',
    imageUrl: mediaBase + '20151227/235307/IMG000230474_700X466.jpg',
    handshape: '오른 손바닥으로 가슴을 위에서 아래로 두 번 쓸어내린다.',
  },
  WORD1342: {
    headword: '왼쪽',
    detailUrl: detailPage + '12035',
    videoUrl: mediaBase + '20191029/632241/MOV000257078_700X466.webm',
    imageUrl: mediaBase + '20151228/235915/IMG000231272_700X466.jpg',
    handshape: '오른손을 왼팔에 두 번 댄다.',
  },
  WORD1343: {
    headword: '오른쪽',
    detailUrl: detailPage + '6036',
    videoUrl: mediaBase + '20191011/626559/MOV000256467_700X466.webm',
    imageUrl: mediaBase + '20151227/235323/IMG000230503_700X466.jpg',
    handshape: '왼 손바닥을 오른 팔등에 두 번 댄다.',
  },
  WORD1345: {
    headword: '가다',
    detailUrl: detailPage + '11796',
    videoUrl: mediaBase + '20191028/632050/MOV000249486_700X466.webm',
    imageUrl: mediaBase + '20151216/228680/IMG000221896_700X466.jpg',
    handshape: '오른손을 펴서 손등은 바깥쪽, 손끝은 아래쪽을 향하게 한다. 손을 내밀며 손끝을 살짝 들어 올린다.',
  },
  WORD1149: {
    headword: '오다',
    detailUrl: detailPage + '7704',
    videoUrl: mediaBase + '20191016/628281/MOV000256338_700X466.webm',
    imageUrl: mediaBase + '20151227/235201/IMG000230346_700X466.jpg',
    handshape: '오른 주먹의 손등이 밖을 향하도록 하고 검지를 편 상태에서 몸 쪽으로 당긴다.',
  },
  WORD1295: {
    headword: '걷다',
    detailUrl: detailPage + '3762',
    videoUrl: mediaBase + '20191007/624840/MOV000249241_700X466.webm',
    imageUrl: mediaBase + '20151215/228426/IMG000221578_700X466.jpg',
    handshape: '오른손 검지와 중지를 펴서 아래를 향하게 하고 두 손가락을 번갈아 앞으로 내민다.',
  },
  WORD1274: {
    headword: '달리다',
    detailUrl: detailPage + '10373',
    alternate: { headword: '달리기, 달리다, 뛰다', detailUrl: detailPage + '3903' },
    videoUrl: mediaBase + '20200824/735034/MOV000251491_700X466.webm',
    imageUrl: mediaBase + '20151219/230569/IMG000224381_700X466.jpg',
    handshape: '두 팔을 옆구리에 붙이고 편 두 손을 마주 보게 한 뒤, 위아래로 짧고 빠르게 함께 흔든다.',
  },
};

const sentenceWords = {
  운전: {
    headword: '운전',
    detailUrl: detailPage + '7857',
    videoUrl: mediaBase + '20191017/628484/MOV000255305_700X466.webm',
    imageUrl: mediaBase + '20151225/234262/IMG000229102_700X466.jpg',
    handshape: '두 주먹을 가볍게 쥐어 가슴 앞으로 올리고 좌우로 두 번 돌린다.',
  },
  천천히: {
    headword: '천천히',
    detailUrl: detailPage + '9928',
    videoUrl: mediaBase + '20191029/632479/MOV000257966_700X466.webm',
    imageUrl: mediaBase + '20151229/236789/IMG000232364_700X466.jpg',
    handshape: '왼손을 손등이 위로 향하게 펴고, 그 위에 모로 세운 오른손을 천천히 바깥쪽으로 내민다.',
  },
  빨리: {
    headword: '빨리',
    detailUrl: detailPage + '12442',
    videoUrl: mediaBase + '20191014/627300/MOV000248334_700X466.webm',
    imageUrl: mediaBase + '20151214/227513/IMG000220416_700X466.jpg',
    handshape: '오른손 1·5지를 위로 펴고, 손을 빠르게 올리면서 두 손가락 끝을 맞댄다.',
  },
  시간: {
    headword: '시간',
    detailUrl: detailPage + '11301',
    videoUrl: mediaBase + '20200812/728378/MOV000246426_700X466.webm',
    imageUrl: mediaBase + '20151209/224950/IMG000217529_700X466.jpg',
    handshape: '왼손을 모로 세워 손끝을 밖으로 향하게 한다. 오른손 1·5지를 벌려 펴고, 5지 끝을 왼 손바닥에 댄 뒤 1지를 밖으로 돌린다.',
  },
  급하다: {
    headword: '급하다',
    detailUrl: detailPage + '23958',
    videoUrl: mediaBase + '20191015/627523/MOV000249452_700X466.webm',
    imageUrl: mediaBase + '20151222/232350/IMG000226552_700X466.jpg',
    handshape: '왼 손바닥을 오른쪽으로 향하게 세운 뒤, 반쯤 구부린 오른손 검지 끝으로 왼 손바닥을 두 번 두드린다.',
  },
  약속: {
    headword: '약속',
    detailUrl: detailPage + '12710',
    videoUrl: mediaBase + '20191015/627703/MOV000250441_700X466.webm',
    imageUrl: mediaBase + '20151217/229658/IMG000223119_700X466.jpg',
    handshape: '두 주먹에서 각각 4지를 펴고, 두 손가락을 구부려 서로 건다.',
  },
};

export const dictionarySentenceVideos = {
  SEN0009: [sentenceWords.운전, sentenceWords.천천히],
  SEN0011: [sentenceWords.운전, sentenceWords.빨리],
  SEN0012: [dictionarySignVideos.WORD1345, sentenceWords.빨리],
  SEN0013: [sentenceWords.시간, sentenceWords.급하다],
  SEN0017: [sentenceWords.약속, { ...sentenceWords.천천히, headword: '늦다' }],
};
