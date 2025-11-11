// 메인 게임 로직

let playerData = {
    zodiacSign: null,
    saju: null,
    dailyFortune: null,
    baseStats: null,
    score: 0,
    rollCount: 0,
    highScore: 0,
    consecutiveSuccess: 0,
    cumulativeBonus: 0
};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-btn');
    const rollBtn = document.getElementById('roll-btn');

    startBtn.addEventListener('click', initializePlayer);
    rollBtn.addEventListener('click', rollDice);

    // 로컬 스토리지에서 최고 점수 불러오기
    playerData.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    updateDisplay();
});

// 플레이어 초기화
function initializePlayer() {
    const birthdate = document.getElementById('birthdate').value;
    const birthHour = document.getElementById('birth-hour').value;

    if (!birthdate || !birthHour) {
        alert('생년월일과 출생 시간을 모두 입력해주세요!');
        return;
    }

    const date = new Date(birthdate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 별자리 계산
    playerData.zodiacSign = getZodiacSign(month, day);

    // 사주 계산
    playerData.saju = calculateSaju(year, month, day, birthHour);

    // 일일 운세 계산
    playerData.dailyFortune = calculateDailyFortune(playerData.saju);

    // 기본 스탯 저장
    playerData.baseStats = { ...playerData.zodiacSign.stats };

    // UI 업데이트
    displayZodiacInfo(playerData.zodiacSign);
    displayStats(playerData.baseStats);
    displaySajuInfo(playerData.saju, playerData.dailyFortune);
    displayDailyFortuneInGame(playerData.dailyFortune);

    // 섹션 표시
    document.getElementById('birth-input-section').classList.add('hidden');
    document.getElementById('fortune-section').classList.remove('hidden');
    document.getElementById('game-section').classList.remove('hidden');

    // 게임 시작 메시지
    showMessage(`${playerData.zodiacSign.emoji} ${playerData.zodiacSign.name}의 힘으로 게임을 시작합니다!`, 'success');
}

// 주사위 굴리기
function rollDice() {
    const dice = document.getElementById('dice-display');
    const rollBtn = document.getElementById('roll-btn');

    // 버튼 비활성화
    rollBtn.disabled = true;
    dice.classList.add('rolling');

    // 애니메이션
    let rollAnimation = setInterval(() => {
        dice.textContent = Math.floor(Math.random() * 6) + 1;
    }, 100);

    // 2초 후 결과 표시
    setTimeout(() => {
        clearInterval(rollAnimation);

        // 실제 주사위 값 결정
        let diceValue = Math.floor(Math.random() * 6) + 1;
        let finalValue = diceValue;
        let messages = [];

        // 별자리 특성 적용
        const zodiacBonus = applyZodiacTrait(diceValue);
        if (zodiacBonus.changed) {
            finalValue = zodiacBonus.value;
            messages.push(zodiacBonus.message);
        }

        // 사주 운세 보정 적용
        const fortuneResult = applyFortuneModifier(finalValue);
        const points = fortuneResult.points;
        messages.push(fortuneResult.message);

        // 결과 표시
        dice.textContent = finalValue;
        dice.classList.remove('rolling');

        // 점수 계산
        playerData.score += points;
        playerData.rollCount++;

        // 연속 성공 체크 (4 이상이면 성공)
        if (finalValue >= 4) {
            playerData.consecutiveSuccess++;
        } else {
            playerData.consecutiveSuccess = 0;
        }

        // 염소자리 누적 보너스
        if (playerData.zodiacSign.name === '염소자리') {
            playerData.cumulativeBonus = Math.min(50, playerData.cumulativeBonus + 5);
        }

        // 최고 점수 업데이트
        if (playerData.score > playerData.highScore) {
            playerData.highScore = playerData.score;
            localStorage.setItem('highScore', playerData.highScore);
            messages.push('🎉 새로운 최고 점수!');
        }

        // UI 업데이트
        updateDisplay();

        // 결과 메시지
        const resultType = points > 50 ? 'success' : points > 20 ? 'warning' : 'danger';
        showMessage(messages.join(' | '), resultType);

        // 버튼 다시 활성화
        rollBtn.disabled = false;
    }, 2000);
}

// 별자리 특성 적용
function applyZodiacTrait(diceValue) {
    const zodiac = playerData.zodiacSign.name;
    let result = { value: diceValue, changed: false, message: '' };

    switch(zodiac) {
        case '양자리':
            // 10% 확률로 +1
            if (Math.random() < 0.1) {
                result.value = Math.min(6, diceValue + 1);
                result.changed = true;
                result.message = '♈ 양자리 특성: +1 보너스!';
            }
            break;

        case '황소자리':
            // 연속 성공 시 보너스
            if (playerData.consecutiveSuccess >= 2) {
                result.message = `♉ 황소자리 특성: 연속 성공 보너스! (x${playerData.consecutiveSuccess})`;
            }
            break;

        case '쌍둥이자리':
            // 2번 굴려 높은 값 (20% 확률)
            if (Math.random() < 0.2) {
                const secondRoll = Math.floor(Math.random() * 6) + 1;
                result.value = Math.max(diceValue, secondRoll);
                result.changed = true;
                result.message = `♊ 쌍둥이자리 특성: 2번 굴림 (${diceValue} vs ${secondRoll})`;
            }
            break;

        case '게자리':
            // 낮은 값 리롤 (1-2만)
            if (diceValue <= 2 && Math.random() < 0.5) {
                result.value = Math.floor(Math.random() * 6) + 1;
                result.changed = true;
                result.message = `♋ 게자리 특성: 리롤! (${diceValue} → ${result.value})`;
            }
            break;

        case '사자자리':
            // 5-6이면 2배
            if (diceValue >= 5) {
                result.message = '♌ 사자자리 특성: 점수 2배!';
            }
            break;

        case '처녀자리':
            // 3회에 1회 정확한 예측 (항상 5)
            if (playerData.rollCount % 3 === 0) {
                result.value = 5;
                result.changed = true;
                result.message = '♍ 처녀자리 특성: 완벽한 예측!';
            }
            break;

        case '천칭자리':
            // 홀수/짝수 예측 (랜덤)
            const prediction = Math.random() < 0.5 ? 'even' : 'odd';
            const isEven = result.value % 2 === 0;
            if ((prediction === 'even' && isEven) || (prediction === 'odd' && !isEven)) {
                result.message = '♎ 천칭자리 특성: 예측 성공! +100점';
            }
            break;

        case '전갈자리':
            // 위험한 선택 (30% 확률로 3배)
            if (Math.random() < 0.3) {
                result.message = '♏ 전갈자리 특성: 위험한 도박 성공! 점수 3배!';
            }
            break;

        case '사수자리':
            // 모든 결과 +15%
            result.message = '♐ 사수자리 특성: 행운의 가호 +15%';
            break;

        case '염소자리':
            // 누적 보너스
            if (playerData.cumulativeBonus > 0) {
                result.message = `♑ 염소자리 특성: 누적 보너스 +${playerData.cumulativeBonus}%`;
            }
            break;

        case '물병자리':
            // 랜덤 특수 효과
            const effects = ['+1 주사위', '+50 점수', '×1.5 점수', '행운의 축복'];
            const effect = effects[Math.floor(Math.random() * effects.length)];
            result.message = `♒ 물병자리 특성: ${effect}`;
            if (effect === '+1 주사위') {
                result.value = Math.min(6, diceValue + 1);
                result.changed = true;
            }
            break;

        case '물고기자리':
            // 운이 나쁠 때 자동 보정
            if (playerData.dailyFortune.level < 40 && diceValue <= 3) {
                result.value = Math.floor(Math.random() * 3) + 4; // 4-6
                result.changed = true;
                result.message = '♓ 물고기자리 특성: 직감으로 위기 회피!';
            }
            break;
    }

    return result;
}

// 사주 운세 보정 적용
function applyFortuneModifier(diceValue) {
    const modifier = playerData.dailyFortune.modifier;
    let basePoints = diceValue * 10;

    // 별자리별 추가 계산
    const zodiac = playerData.zodiacSign.name;

    // 사자자리: 5-6이면 2배
    if (zodiac === '사자자리' && diceValue >= 5) {
        basePoints *= 2;
    }

    // 전갈자리: 위험한 선택
    if (zodiac === '전갈자리' && Math.random() < 0.3) {
        basePoints *= 3;
    }

    // 황소자리: 연속 성공 보너스
    if (zodiac === '황소자리' && playerData.consecutiveSuccess >= 2) {
        basePoints *= (1 + playerData.consecutiveSuccess * 0.2);
    }

    // 천칭자리: 홀짝 맞추기
    if (zodiac === '천칭자리') {
        const prediction = Math.random() < 0.5 ? 'even' : 'odd';
        const isEven = diceValue % 2 === 0;
        if ((prediction === 'even' && isEven) || (prediction === 'odd' && !isEven)) {
            basePoints += 100;
        }
    }

    // 물병자리: 랜덤 보너스
    if (zodiac === '물병자리' && Math.random() < 0.3) {
        const bonus = Math.random() < 0.5 ? 50 : basePoints * 0.5;
        basePoints += bonus;
    }

    // 사수자리: 항상 +15%
    if (zodiac === '사수자리') {
        basePoints *= 1.15;
    }

    // 염소자리: 누적 보너스
    if (zodiac === '염소자리') {
        basePoints *= (1 + playerData.cumulativeBonus / 100);
    }

    // 사주 운세 보정 적용
    const fortunePoints = Math.round(basePoints * modifier.multiplier);

    let message = `${diceValue} 굴림 → ${fortunePoints}점 획득`;

    if (modifier.multiplier > 1) {
        message += ` (운세 보정: ${modifier.value})`;
    } else if (modifier.multiplier < 1) {
        message += ` (운세 악화: ${modifier.value})`;
    }

    return { points: fortunePoints, message: message };
}

// UI 업데이트
function updateDisplay() {
    document.getElementById('score').textContent = playerData.score;
    document.getElementById('roll-count').textContent = playerData.rollCount;
    document.getElementById('high-score').textContent = playerData.highScore;
}

// 메시지 표시
function showMessage(text, type) {
    const messageDiv = document.getElementById('result-message');
    messageDiv.textContent = text;
    messageDiv.className = `result-message ${type}`;

    // 3초 후 메시지 숨기기
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'result-message';
    }, 5000);
}
