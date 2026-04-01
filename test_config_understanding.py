#!/usr/bin/env python3
"""
config.DB_PATH가 실제로 뭔지 확인하는 테스트
"""

print("=" * 60)
print("🔍 config.DB_PATH 정체 확인")
print("=" * 60)

# 1. Before 방식 (하드코딩)
print("\n[Before 방식]")
db_path = "C:/Users/김연정/Documents/dev/lancedb-ollama"
print(f"db_path = {db_path}")
print(f"타입: {type(db_path)}")
print(f"길이: {len(db_path)} 글자")

# 2. After 방식 (config 사용)
print("\n[After 방식]")
print("import 시뮬레이션:")

# config.py의 내용을 시뮬레이션
import os
os.environ["DB_PATH"] = "C:/Users/김연정/Documents/dev/lancedb-ollama"

class Config:
    DB_PATH = os.getenv("DB_PATH")

config = Config()

print(f"config.DB_PATH = {config.DB_PATH}")
print(f"타입: {type(config.DB_PATH)}")
print(f"길이: {len(config.DB_PATH)} 글자")

# 3. 비교
print("\n[비교 결과]")
print(f"db_path == config.DB_PATH? {db_path == config.DB_PATH}")
print(f"두 값이 완전히 동일! ✅")

# 4. 실제 사용
print("\n[실제 사용 예시]")
print("Before: db = lancedb.connect(db_path)")
print(f"  → db = lancedb.connect('{db_path}')")
print("\nAfter: db = lancedb.connect(config.DB_PATH)")
print(f"  → db = lancedb.connect('{config.DB_PATH}')")
print("\n👉 완전히 똑같이 동작함!")

# 5. 장점 설명
print("\n" + "=" * 60)
print("💡 장점")
print("=" * 60)
print("Before: 경로 바꾸려면 → 코드 파일 열어서 수정")
print("After:  경로 바꾸려면 → .env 파일만 수정")
print("\n코드는 안 건드려도 됨! 🎉")
print("=" * 60)
