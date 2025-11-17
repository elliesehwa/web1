# Tesla RAG 챗봇 - 하드코딩 제거 가이드

## 📁 파일 구조

```
tesla-rag-chatbot/
├── .env.example          # 환경 변수 예시 파일
├── .env                  # 실제 환경 변수 (git에 커밋하지 말 것!)
├── config.py             # 설정 관리 클래스
├── app.py                # 메인 Streamlit 앱 (개선됨)
└── README.md             # 이 파일
```

## 🚀 설치 및 설정 방법

### 1단계: .env 파일 생성

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

### 2단계: .env 파일 수정

`.env` 파일을 열어서 **실제 경로와 설정값**으로 변경하세요:

```env
# OpenAI API 키
OPENAI_API_KEY=sk-your-actual-api-key-here

# 데이터베이스 경로 (본인의 경로로 변경)
DB_PATH=C:/Users/김연정/Documents/dev/lancedb-ollama

# 이미지 저장 경로 (본인의 경로로 변경)
IMAGES_PATH=C:/Users/김연정/Documents/dev/images

# 임베딩 모델 설정 (변경 가능)
DEFAULT_EMBEDDING_MODEL=bge-m3
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# LLM 모델 설정 (변경 가능)
DEFAULT_LLM_MODEL=llava:13b
DEFAULT_TEMPERATURE=0.05
ANSWER_TEMPERATURE=0.3

# 검색 설정 (변경 가능)
DEFAULT_SEARCH_K=3
MIN_SEARCH_K=1
MAX_SEARCH_K=10

# UI 설정 (변경 가능)
MAX_IMAGES_DISPLAY=3
STREAMING_DELAY=0.03

# 테이블 이름 (필요시 변경)
TABLE_NAME_1=tesla_manual_with_images
TABLE_NAME_2=tesla_manual_with_images_text
TABLE_NAME_3=tesla_manual_bge
```

### 3단계: 앱 실행

```bash
streamlit run app.py
```

## 🎯 주요 개선 사항

### Before (하드코딩)
```python
db_path = "C:/Users/김연정/Documents/dev/lancedb-ollama"
image_path = f"C:/Users/김연정/Documents/dev/images/{filename}"
llm = OllamaLLM(model="llava:13b", temperature=0.05)
search_k = st.slider("검색할 문서 수", 1, 10, 3)
```

### After (설정 파일 사용)
```python
from config import config

db = lancedb.connect(config.DB_PATH)
image_path = config.get_image_path(filename)
llm = OllamaLLM(model=config.DEFAULT_LLM_MODEL, temperature=config.DEFAULT_TEMPERATURE)
search_k = st.slider("검색할 문서 수", config.MIN_SEARCH_K, config.MAX_SEARCH_K, config.DEFAULT_SEARCH_K)
```

## 📋 주요 변경 사항

### 1. **경로 설정**
- ✅ `DB_PATH`: 데이터베이스 경로
- ✅ `IMAGES_PATH`: 이미지 저장 경로
- ✅ `config.get_image_path()`: 이미지 경로 자동 생성

### 2. **모델 설정**
- ✅ `DEFAULT_EMBEDDING_MODEL`: 기본 임베딩 모델
- ✅ `OPENAI_EMBEDDING_MODEL`: OpenAI 임베딩 모델
- ✅ `DEFAULT_LLM_MODEL`: 기본 LLM 모델
- ✅ `AVAILABLE_LLM_MODELS`: 선택 가능한 모델 목록

### 3. **숫자 파라미터**
- ✅ `DEFAULT_TEMPERATURE`: LLM temperature
- ✅ `ANSWER_TEMPERATURE`: 답변 생성 temperature
- ✅ `DEFAULT_SEARCH_K`: 기본 검색 문서 수
- ✅ `MAX_IMAGES_DISPLAY`: 최대 이미지 표시 개수
- ✅ `STREAMING_DELAY`: 스트리밍 딜레이 시간

### 4. **프롬프트 템플릿**
- ✅ `RAG_PROMPT_TEMPLATE`: RAG 답변 생성 프롬프트
- ✅ `IMAGE_ANALYSIS_PROMPT_TEMPLATE`: 이미지 분석 프롬프트

### 5. **메시지 & UI 텍스트**
- ✅ `config.MESSAGES`: 모든 시스템 메시지
- ✅ `config.APP_TITLE`: 앱 제목
- ✅ `config.EMBEDDING_OPTIONS`: 임베딩 선택 옵션

## 🔒 보안 주의사항

### ⚠️ .env 파일은 절대 git에 커밋하지 마세요!

`.gitignore` 파일에 추가:
```gitignore
.env
*.env
!.env.example
```

## 🛠️ 설정 커스터마이징

### config.py 직접 수정하기

더 복잡한 설정이 필요한 경우 `config.py`를 직접 수정할 수 있습니다:

```python
# config.py
class Config:
    # 새로운 설정 추가
    CUSTOM_SETTING = "my_value"

    @classmethod
    def get_custom_path(cls, filename: str) -> str:
        """커스텀 경로 생성 메서드"""
        return f"{cls.CUSTOM_PATH}/{filename}"
```

## 📊 경로 검증

앱 시작 시 경로 유효성 검증:

```python
from config import config

# 경로 검증
validation = config.validate_paths()
print(f"DB 경로 존재: {validation['db_path_exists']}")
print(f"이미지 경로 존재: {validation['images_path_exists']}")
```

## 💡 장점

1. **유지보수 용이**: 설정 변경 시 한 곳만 수정
2. **환경별 설정**: 개발/운영 환경 분리 가능
3. **보안 강화**: API 키를 코드에서 분리
4. **재사용성**: 다른 프로젝트에서도 설정 재사용
5. **가독성 향상**: 코드가 더 깔끔해짐

## 🎓 추가 학습 자료

- [python-dotenv 공식 문서](https://github.com/theskumar/python-dotenv)
- [12 Factor App](https://12factor.net/ko/config)
- [환경 변수 베스트 프랙티스](https://blog.doppler.com/environment-variables-best-practices)
