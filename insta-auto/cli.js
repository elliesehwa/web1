#!/usr/bin/env node
// 무드 기반 인스타 예약 게시 CLI.
//   node cli.js moods                                무드/시간대 보기
//   node cli.js add <imageUrl> <mood> [caption...]   이미지 예약
//   node cli.js list                                 예약 큐 보기
//   node cli.js remove <id>                          예약 취소
//   node cli.js publish-due                          지금 올릴 때가 된 글 게시 (cron 용)

const fs = require('fs');
const path = require('path');
const { MOODS, getMood } = require('./moods');
const { nextSlot } = require('./scheduler');
const store = require('./queue');
const insta = require('./instagram');

loadDotEnv();

const [, , command, ...args] = process.argv;

const commands = {
  moods: cmdMoods,
  add: cmdAdd,
  list: cmdList,
  remove: cmdRemove,
  'publish-due': cmdPublishDue,
};

(async () => {
  const fn = commands[command];
  if (!fn) {
    printHelp();
    process.exit(command ? 1 : 0);
  }
  await fn(args);
})().catch((err) => {
  console.error('✖', err.message);
  process.exit(1);
});

// ── 명령어 ──────────────────────────────────────────────

function cmdMoods() {
  console.log('사용 가능한 무드:');
  for (const [name, m] of Object.entries(MOODS)) {
    const [s, e] = m.window;
    console.log(`  ${m.emoji} ${name.padEnd(8)} ${m.label.padEnd(6)} ${s}~${e}시  (${m.tone})`);
  }
}

function cmdAdd(args) {
  const [imageUrl, moodName, ...captionParts] = args;
  if (!imageUrl || !moodName) {
    throw new Error('사용법: node cli.js add <imageUrl> <mood> [caption...]');
  }
  const mood = getMood(moodName);
  const caption = captionParts.join(' ').trim();

  const queue = store.load();
  const scheduledFor = nextSlot(moodName, queue);

  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    imageUrl,
    caption,
    mood: moodName,
    scheduledFor,
    status: 'scheduled',
  };
  queue.push(item);
  store.save(queue);

  console.log(`${mood.emoji} 예약됨 — ${mood.label}`);
  console.log(`   언제: ${fmt(scheduledFor)}`);
  console.log(`   id  : ${item.id}`);
}

function cmdList() {
  const queue = store.load();
  if (queue.length === 0) {
    console.log('큐가 비어있어요. `node cli.js add ...` 로 추가해보세요.');
    return;
  }
  const order = { scheduled: 0, failed: 1, published: 2 };
  queue
    .slice()
    .sort((a, b) => (order[a.status] - order[b.status]) || a.scheduledFor.localeCompare(b.scheduledFor))
    .forEach((p) => {
      const m = MOODS[p.mood] || { emoji: '❓', label: p.mood };
      const mark = { scheduled: '⏳', published: '✅', failed: '⚠️' }[p.status] || '?';
      console.log(`${mark} ${m.emoji} ${fmt(p.scheduledFor)}  ${m.label.padEnd(6)} ${p.id}`);
      console.log(`     ${p.imageUrl}`);
      if (p.caption) console.log(`     “${p.caption}”`);
      if (p.error) console.log(`     오류: ${p.error}`);
    });
}

function cmdRemove(args) {
  const [id] = args;
  if (!id) throw new Error('사용법: node cli.js remove <id>');
  const queue = store.load();
  const next = queue.filter((p) => p.id !== id);
  if (next.length === queue.length) throw new Error(`id를 찾지 못했어요: ${id}`);
  store.save(next);
  console.log(`삭제됨: ${id}`);
}

async function cmdPublishDue() {
  const queue = store.load();
  const now = new Date();
  const due = queue.filter((p) => p.status === 'scheduled' && new Date(p.scheduledFor) <= now);

  if (due.length === 0) {
    console.log('지금 올릴 글이 없어요.');
    return;
  }

  for (const post of due) {
    try {
      const mediaId = await insta.publish(post.imageUrl, post.caption);
      post.status = 'published';
      post.mediaId = mediaId;
      post.postedAt = new Date().toISOString();
      console.log(`✅ 게시됨: ${post.id} → media ${mediaId}`);
    } catch (err) {
      post.status = 'failed';
      post.error = err.message;
      console.error(`⚠️ 실패: ${post.id} — ${err.message}`);
    }
    store.save(queue); // 한 건씩 저장해서 중간에 끊겨도 안전
  }
}

function printHelp() {
  console.log(`무드 기반 인스타 예약 게시

  node cli.js moods                                무드/시간대 보기
  node cli.js add <imageUrl> <mood> [caption...]   이미지 예약
  node cli.js list                                 예약 큐 보기
  node cli.js remove <id>                          예약 취소
  node cli.js publish-due                          올릴 때가 된 글 게시 (cron)

  무드: ${Object.keys(MOODS).join(', ')}`);
}

// ── 유틸 ────────────────────────────────────────────────

function fmt(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });
}

// 의존성 없는 .env 로더 (insta-auto/.env)
function loadDotEnv() {
  const p = path.join(__dirname, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
