// Unit metadata and expressions are shared by the list and the lesson screen.
const beginnerLessons = {
    1: {
        title: "숫자",
        description: "한국수어 숫자의 기본 표현을 학습합니다.",
        expressions: [
            {
                word: "1",
                description: "숫자 1을 나타내는 한국수어입니다.",
            },
            {
                word: "2",
                description: "숫자 2를 나타내는 한국수어입니다.",
            },
            {
                word: "3",
                description: "숫자 3을 나타내는 한국수어입니다.",
            },
            {
                word: "4",
                description: "숫자 4를 나타내는 한국수어입니다.",
            },
        ],
    },

    2: {
        title: "모음 · 자음",
        description: "한국수어의 기본 문자 표현을 학습합니다.",
        expressions: [
            {
                word: "ㄱ",
                description: "자음 ㄱ을 나타내는 한국수어입니다.",
            },
            {
                word: "ㄴ",
                description: "자음 ㄴ을 나타내는 한국수어입니다.",
            },
            {
                word: "ㅏ",
                description: "모음 ㅏ를 나타내는 한국수어입니다.",
            },
            {
                word: "ㅓ",
                description: "모음 ㅓ를 나타내는 한국수어입니다.",
            },
        ],
    },

    3: {
        title: "쉬운 단어",
        description: "일상에서 자주 사용하는 익숙한 단어를 학습합니다.",
        expressions: [
            {
                word: "안녕",
                description: "인사를 할 때 사용하는 한국수어입니다.",
            },
            {
                word: "엄마",
                description: "어머니를 나타내는 한국수어입니다.",
            },
            {
                word: "아빠",
                description: "아버지를 나타내는 한국수어입니다.",
            },
            {
                word: "친구",
                description: "친구를 나타내는 한국수어입니다.",
            },
        ],
    },
};
const extraExpressions = {
  "4": [
    {
      "word": "저는 민수입니다",
      "description": "자신의 이름을 소개하는 표현을 연습해요."
    },
    {
      "word": "만나서 반갑습니다",
      "description": "처음 만난 사람에게 인사하는 상황이에요."
    },
    {
      "word": "이름이 무엇인가요?",
      "description": "상대방의 이름을 묻는 표현을 연습해요."
    },
    {
      "word": "저는 학생입니다",
      "description": "자신의 신분을 소개하는 상황이에요."
    },
    {
      "word": "저는 서울에 살아요",
      "description": "살고 있는 지역을 소개해요."
    },
    {
      "word": "취미는 독서예요",
      "description": "좋아하는 활동을 소개해요."
    },
    {
      "word": "가족을 소개할게요",
      "description": "가족에 관한 대화를 시작해요."
    },
    {
      "word": "우리 가족은 네 명이에요",
      "description": "가족 구성원 수를 이야기해요."
    },
    {
      "word": "이분은 제 어머니예요",
      "description": "어머니를 소개하는 상황이에요."
    },
    {
      "word": "이분은 제 아버지예요",
      "description": "아버지를 소개하는 상황이에요."
    },
    {
      "word": "형제가 있나요?",
      "description": "상대방의 가족에 대해 질문해요."
    },
    {
      "word": "저에게는 동생이 있어요",
      "description": "형제자매에 대해 이야기해요."
    }
  ],
  "5": [
    {
      "word": "오늘 기분이 어때요?",
      "description": "상대방의 기분을 묻는 상황이에요."
    },
    {
      "word": "오늘 기분이 좋아요",
      "description": "자신의 기분을 전해요."
    },
    {
      "word": "지금 몇 시인가요?",
      "description": "현재 시간을 질문해요."
    },
    {
      "word": "내일 만나요",
      "description": "다음 만남을 약속해요."
    },
    {
      "word": "어디에 가나요?",
      "description": "상대방의 목적지를 질문해요."
    },
    {
      "word": "학교에 가요",
      "description": "자신의 목적지를 이야기해요."
    },
    {
      "word": "함께 점심 먹을까요?",
      "description": "함께 식사하자고 제안해요."
    },
    {
      "word": "무엇을 먹고 싶어요?",
      "description": "먹고 싶은 음식을 질문해요."
    },
    {
      "word": "물을 마시고 싶어요",
      "description": "원하는 것을 전달해요."
    },
    {
      "word": "오늘 날씨가 좋아요",
      "description": "날씨에 관한 대화를 나눠요."
    },
    {
      "word": "비가 와요",
      "description": "비가 오는 상황을 이야기해요."
    },
    {
      "word": "조금 기다려주세요",
      "description": "상대방에게 기다려달라고 요청해요."
    },
    {
      "word": "다시 이야기해주세요",
      "description": "내용을 다시 전달해달라고 요청해요."
    },
    {
      "word": "도와주셔서 감사합니다",
      "description": "도움을 받은 뒤 감사 인사를 전해요."
    },
    {
      "word": "다음에 또 만나요",
      "description": "대화를 마치며 인사해요."
    }
  ],
  "6": [
    {
      "word": "진료를 받고 싶어요",
      "description": "병원 접수 상황을 연습해요."
    },
    {
      "word": "예약했어요",
      "description": "병원에서 예약 여부를 이야기해요."
    },
    {
      "word": "어디가 아픈가요?",
      "description": "아픈 부위를 묻는 대화예요."
    },
    {
      "word": "머리가 아파요",
      "description": "증상을 설명하는 상황이에요."
    },
    {
      "word": "언제부터 아팠나요?",
      "description": "증상이 시작된 시점을 질문해요."
    },
    {
      "word": "어제부터 아팠어요",
      "description": "증상이 시작된 시점을 알려줘요."
    },
    {
      "word": "약은 어떻게 먹나요?",
      "description": "복약 방법을 질문하는 상황이에요."
    },
    {
      "word": "수어 통역이 필요해요",
      "description": "의사소통에 필요한 지원을 요청해요."
    },
    {
      "word": "메뉴를 보여주세요",
      "description": "음식점에서 메뉴를 요청해요."
    },
    {
      "word": "이 음식에 무엇이 들어가나요?",
      "description": "음식의 재료를 질문해요."
    },
    {
      "word": "알레르기가 있어요",
      "description": "음식 주문 전에 필요한 정보를 전해요."
    },
    {
      "word": "맵지 않게 해주세요",
      "description": "음식 조리 방식에 관한 요청을 해요."
    },
    {
      "word": "계산해주세요",
      "description": "음식점에서 계산을 요청해요."
    },
    {
      "word": "카드로 결제할게요",
      "description": "결제 방법을 이야기해요."
    },
    {
      "word": "수업은 몇 시에 시작하나요?",
      "description": "학교에서 수업 시간을 질문해요."
    },
    {
      "word": "질문이 있어요",
      "description": "수업 중 질문 의사를 전해요."
    },
    {
      "word": "이 부분을 설명해주세요",
      "description": "이해하기 어려운 내용을 질문해요."
    },
    {
      "word": "천천히 설명해주세요",
      "description": "설명 속도를 조절해달라고 요청해요."
    },
    {
      "word": "도움이 필요해요",
      "description": "도움이 필요한 상황을 전해요."
    },
    {
      "word": "응급 상황이에요",
      "description": "긴급한 상황임을 알리는 표현을 연습해요."
    }
  ],
  "7": [
    {
      "word": "도서관은 어디에 있나요?",
      "description": "목적지의 위치를 질문해요."
    },
    {
      "word": "이 주소로 가고 싶어요",
      "description": "찾아가려는 주소를 전달해요."
    },
    {
      "word": "지도를 보여주세요",
      "description": "지도 확인을 요청해요."
    },
    {
      "word": "현재 위치가 어디인가요?",
      "description": "지금 있는 위치를 질문해요."
    },
    {
      "word": "앞으로 쭉 가세요",
      "description": "직진하는 경로를 설명해요."
    },
    {
      "word": "왼쪽으로 가세요",
      "description": "왼쪽 방향을 안내해요."
    },
    {
      "word": "오른쪽으로 가세요",
      "description": "오른쪽 방향을 안내해요."
    },
    {
      "word": "사거리에서 왼쪽으로 가세요",
      "description": "교차로를 기준으로 경로를 설명해요."
    },
    {
      "word": "횡단보도를 건너세요",
      "description": "횡단보도를 이용하는 경로를 안내해요."
    },
    {
      "word": "은행 옆에 있어요",
      "description": "주변 건물을 기준으로 위치를 설명해요."
    },
    {
      "word": "학교 맞은편에 있어요",
      "description": "맞은편에 있는 장소를 안내해요."
    },
    {
      "word": "건물 뒤에 있어요",
      "description": "건물을 기준으로 위치를 설명해요."
    },
    {
      "word": "2층으로 올라가세요",
      "description": "건물 안에서 층을 안내해요."
    },
    {
      "word": "엘리베이터는 어디인가요?",
      "description": "이동 시설의 위치를 질문해요."
    },
    {
      "word": "버스 정류장은 어디인가요?",
      "description": "대중교통을 타는 장소를 질문해요."
    },
    {
      "word": "어느 버스를 타야 하나요?",
      "description": "목적지로 가는 버스를 질문해요."
    },
    {
      "word": "다음 정류장에서 내려요",
      "description": "내릴 정류장을 안내해요."
    },
    {
      "word": "지하철로 갈아타세요",
      "description": "교통수단을 바꾸는 경로를 설명해요."
    },
    {
      "word": "걸어서 얼마나 걸리나요?",
      "description": "도보 이동 시간을 질문해요."
    },
    {
      "word": "길을 잃었어요",
      "description": "길을 찾는 데 도움이 필요한 상황이에요."
    }
  ]
};
const levelDefinitions = {
    beginner: {
        name: "초급",
        cefr: "A1",
        description: "한국수어의 기본 표현부터 차근차근 학습합니다.",
        units: [
            {
                id: 1,
                title: "숫자",
                description: "한국수어 숫자의 기본 표현을 학습합니다.",
            },
            {
                id: 2,
                title: "모음 · 자음",
                description: "한국수어의 기본 문자 표현을 학습합니다.",
            },
            {
                id: 3,
                title: "쉬운 단어",
                description: "일상에서 자주 사용하는 익숙한 단어를 학습합니다.",
            },
        ],
    },

    intermediate: {
        name: "중급",
        cefr: "A2~B1",
        description: "기본 표현을 바탕으로 일상적인 의사소통을 학습합니다.",
        units: [
            {
                id: 4,
                title: "자기소개 · 가족",
                description: "자신과 가족을 소개하는 표현을 학습합니다.",
            },
            {
                id: 5,
                title: "일상 회화",
                description: "일상생활에서 사용하는 간단한 대화를 학습합니다.",
            },
        ],
    },

    advanced: {
        name: "고급",
        cefr: "B2",
        description: "실제 상황에서 자연스럽게 의사소통하는 표현을 학습합니다.",
        units: [
            {
                id: 6,
                title: "상황별 의사소통",
                description: "병원, 학교, 음식점 등 다양한 상황의 표현을 학습합니다.",
            },
            {
                id: 7,
                title: "길찾기 · 경로 · 주소",
                description: "위치를 묻고 길을 설명하는 표현을 학습합니다.",
            },
        ],
    },
};

export const levels = Object.fromEntries(Object.entries(levelDefinitions).map(([key, level]) => [
  key, { ...level, units: level.units.map((unit) => ({
    ...unit, count: (beginnerLessons[unit.id]?.expressions || extraExpressions[unit.id]).length,
  })) },
]));

export const lessons = Object.fromEntries(Object.entries(levels).flatMap(([levelId, level]) =>
  level.units.map((unit) => [unit.id, {
    ...unit, levelId, expressions: beginnerLessons[unit.id]?.expressions || extraExpressions[unit.id],
  }]),
));

export function getLevelId(value) {
  return Object.hasOwn(levels, value) ? value : 'beginner';
}
