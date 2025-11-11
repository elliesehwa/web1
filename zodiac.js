// 별자리 시스템 - 기본 성향과 능력치를 결정

const ZODIAC_SIGNS = {
    '양자리': {
        name: '양자리',
        emoji: '♈',
        period: '3/21 - 4/19',
        element: '불',
        description: '도전적이고 열정적인 개척자',
        stats: {
            luck: 75,      // 행운
            power: 85,     // 힘
            wisdom: 60,    // 지혜
            charm: 70      // 매력
        },
        trait: '주사위를 굴릴 때 10% 확률로 +1 보너스'
    },
    '황소자리': {
        name: '황소자리',
        emoji: '♉',
        period: '4/20 - 5/20',
        element: '땅',
        description: '안정적이고 끈기있는 수호자',
        stats: {
            luck: 80,
            power: 70,
            wisdom: 75,
            charm: 65
        },
        trait: '연속 성공 시 보너스 점수 +50%'
    },
    '쌍둥이자리': {
        name: '쌍둥이자리',
        emoji: '♊',
        period: '5/21 - 6/21',
        element: '바람',
        description: '유연하고 재치있는 소통가',
        stats: {
            luck: 85,
            power: 60,
            wisdom: 80,
            charm: 90
        },
        trait: '주사위를 2번 굴려 더 높은 값 선택 가능'
    },
    '게자리': {
        name: '게자리',
        emoji: '♋',
        period: '6/22 - 7/22',
        element: '물',
        description: '감성적이고 직관적인 보호자',
        stats: {
            luck: 90,
            power: 65,
            wisdom: 70,
            charm: 85
        },
        trait: '낮은 주사위 결과를 다시 굴릴 수 있음 (1회)'
    },
    '사자자리': {
        name: '사자자리',
        emoji: '♌',
        period: '7/23 - 8/22',
        element: '불',
        description: '당당하고 카리스마 넘치는 리더',
        stats: {
            luck: 70,
            power: 95,
            wisdom: 75,
            charm: 95
        },
        trait: '높은 점수(5-6) 획득 시 점수 2배'
    },
    '처녀자리': {
        name: '처녀자리',
        emoji: '♍',
        period: '8/23 - 9/22',
        element: '땅',
        description: '분석적이고 완벽주의적인 전략가',
        stats: {
            luck: 75,
            power: 65,
            wisdom: 95,
            charm: 70
        },
        trait: '3회에 1회는 정확히 원하는 숫자 예측 가능'
    },
    '천칭자리': {
        name: '천칭자리',
        emoji: '♎',
        period: '9/23 - 10/22',
        element: '바람',
        description: '조화롭고 공정한 중재자',
        stats: {
            luck: 85,
            power: 70,
            wisdom: 80,
            charm: 90
        },
        trait: '홀수/짝수 맞추면 보너스 +100점'
    },
    '전갈자리': {
        name: '전갈자리',
        emoji: '♏',
        period: '10/23 - 11/21',
        element: '물',
        description: '강렬하고 신비로운 변화의 주인',
        stats: {
            luck: 80,
            power: 90,
            wisdom: 85,
            charm: 75
        },
        trait: '위험한 선택 시 성공하면 점수 3배'
    },
    '사수자리': {
        name: '사수자리',
        emoji: '♐',
        period: '11/22 - 12/21',
        element: '불',
        description: '자유롭고 낙관적인 모험가',
        stats: {
            luck: 95,
            power: 80,
            wisdom: 75,
            charm: 85
        },
        trait: '행운의 주사위 - 모든 결과에 +15% 보너스'
    },
    '염소자리': {
        name: '염소자리',
        emoji: '♑',
        period: '12/22 - 1/19',
        element: '땅',
        description: '책임감 있고 목표지향적인 성취자',
        stats: {
            luck: 70,
            power: 85,
            wisdom: 90,
            charm: 65
        },
        trait: '연속 플레이 시 누적 보너스 (+5%씩 증가)'
    },
    '물병자리': {
        name: '물병자리',
        emoji: '♒',
        period: '1/20 - 2/18',
        element: '바람',
        description: '독창적이고 혁신적인 개혁가',
        stats: {
            luck: 85,
            power: 70,
            wisdom: 95,
            charm: 80
        },
        trait: '무작위 특수 효과 발동 (긍정적)'
    },
    '물고기자리': {
        name: '물고기자리',
        emoji: '♓',
        period: '2/19 - 3/20',
        element: '물',
        description: '상상력 풍부하고 공감능력이 뛰어난 꿈꾸는 자',
        stats: {
            luck: 100,
            power: 60,
            wisdom: 85,
            charm: 95
        },
        trait: '직감 모드 - 운이 나쁠 때 자동 보정'
    }
};

// 날짜로 별자리 계산
function getZodiacSign(month, day) {
    const zodiacDates = [
        { name: '염소자리', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
        { name: '물병자리', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
        { name: '물고기자리', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
        { name: '양자리', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
        { name: '황소자리', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
        { name: '쌍둥이자리', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
        { name: '게자리', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
        { name: '사자자리', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
        { name: '처녀자리', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
        { name: '천칭자리', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
        { name: '전갈자리', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
        { name: '사수자리', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 }
    ];

    for (let zodiac of zodiacDates) {
        if (zodiac.startMonth === zodiac.endMonth) {
            if (month === zodiac.startMonth && day >= zodiac.startDay && day <= zodiac.endDay) {
                return ZODIAC_SIGNS[zodiac.name];
            }
        } else {
            if ((month === zodiac.startMonth && day >= zodiac.startDay) ||
                (month === zodiac.endMonth && day <= zodiac.endDay)) {
                return ZODIAC_SIGNS[zodiac.name];
            }
        }
    }

    return ZODIAC_SIGNS['물고기자리']; // 기본값
}

// 별자리 정보를 HTML로 표시
function displayZodiacInfo(zodiacSign) {
    const zodiacInfoDiv = document.getElementById('zodiac-info');

    zodiacInfoDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 4em; margin-bottom: 10px;">${zodiacSign.emoji}</div>
            <h3 style="margin: 10px 0; color: #764ba2;">${zodiacSign.name}</h3>
            <p style="color: #666; margin: 5px 0;">${zodiacSign.period}</p>
            <p style="color: #888; font-style: italic; margin: 10px 0;">${zodiacSign.description}</p>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="font-weight: 600; color: #764ba2; margin-bottom: 8px;">✨ 특수 능력</p>
            <p style="color: #555;">${zodiacSign.trait}</p>
        </div>
    `;
}

// 스탯 바 표시
function displayStats(stats) {
    const baseStatsDiv = document.getElementById('base-stats');

    const statNames = {
        luck: '🍀 행운',
        power: '💪 힘',
        wisdom: '🧠 지혜',
        charm: '✨ 매력'
    };

    baseStatsDiv.innerHTML = Object.entries(stats).map(([key, value]) => `
        <div class="stat-bar">
            <div class="stat-name">${statNames[key]}</div>
            <div class="stat-value">${value}</div>
            <div style="background: #e0e0e0; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${value}%; transition: width 0.3s;"></div>
            </div>
        </div>
    `).join('');
}
