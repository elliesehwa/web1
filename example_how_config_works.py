# 예시: 실제 동작 확인

# 1. .env 파일 내용
# DB_PATH=C:/Users/김연정/Documents/dev/lancedb-ollama

# 2. config.py에서 읽기
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    DB_PATH = os.getenv("DB_PATH")

config = Config()

# 3. 테스트 출력
print("config.DB_PATH의 실제 값:")
print(config.DB_PATH)
# 출력: C:/Users/김연정/Documents/dev/lancedb-ollama

print("\n타입:")
print(type(config.DB_PATH))
# 출력: <class 'str'>

# 4. 실제 사용
import lancedb
db = lancedb.connect(config.DB_PATH)
#                    ^^^^^^^^^^^^^^^
#                    이건 결국 문자열 "C:/Users/..."와 똑같음!
