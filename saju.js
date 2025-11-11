// 사주 시스템 - 운세를 결정

// 천간 (10개)
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 (12개)
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 오행 (五行)
const FIVE_ELEMENTS = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
    '인': '목', '묘': '목',
    '사': '화', '오': '화',
    '진': '토', '술': '토', '축': '토', '미': '토',
    '신': '금', '유': '금',
    '자': '수', '해': '수'
};

// 오행 상생 관계
const ELEMENT_RELATIONS = {
    '목': { good: '화', bad: '금', color: '#52b788' },
    '화': { good: '토', bad: '수', color: '#e63946' },
    '토': { good: '금', bad: '목', color: '#f4a261' },
    '금': { good: '수', bad: '화', color: '#daa520' },
    '수': { good: '목', bad: '토', color: '#457b9d' }
};

// 사주 계산
function calculateSaju(birthYear, birthMonth, birthDay, birthHour) {
    // 간단한 사주 계산 (실제 사주는 더 복잡함)
    const yearStem = HEAVENLY_STEMS[(birthYear - 4) % 10];
    const yearBranch = EARTHLY_BRANCHES[(birthYear - 4) % 12];

    const monthStem = HEAVENLY_STEMS[(birthMonth - 1) % 10];
    const monthBranch = EARTHLY_BRANCHES[(birthMonth - 1) % 12];

    const dayStem = HEAVENLY_STEMS[(birthDay - 1) % 10];
    const dayBranch = EARTHLY_BRANCHES[(birthDay - 1) % 12];

    // 시주 계산 (간단화)
    const hourIndex = getHourIndex(birthHour);
    const hourStem = HEAVENLY_STEMS[hourIndex % 10];
    const hourBranch = EARTHLY_BRANCHES[hourIndex % 12];

    return {
        year: { stem: yearStem, branch: yearBranch },
        month: { stem: monthStem, branch: monthBranch },
        day: { stem: dayStem, branch: dayBranch },
        hour: { stem: hourStem, branch: hourBranch }
    };
}

// 시간을 지지 인덱스로 변환
function getHourIndex(birthHourString) {
    const hourMap = {
        '23-1': 0,   // 자시
        '1-3': 1,    // 축시
        '3-5': 2,    // 인시
        '5-7': 3,    // 묘시
        '7-9': 4,    // 진시
        '9-11': 5,   // 사시
        '11-13': 6,  // 오시
        '13-15': 7,  // 미시
        '15-17': 8,  // 신시
        '17-19': 9,  // 유시
        '19-21': 10, // 술시
        '21-23': 11  // 해시
    };
    return hourMap[birthHourString] || 0;
}

// 일주 (일간)를 기반으로 성격 분석
function getDayMasterAnalysis(dayStem) {
    const analyses = {
        '갑': { personality: '큰 나무처럼 곧고 정직함', fortune: '성장운이 강함' },
        '을': { personality: '유연하고 부드러운 성격', fortune: '적응력이 뛰어남' },
        '병': { personality: '열정적이고 밝은 에너지', fortune: '창조력이 뛰어남' },
        '정': { personality: '따뜻하고 섬세한 마음', fortune: '예술적 재능' },
        '무': { personality: '안정적이고 믿음직함', fortune: '재물운이 좋음' },
        '기': { personality: '부지런하고 성실함', fortune: '축적운이 강함' },
        '경': { personality: '강하고 결단력 있음', fortune: '리더십이 뛰어남' },
        '신': { personality: '세련되고 우아함', fortune: '귀인을 만날 운' },
        '임': { personality: '지혜롭고 깊이 있음', fortune: '학문운이 강함' },
        '계': { personality: '유연하고 지혜로움', fortune: '변화에 강함' }
    };
    return analyses[dayStem] || analyses['갑'];
}

