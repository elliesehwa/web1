# 한글 토크나이저 학습 가이드

## 📁 파일 구조

```
tokenizer/
├── .env.example               # 환경 변수 예시 파일
├── .env                       # 실제 환경 변수
├── tokenizer_config.py        # 토크나이저 설정 관리
├── train_tokenizer.py         # 개선된 학습 스크립트
├── 양_텍스트.txt              # 입력 텍스트 (원본)
├── my_korean_corpus.txt       # 정규화된 말뭉치
└── korean_bert_tokenizer-vocab.txt  # 학습된 vocab
```

## 🚀 사용 방법

### 1단계: 환경 변수 설정

```bash
# .env 파일 생성 (또는 .env.example 복사)
cp .env.example .env
```

`.env` 파일에서 필요한 설정 수정:

```env
# 파일 경로
TOKENIZER_INPUT_FILE=양_텍스트.txt
TOKENIZER_OUTPUT_FILE=my_korean_corpus.txt
TOKENIZER_SAVE_DIR=.
TOKENIZER_MODEL_NAME=korean_bert_tokenizer

# 학습 파라미터
TOKENIZER_VOCAB_SIZE=30000
TOKENIZER_MIN_FREQUENCY=2
```

### 2단계: 토크나이저 학습

```bash
python train_tokenizer.py
```

### 출력 예시

```
============================================================
🔧 토크나이저 학습 설정
============================================================
📁 입력 파일: 양_텍스트.txt
📁 출력 파일: my_korean_corpus.txt
💾 모델 저장 경로: .
🏷️  모델 이름: korean_bert_tokenizer
📊 어휘 크기: 30,000
🔢 최소 빈도: 2
🔤 알파벳 제한: 1,000
🌐 인코딩: utf-8
📝 Unicode 정규화: NFC
============================================================

============================================================
📝 1단계: 텍스트 정규화
============================================================
📖 '양_텍스트.txt' 파일을 읽는 중...
✅ 10,000줄 처리 완료
💾 정규화된 텍스트가 'my_korean_corpus.txt' 파일에 저장되었습니다.

============================================================
🔧 2단계: 토크나이저 초기화
============================================================
✅ 토크나이저 초기화 완료

============================================================
🎓 3단계: 토크나이저 학습
============================================================
[진행률 표시]
✅ 토크나이저 학습 완료

============================================================
💾 4단계: 모델 저장
============================================================
✅ 모델이 저장되었습니다: ./korean_bert_tokenizer-vocab.txt
📊 실제 어휘 크기: 30,000 토큰

============================================================
🎉 토크나이저 학습 완료!
============================================================

============================================================
🧪 토크나이저 테스트
============================================================
원문: 양자리는 불의 별자리입니다.
토큰: ['양', '##자리', '##는', '불', '##의', '별', '##자리', '##입니다', '.']
ID: [1234, 5678, ...]
```

## 🎯 주요 개선 사항

### Before (하드코딩 ❌)

```python
input_file = "양_텍스트.txt"
output_file = "my_korean_corpus.txt"

tokenizer = BertWordPieceTokenizer(
    clean_text=True,
    handle_chinese_chars=True,
    strip_accents=True,
    lowercase=True,
)

tokenizer.train(
    files=["my_korean_corpus.txt"],
    vocab_size=30000,
    min_frequency=2,
    show_progress=True,
    special_tokens=["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"],
    limit_alphabet=1000,
)

tokenizer.save_model(".", "korean_bert_tokenizer")
```

### After (설정 파일 사용 ✅)

```python
from tokenizer_config import tokenizer_config as config

# 파일 경로는 config에서
normalize_text(config.INPUT_FILE, config.OUTPUT_FILE)

# 토크나이저 설정도 config에서
tokenizer = BertWordPieceTokenizer(**config.get_tokenizer_config())

# 학습 설정도 config에서
tokenizer.train(**config.get_training_config())

# 저장 경로도 config에서
tokenizer.save_model(config.MODEL_SAVE_DIR, config.MODEL_NAME)
```

