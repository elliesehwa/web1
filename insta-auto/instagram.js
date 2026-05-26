// Instagram Graph API 래퍼.
// 게시는 2단계: (1) 미디어 컨테이너 생성 → (2) 컨테이너 publish.
// 주의: image_url 은 인스타그램 서버가 접근 가능한 "공개 URL"이어야 한다 (바이트 직접 업로드 X).

const GRAPH_VERSION = process.env.GRAPH_VERSION || 'v21.0';
const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv() {
  const igUserId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!igUserId || !token) {
    throw new Error(
      'IG_USER_ID, IG_ACCESS_TOKEN 환경변수가 필요해요. insta-auto/.env.example 를 참고해 .env 를 만들어주세요.'
    );
  }
  return { igUserId, token };
}

async function postForm(url, fields) {
  const res = await fetch(url, {
    method: 'POST',
    body: new URLSearchParams(fields),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`[${res.status}] ${msg}`);
  }
  return data;
}

async function createContainer(imageUrl, caption) {
  const { igUserId, token } = requireEnv();
  const fields = { image_url: imageUrl, access_token: token };
  if (caption) fields.caption = caption;
  const data = await postForm(`${BASE}/${igUserId}/media`, fields);
  return data.id; // creation_id
}

async function publishContainer(creationId) {
  const { igUserId, token } = requireEnv();
  const data = await postForm(`${BASE}/${igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  return data.id; // 게시된 미디어 ID
}

async function publish(imageUrl, caption) {
  const creationId = await createContainer(imageUrl, caption);
  const mediaId = await publishContainer(creationId);
  return mediaId;
}

module.exports = { createContainer, publishContainer, publish };
