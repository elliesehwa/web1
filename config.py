"""
Tesla RAG 챗봇 설정 파일
환경 변수와 기본 설정을 관리합니다.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class Config:
    """애플리케이션 설정 클래스"""

    # ==================== API 키 ====================
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    # ==================== 경로 설정 ====================
    DB_PATH = os.getenv("DB_PATH", "C:/Users/김연정/Documents/dev/lancedb-ollama")
    IMAGES_PATH = os.getenv("IMAGES_PATH", "C:/Users/김연정/Documents/dev/images")

    # ==================== 모델 설정 ====================
    # 임베딩 모델
    DEFAULT_EMBEDDING_MODEL = os.getenv("DEFAULT_EMBEDDING_MODEL", "bge-m3")
    OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

    # LLM 모델
    DEFAULT_LLM_MODEL = os.getenv("DEFAULT_LLM_MODEL", "llava:13b")
    DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.05"))
    ANSWER_TEMPERATURE = float(os.getenv("ANSWER_TEMPERATURE", "0.3"))

    # 사용 가능한 LLM 모델 목록
    AVAILABLE_LLM_MODELS = [
        "llava:13b",
        "gemma2:2b",
        "qwen2.5:0.5b",
        "llama3.2:1b"
    ]

    # ==================== 검색 설정 ====================
    DEFAULT_SEARCH_K = int(os.getenv("DEFAULT_SEARCH_K", "3"))
    MIN_SEARCH_K = int(os.getenv("MIN_SEARCH_K", "1"))
    MAX_SEARCH_K = int(os.getenv("MAX_SEARCH_K", "10"))

    # ==================== UI 설정 ====================
    MAX_IMAGES_DISPLAY = int(os.getenv("MAX_IMAGES_DISPLAY", "3"))
    STREAMING_DELAY = float(os.getenv("STREAMING_DELAY", "0.03"))

    # ==================== 테이블 이름 ====================
    # 우선순위 순서로 정의
    TABLE_NAMES = [
        os.getenv("TABLE_NAME_1", "tesla_manual_with_images"),
        os.getenv("TABLE_NAME_2", "tesla_manual_with_images_text"),
        os.getenv("TABLE_NAME_3", "tesla_manual_bge")
    ]

    # ==================== UI 텍스트 ====================
    APP_TITLE = "🚗 Tesla 매뉴얼 RAG 시스템 (텍스트 + 이미지)"
    APP_ICON = "🚗"

    # 임베딩 모델 선택 옵션
    EMBEDDING_OPTIONS = {
        "BGE-M3 (기존)": DEFAULT_EMBEDDING_MODEL,
        "OpenAI (새로운)": OPENAI_EMBEDDING_MODEL
    }

    # ==================== 프롬프트 템플릿 ====================
    RAG_PROMPT_TEMPLATE = """
Tesla 매뉴얼에 대한 질문에 답변해주세요. 다음 컨텍스트를 참고하여 정확하고 상세한 답변을 제공하세요.

컨텍스트: {context}

질문: {question}

답변 시 다음 사항을 포함해주세요:
1. 정확한 답변 내용
2. 해당 매뉴얼 페이지 번호 (있는 경우)
3. 관련된 이미지나 도표에 대한 설명

한국어로 답변해주세요.
"""

    IMAGE_ANALYSIS_PROMPT_TEMPLATE = """이 Tesla 매뉴얼 이미지를 자세히 분석해주세요.

다음에 특히 집중해서 설명해주세요:
1. 모든 아이콘과 버튼의 의미 (⚙️, 🔒, ➡️ 등)
2. UI 요소들의 기능 설명
3. 경고 표시나 주의사항
4. 단계별 절차나 조작 방법
5. 화면에 보이는 모든 텍스트 내용

질문 맥락: {question_context}

한국어로 자세하게 설명해주세요."""

    # ==================== 메시지 ====================
    MESSAGES = {
        "table_with_images": "✅ 이미지 정보가 포함된 테이블을 사용합니다.",
        "table_with_images_text": "✅ 이미지 텍스트 테이블을 사용합니다.",
        "table_basic": "⚠️ 기본 텍스트 테이블을 사용합니다. 이미지는 제한적으로 표시될 수 있습니다.",
        "no_table": "❌ 사용 가능한 테이블이 없습니다. 데이터를 먼저 생성하세요.",
        "init_error": "시스템 초기화에 실패했습니다. 데이터베이스와 모델 설정을 확인해주세요.",
        "no_results": "죄송합니다. 관련 정보를 찾을 수 없습니다.",
    }

    @classmethod
    def get_image_path(cls, filename: str) -> str:
        """이미지 파일의 전체 경로 반환"""
        return f"{cls.IMAGES_PATH}/{filename}"

    @classmethod
    def validate_paths(cls) -> dict:
        """경로 유효성 검증"""
        return {
            "db_path_exists": Path(cls.DB_PATH).exists(),
            "images_path_exists": Path(cls.IMAGES_PATH).exists(),
        }


# 전역 설정 객체
config = Config()
