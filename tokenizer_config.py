"""
한글 토크나이저 학습 설정 파일
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class TokenizerConfig:
    """토크나이저 학습 설정 클래스"""

    # ==================== 파일 경로 ====================
    INPUT_FILE = os.getenv("TOKENIZER_INPUT_FILE", "양_텍스트.txt")
    OUTPUT_FILE = os.getenv("TOKENIZER_OUTPUT_FILE", "my_korean_corpus.txt")
    MODEL_SAVE_DIR = os.getenv("TOKENIZER_SAVE_DIR", ".")
    MODEL_NAME = os.getenv("TOKENIZER_MODEL_NAME", "korean_bert_tokenizer")

    # ==================== 토크나이저 설정 ====================
    CLEAN_TEXT = os.getenv("TOKENIZER_CLEAN_TEXT", "True").lower() == "true"
    HANDLE_CHINESE_CHARS = os.getenv("TOKENIZER_HANDLE_CHINESE_CHARS", "True").lower() == "true"
    STRIP_ACCENTS = os.getenv("TOKENIZER_STRIP_ACCENTS", "True").lower() == "true"
    LOWERCASE = os.getenv("TOKENIZER_LOWERCASE", "True").lower() == "true"

    # ==================== 학습 파라미터 ====================
    VOCAB_SIZE = int(os.getenv("TOKENIZER_VOCAB_SIZE", "30000"))
    MIN_FREQUENCY = int(os.getenv("TOKENIZER_MIN_FREQUENCY", "2"))
    SHOW_PROGRESS = os.getenv("TOKENIZER_SHOW_PROGRESS", "True").lower() == "true"
    LIMIT_ALPHABET = int(os.getenv("TOKENIZER_LIMIT_ALPHABET", "1000"))

    # ==================== 특수 토큰 ====================
    SPECIAL_TOKENS = [
        "[PAD]",   # 패딩
        "[UNK]",   # 미지의 토큰
        "[CLS]",   # 문장 시작
        "[SEP]",   # 문장 구분
        "[MASK]"   # 마스킹 (MLM용)
    ]

    # ==================== 인코딩 설정 ====================
    ENCODING = os.getenv("TOKENIZER_ENCODING", "utf-8")
    UNICODE_NORMALIZATION = os.getenv("TOKENIZER_UNICODE_NORM", "NFC")  # NFC, NFD, NFKC, NFKD

    @classmethod
    def get_training_files(cls) -> list:
        """학습 파일 목록 반환"""
        return [cls.OUTPUT_FILE]

    @classmethod
    def validate_files(cls) -> dict:
        """파일 존재 여부 검증"""
        return {
            "input_file_exists": Path(cls.INPUT_FILE).exists(),
            "output_dir_exists": Path(cls.MODEL_SAVE_DIR).exists(),
        }

    @classmethod
    def get_tokenizer_config(cls) -> dict:
        """토크나이저 초기화 설정 반환"""
        return {
            "clean_text": cls.CLEAN_TEXT,
            "handle_chinese_chars": cls.HANDLE_CHINESE_CHARS,
            "strip_accents": cls.STRIP_ACCENTS,
            "lowercase": cls.LOWERCASE,
        }

    @classmethod
    def get_training_config(cls) -> dict:
        """학습 설정 반환"""
        return {
            "files": cls.get_training_files(),
            "vocab_size": cls.VOCAB_SIZE,
            "min_frequency": cls.MIN_FREQUENCY,
            "show_progress": cls.SHOW_PROGRESS,
            "special_tokens": cls.SPECIAL_TOKENS,
            "limit_alphabet": cls.LIMIT_ALPHABET,
        }

    @classmethod
    def print_config(cls):
        """현재 설정 출력"""
        print("=" * 60)
        print("🔧 토크나이저 학습 설정")
        print("=" * 60)
        print(f"📁 입력 파일: {cls.INPUT_FILE}")
        print(f"📁 출력 파일: {cls.OUTPUT_FILE}")
        print(f"💾 모델 저장 경로: {cls.MODEL_SAVE_DIR}")
        print(f"🏷️  모델 이름: {cls.MODEL_NAME}")
        print(f"📊 어휘 크기: {cls.VOCAB_SIZE:,}")
        print(f"🔢 최소 빈도: {cls.MIN_FREQUENCY}")
        print(f"🔤 알파벳 제한: {cls.LIMIT_ALPHABET}")
        print(f"🌐 인코딩: {cls.ENCODING}")
        print(f"📝 Unicode 정규화: {cls.UNICODE_NORMALIZATION}")
        print("=" * 60)


# 전역 설정 객체
tokenizer_config = TokenizerConfig()
