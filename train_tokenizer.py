"""
한글 토크나이저 학습 스크립트 (개선 버전)
"""
from tokenizers import BertWordPieceTokenizer
import unicodedata
import sys
from pathlib import Path

# ✅ config에서 설정 가져오기
from tokenizer_config import tokenizer_config as config


def normalize_text(input_file: str, output_file: str):
    """
    텍스트 파일을 Unicode 정규화하여 저장

    Args:
        input_file: 입력 파일 경로
        output_file: 출력 파일 경로
    """
    print(f"📖 '{input_file}' 파일을 읽는 중...")

    try:
        with open(input_file, 'r', encoding=config.ENCODING) as f_in, \
             open(output_file, 'w', encoding=config.ENCODING) as f_out:

            line_count = 0
            for line in f_in:
                # ✅ config에서 정규화 방식 가져오기
                normalized_line = unicodedata.normalize(config.UNICODE_NORMALIZATION, line)
                f_out.write(normalized_line)
                line_count += 1

            print(f"✅ {line_count:,}줄 처리 완료")
            print(f"💾 정규화된 텍스트가 '{output_file}' 파일에 저장되었습니다.")
            return True

    except FileNotFoundError:
        print(f"❌ 오류: '{input_file}' 파일을 찾을 수 없습니다.")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False


def train_tokenizer():
    """토크나이저 학습"""

    # 설정 출력
    config.print_config()

    # 파일 유효성 검증
    validation = config.validate_files()
    if not validation["input_file_exists"]:
        print(f"❌ 입력 파일이 존재하지 않습니다: {config.INPUT_FILE}")
        return False

    # 1. 텍스트 정규화
    print("\n" + "=" * 60)
    print("📝 1단계: 텍스트 정규화")
    print("=" * 60)
    if not normalize_text(config.INPUT_FILE, config.OUTPUT_FILE):
        return False

    # 2. 토크나이저 초기화
    print("\n" + "=" * 60)
    print("🔧 2단계: 토크나이저 초기화")
    print("=" * 60)

    # ✅ config에서 설정 가져오기
    tokenizer = BertWordPieceTokenizer(**config.get_tokenizer_config())
    print("✅ 토크나이저 초기화 완료")

    # 3. 토크나이저 학습
    print("\n" + "=" * 60)
    print("🎓 3단계: 토크나이저 학습")
    print("=" * 60)

    try:
        # ✅ config에서 학습 설정 가져오기
        tokenizer.train(**config.get_training_config())
        print("✅ 토크나이저 학습 완료")

    except Exception as e:
        print(f"❌ 학습 중 오류 발생: {e}")
        return False

    # 4. 모델 저장
    print("\n" + "=" * 60)
    print("💾 4단계: 모델 저장")
    print("=" * 60)

    try:
        # ✅ config에서 저장 경로 가져오기
        tokenizer.save_model(config.MODEL_SAVE_DIR, config.MODEL_NAME)

        save_path = Path(config.MODEL_SAVE_DIR) / f"{config.MODEL_NAME}-vocab.txt"
        print(f"✅ 모델이 저장되었습니다: {save_path}")

        # 저장된 파일 확인
        if save_path.exists():
            vocab_size = sum(1 for _ in open(save_path, 'r', encoding='utf-8'))
            print(f"📊 실제 어휘 크기: {vocab_size:,} 토큰")

    except Exception as e:
        print(f"❌ 저장 중 오류 발생: {e}")
        return False

    print("\n" + "=" * 60)
    print("🎉 토크나이저 학습 완료!")
    print("=" * 60)
    return True


def test_tokenizer():
    """학습된 토크나이저 테스트"""
    print("\n" + "=" * 60)
    print("🧪 토크나이저 테스트")
    print("=" * 60)

    try:
        vocab_file = Path(config.MODEL_SAVE_DIR) / f"{config.MODEL_NAME}-vocab.txt"

        if not vocab_file.exists():
            print(f"❌ vocab 파일을 찾을 수 없습니다: {vocab_file}")
            return

        from tokenizers import BertWordPieceTokenizer
        tokenizer = BertWordPieceTokenizer(str(vocab_file), lowercase=config.LOWERCASE)

        # 테스트 문장들
        test_sentences = [
            "양자리는 불의 별자리입니다.",
            "사주팔자로 운명을 알아봅시다.",
            "오늘의 운세는 어떨까요?",
        ]

        print("\n테스트 문장 토큰화:")
        for sentence in test_sentences:
            encoded = tokenizer.encode(sentence)
            print(f"\n원문: {sentence}")
            print(f"토큰: {encoded.tokens}")
            print(f"ID: {encoded.ids}")

    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {e}")


if __name__ == "__main__":
    # 토크나이저 학습
    success = train_tokenizer()

    # 성공 시 테스트
    if success:
        test_tokenizer()
    else:
        print("\n❌ 토크나이저 학습에 실패했습니다.")
        sys.exit(1)
