# 🐾 무드 기반 인스타 예약 게시

이미지를 큐에 넣고 **무드(분위기)** 하나만 골라주면, 그 무드의 **시간대**에 맞춰
자동으로 예약·게시되는 작은 시스템이에요. 매번 "언제 올리지"를 고민하지 않게
하는 게 목적입니다.

> "장난기 있을 땐 있다가, 조용하면 조용하다가, 귀엽다가 어른스러웠다가" —
> 그 표정 변화를 **올리는 시간대**로 표현해요.

## 무드 → 시간대

| 무드 | 시간대 | 느낌 |
| --- | --- | --- |
| 🌅 `cute` (귀여움) | 아침 8시 | 하루를 말랑하게 시작 |
| ☀️ `playful` (장난기) | 점심·오후 12시 | 에너지 높을 때 |
| 🌆 `mature` (어른스러움) | 저녁 6시 | 차분하게 마무리 |
| 🌙 `quiet` (조용함) | 밤 10시 | 잔잔하게 |

시간대는 `moods.js` 에서 자유롭게 바꿀 수 있어요.

## 의존성

없어요. Node 18+ (내장 `fetch`)면 바로 동작합니다. `npm install` 필요 없음.

## 설정 (1회)

실제 게시는 **Instagram Graph API**를 씁니다. 인스타 자동 게시는 개인 계정이
아니라 **비즈니스/크리에이터 계정**에서만 가능해요.

1. 인스타 계정을 **비즈니스/크리에이터**로 전환하고 페이스북 페이지에 연결
2. [Meta for Developers](https://developers.facebook.com/) 에서 앱 생성
3. 권한 동의: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
4. **IG User ID**와 **장기 액세스 토큰** 발급
5. `.env.example` 를 복사해 `.env` 로 만들고 값 채우기

```bash
cp .env.example .env
# .env 편집: IG_USER_ID, IG_ACCESS_TOKEN
```

> ⚠️ 이미지는 인스타그램 서버가 가져갈 수 있는 **공개 URL**이어야 해요
> (바이트 직접 업로드는 안 됨). S3, Cloudinary, GitHub raw 등 공개 링크 사용.

## 사용법

```bash
# 무드/시간대 확인
node cli.js moods

# 이미지 예약 (가장 가까운 빈 슬롯에 자동 배정)
node cli.js add "https://example.com/dog.jpg" cute "오늘의 한 컷 🐶"

# 예약 큐 보기
node cli.js list

# 예약 취소
node cli.js remove <id>

# 올릴 때가 된 글 게시 (아래 cron 이 호출)
node cli.js publish-due
```

`add` 하면 그 무드의 다음 빈 시간대로 자동 예약돼요. 같은 무드가 이미 잡힌
날은 건너뛰어서 하루에 같은 분위기로 도배되지 않습니다.

## 자동 실행 (cron)

`publish-due` 를 주기적으로 돌리면 예약 시각이 된 글이 올라가요.
예: 매시 정각마다 확인 (crontab):

```cron
0 * * * * cd /경로/insta-auto && /usr/bin/node cli.js publish-due >> publish.log 2>&1
```

## 파일 구조

```
insta-auto/
├── cli.js          # 명령어 진입점
├── moods.js        # 무드 정의 + 시간대 매핑
├── scheduler.js    # 무드 → 다음 빈 예약 슬롯 계산
├── queue.js        # queue.json 읽기/쓰기
├── instagram.js    # Graph API (컨테이너 생성 → publish)
├── .env.example    # 토큰 설정 템플릿
└── queue.json      # 예약 데이터 (자동 생성, gitignore)
```
