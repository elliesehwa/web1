// 무드 정의 — "애니메이션처럼 표정이 바뀌는" 느낌의 엔진.
// 각 무드는 하루 중 올라가는 시간대(window)를 가진다.
// window: [시작시각, 끝시각] (24시간제, 서버 로컬 타임 기준)

const MOODS = {
  cute: {
    emoji: '🌅',
    label: '귀여움',
    tone: '말랑하고 사랑스러운',
    window: [8, 10], // 아침 — 하루를 말랑하게 시작
  },
  playful: {
    emoji: '☀️',
    label: '장난기',
    tone: '에너지 넘치고 장난스러운',
    window: [12, 15], // 점심~오후 — 에너지 높을 때
  },
  mature: {
    emoji: '🌆',
    label: '어른스러움',
    tone: '차분하고 단단한',
    window: [18, 20], // 저녁 — 차분하게 마무리
  },
  quiet: {
    emoji: '🌙',
    label: '조용함',
    tone: '잔잔하고 고요한',
    window: [22, 23], // 밤 — 잔잔하게
  },
};

function getMood(name) {
  const mood = MOODS[name];
  if (!mood) {
    const names = Object.keys(MOODS).join(', ');
    throw new Error(`알 수 없는 무드: "${name}". 가능한 무드: ${names}`);
  }
  return mood;
}

module.exports = { MOODS, getMood };