## ⚙️ 설정 옵션 설명

### 토크나이저 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `TOKENIZER_CLEAN_TEXT` | 텍스트 정리 (공백 제거 등) | `True` |
| `TOKENIZER_HANDLE_CHINESE_CHARS` | 중국어/한자 처리 | `True` |
| `TOKENIZER_STRIP_ACCENTS` | 악센트 제거 | `True` |
| `TOKENIZER_LOWERCASE` | 소문자 변환 | `True` |

### 학습 파라미터

| 파라미터 | 설명 | 기본값 | 권장 범위 |
|---------|------|--------|----------|
| `TOKENIZER_VOCAB_SIZE` | 어휘 크기 | `30000` | 10K~50K |
| `TOKENIZER_MIN_FREQUENCY` | 최소 출현 빈도 | `2` | 1~10 |
| `TOKENIZER_LIMIT_ALPHABET` | 최대 고유 문자 수 | `1000` | 500~2000 |

### Unicode 정규화

| 옵션 | 설명 |
|------|------|
| `NFC` | Canonical Decomposition + Canonical Composition (권장) |
| `NFD` | Canonical Decomposition |
| `NFKC` | Compatibility Decomposition + Canonical Composition |
| `NFKD` | Compatibility Decomposition |

**한글에는 NFC 권장**: 한글은 NFC로 정규화하는 것이 표준입니다.

## 📊 말뭉치 크기별 권장 설정

| 말뭉치 크기 | VOCAB_SIZE | MIN_FREQUENCY | 설명 |
|------------|------------|---------------|------|
| 소형 (1만줄) | 10,000 | 1 | 작은 도메인 |
| 중형 (10만줄) | 30,000 | 2 | 일반적인 도메인 |
| 대형 (100만줄) | 50,000 | 5 | 대규모 말뭉치 |

## 🧪 학습된 토크나이저 사용하기

```python
from tokenizers import BertWordPieceTokenizer

# 학습된 모델 로드
tokenizer = BertWordPieceTokenizer(
    "korean_bert_tokenizer-vocab.txt",
    lowercase=True
)

# 텍스트 토큰화
text = "양자리는 불의 별자리입니다."
encoded = tokenizer.encode(text)

print(f"원문: {text}")
print(f"토큰: {encoded.tokens}")
print(f"토큰 ID: {encoded.ids}")
```

## 🔍 문제 해결

### 1. 파일을 찾을 수 없음

```
❌ 입력 파일이 존재하지 않습니다: 양_텍스트.txt
```

**해결책**: `.env` 파일에서 `TOKENIZER_INPUT_FILE` 경로 확인

### 2. 메모리 부족

```
MemoryError: ...
```

**해결책**:
- `TOKENIZER_VOCAB_SIZE` 줄이기 (30000 → 20000)
- `TOKENIZER_MIN_FREQUENCY` 높이기 (2 → 5)

### 3. 학습 시간이 너무 오래 걸림

**해결책**:
- `TOKENIZER_MIN_FREQUENCY` 높이기 (희귀 단어 제외)
- 말뭉치 크기 줄이기

## 💡 팁

1. **한글 전용 말뭉치**: `TOKENIZER_HANDLE_CHINESE_CHARS=False` 설정 고려
2. **대소문자 구분 없음**: 한글은 `TOKENIZER_LOWERCASE=False`로 설정해도 됨
3. **특수 토큰**: 사용 사례에 맞게 `SPECIAL_TOKENS` 수정 가능
4. **진행 상황 확인**: `TOKENIZER_SHOW_PROGRESS=True`로 설정

## 🎓 다음 단계

학습된 토크나이저를 사용하여:
- BERT 모델 학습
- 텍스트 분류
- 감성 분석
- 사주/양자리 운세 텍스트 임베딩

---

질문이나 문제가 있으면 이슈를 등록해주세요! 🚀
