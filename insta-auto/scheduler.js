// 무드 → 예약 시각 계산기.
// 무드의 시간대(window) 시작 시각에 예약하되, 같은 무드가 이미 잡힌 날은 건너뛴다.
// (하루에 같은 무드 한 번 → 도배 방지, "그날의 분위기" 한 컷 느낌)

const { getMood } = require('./moods');

function localDayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextSlot(moodName, queue, now = new Date()) {
  const mood = getMood(moodName);
  const [startHour] = mood.window;

  const takenDays = new Set(
    queue
      .filter((p) => p.mood === moodName && p.status === 'scheduled')
      .map((p) => localDayKey(new Date(p.scheduledFor)))
  );

  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(startHour, 0, 0, 0);
    if (d <= now) continue; // 오늘 그 시간대가 이미 지났으면 다음 날
    if (takenDays.has(localDayKey(d))) continue; // 그 무드가 이미 잡힌 날이면 다음 날
    return d.toISOString();
  }
  throw new Error('앞으로 60일 안에 빈 슬롯을 찾지 못했어요.');
}

module.exports = { nextSlot, localDayKey };
