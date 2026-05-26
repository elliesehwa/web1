// 예약 큐 저장소 — queue.json 파일에 JSON 배열로 보관.
// 항목 한 개: { id, imageUrl, caption, mood, scheduledFor(ISO),
//              status: 'scheduled'|'published'|'failed', mediaId?, error?, postedAt? }

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, 'queue.json');

function load() {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  const raw = fs.readFileSync(QUEUE_PATH, 'utf8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function save(queue) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
}

module.exports = { load, save, QUEUE_PATH };