// 오늘의 운세 계산 (사주 + 오늘 날짜 기반)
function calculateDailyFortune(saju) {
    const today = new Date();
    const todayElement = FIVE_ELEMENTS[saju.day.stem];
    const todayBranch = EARTHLY_BRANCHES[today.getDate() % 12];
    const todayBranchElement = FIVE_ELEMENTS[todayBranch];

    // 오행 상생/상극 판단
    let fortuneLevel = 50; // 기본 50%
    const relation = ELEMENT_RELATIONS[todayElement];

    if (todayBranchElement === relation.good) {
        fortuneLevel = 85; // 상생 - 매우 좋음
    } else if (todayBranchElement === relation.bad) {
        fortuneLevel = 30; // 상극 - 나쁨
    } else if (todayBranchElement === todayElement) {
        fortuneLevel = 70; // 같은 오행 - 좋음
    } else {
        fortuneLevel = 55; // 보통
    }

    // 날짜 기반 추가 변동
    const dayBonus = (today.getDate() % 7) * 5;
    fortuneLevel = Math.min(100, fortuneLevel + dayBonus);

    return {
        level: fortuneLevel,
        element: todayElement,
        todayElement: todayBranchElement,
        description: getFortuneDescription(fortuneLevel),
        modifier: getFortuneModifier(fortuneLevel)
    };
}

// 운세 레벨에 따른 설명
function getFortuneDescription(level) {
    if (level >= 85) return '🌟 대길 - 모든 일이 순조롭게 풀리는 날';
    if (level >= 70) return '✨ 길 - 좋은 기회가 찾아오는 날';
    if (level >= 55) return '🌤️ 소길 - 평범하지만 안정적인 날';
    if (level >= 40) return '☁️ 평 - 조심스럽게 행동해야 하는 날';
    if (level >= 25) return '🌧️ 소흉 - 신중함이 필요한 날';
    return '⚡ 흉 - 도전보다는 방어가 유리한 날';
}

// 운세에 따른 게임 보정치
function getFortuneModifier(level) {
    if (level >= 85) return { value: '+30%', multiplier: 1.3, reroll: true };
    if (level >= 70) return { value: '+15%', multiplier: 1.15, reroll: false };
    if (level >= 55) return { value: '+5%', multiplier: 1.05, reroll: false };
    if (level >= 40) return { value: '0%', multiplier: 1.0, reroll: false };
    if (level >= 25) return { value: '-10%', multiplier: 0.9, reroll: false };
    return { value: '-20%', multiplier: 0.8, reroll: false };
}

// 사주 정보 표시
function displaySajuInfo(saju, dailyFortune) {
    const sajuInfoDiv = document.getElementById('saju-info');
    const dayAnalysis = getDayMasterAnalysis(saju.day.stem);

    const elementColor = ELEMENT_RELATIONS[dailyFortune.element].color;

    sajuInfoDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <h4 style="color: #457b9d; margin-bottom: 10px;">사주팔자</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 15px 0;">
                <div style="background: white; padding: 8px; border-radius: 5px;">
                    <div style="font-size: 12px; color: #888;">년주</div>
                    <div style="font-weight: 700; color: ${elementColor};">${saju.year.stem}${saju.year.branch}</div>
                </div>
                <div style="background: white; padding: 8px; border-radius: 5px;">
                    <div style="font-size: 12px; color: #888;">월주</div>
                    <div style="font-weight: 700; color: ${elementColor};">${saju.month.stem}${saju.month.branch}</div>
                </div>
                <div style="background: white; padding: 8px; border-radius: 5px;">
                    <div style="font-size: 12px; color: #888;">일주</div>
                    <div style="font-weight: 700; color: ${elementColor};">${saju.day.stem}${saju.day.branch}</div>
                </div>
                <div style="background: white; padding: 8px; border-radius: 5px;">
                    <div style="font-size: 12px; color: #888;">시주</div>
                    <div style="font-weight: 700; color: ${elementColor};">${saju.hour.stem}${saju.hour.branch}</div>
                </div>
            </div>
        </div>

        <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <p style="font-weight: 600; color: #457b9d; margin-bottom: 5px;">일간: ${saju.day.stem} (${dailyFortune.element})</p>
            <p style="font-size: 14px; color: #666; margin: 3px 0;">${dayAnalysis.personality}</p>
            <p style="font-size: 14px; color: #666; margin: 3px 0;">${dayAnalysis.fortune}</p>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border-radius: 8px;">
            <p style="font-weight: 600; margin-bottom: 5px;">🔮 오늘의 운세</p>
            <p style="font-size: 14px; margin: 3px 0;">${dailyFortune.description}</p>
            <p style="font-size: 12px; margin: 5px 0; opacity: 0.9;">운세 지수: ${dailyFortune.level}/100</p>
        </div>
    `;
}

// 일일 운세 표시 (게임 화면)
function displayDailyFortuneInGame(dailyFortune) {
    document.getElementById('daily-fortune-text').textContent = dailyFortune.description;
    document.getElementById('fortune-modifier').textContent = dailyFortune.modifier.value;
}
