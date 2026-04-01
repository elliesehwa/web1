# 하드코딩 vs 설정 파일 비교

## Before: 하드코딩 방식 ❌

```
app.py (단일 파일)
┌─────────────────────────────────────────────────┐
│ # 경로를 직접 코드에 작성                          │
│ db_path = "C:/Users/김연정/Documents/dev/..."    │
│                                                 │
│ db = lancedb.connect(db_path)                   │
│                                                 │
│ # 경로 바꾸려면 코드 수정해야 함!                  │
└─────────────────────────────────────────────────┘
```

**문제점**:
- 경로 바꾸려면 코드 수정
- 여러 곳에 같은 경로 중복
- 다른 사람 컴퓨터에서 안 돌아감

---

## After: 설정 파일 방식 ✅

```
┌─────────────────────┐
│ .env                │  👈 경로는 여기 저장 (절대경로 그대로!)
├─────────────────────┤
│ DB_PATH=C:/Users/.. │
└─────────────────────┘
         ↓ (읽어옴)
┌─────────────────────┐
│ config.py           │  👈 .env에서 읽어서 변수에 저장
├─────────────────────┤
│ class Config:       │
│   DB_PATH = os...   │
└─────────────────────┘
         ↓ (import)
┌─────────────────────┐
│ app.py              │  👈 config를 사용 (깔끔!)
├─────────────────────┤
│ from config import  │
│ config              │
│                     │
│ db = lancedb.con... │
│    (config.DB_PATH) │
└─────────────────────┘
```

**장점**:
- 경로 바꾸려면 `.env` 파일만 수정
- 코드 건드릴 필요 없음
- 다른 사람은 자기 경로로 `.env` 수정

---

## 실제 값의 흐름

```python
# .env 파일
DB_PATH=C:/Users/김연정/Documents/dev/lancedb-ollama

    ↓ load_dotenv()로 환경변수로 로드

# config.py
DB_PATH = os.getenv("DB_PATH")  
    → "C:/Users/김연정/Documents/dev/lancedb-ollama"

    ↓ import해서 사용

# app.py
config.DB_PATH
    → "C:/Users/김연정/Documents/dev/lancedb-ollama"
```

---

## 핵심 정리

| 항목 | Before | After |
|------|--------|-------|
| **경로 저장 위치** | 코드 안 | `.env` 파일 |
| **경로 타입** | 절대경로 | 절대경로 (변화 없음!) |
| **경로 수정 방법** | 코드 수정 | `.env` 파일 수정 |
| **여러 곳에서 사용** | 복사/붙여넣기 | `config.XX` 사용 |

👉 **결론**: 절대경로는 그대로, 관리 방법만 개선됨!
