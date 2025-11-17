import streamlit as st
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import LanceDB
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import lancedb
import base64
from PIL import Image
import os
from pathlib import Path
import ollama
import time

# ✅ config 파일에서 설정 가져오기
from config import config

# Streamlit 페이지 설정
st.set_page_config(
    page_title=config.APP_TITLE,
    page_icon=config.APP_ICON,
    layout="wide"
)
st.title(config.APP_TITLE)

# API 키 설정
try:
    api_key = st.secrets.get("OPENAI_API_KEY")
except:
    api_key = config.OPENAI_API_KEY


# 모델 및 DB 초기화
@st.cache_resource
def initialize_models():
    # 임베딩 선택 옵션
    use_openai_embedding = st.sidebar.selectbox(
        "🔧 임베딩 모델",
        list(config.EMBEDDING_OPTIONS.keys()),
        index=0
    )

    # 선택된 임베딩 모델 이름
    selected_embedding = config.EMBEDDING_OPTIONS[use_openai_embedding]

    if "OpenAI" in use_openai_embedding:
        # OpenAI 임베딩 모델
        embedding_model = OpenAIEmbeddings(
            model=config.OPENAI_EMBEDDING_MODEL,
            api_key=api_key
        )
    else:
        # BGE-M3 임베딩 모델 (기존 호환)
        embedding_model = OllamaEmbeddings(model=config.DEFAULT_EMBEDDING_MODEL)

    # Ollama LLM 모델 (기본값)
    llm = OllamaLLM(
        model=config.DEFAULT_LLM_MODEL,
        temperature=config.DEFAULT_TEMPERATURE
    )

    # ✅ config에서 DB 경로 가져오기
    db = lancedb.connect(config.DB_PATH)

    # 사용 가능한 테이블 확인
    available_tables = db.table_names()

    # ✅ config에서 테이블 이름 우선순위로 선택
    table_name = None
    for idx, table in enumerate(config.TABLE_NAMES):
        if table in available_tables:
            table_name = table
            if idx == 0:
                st.success(config.MESSAGES["table_with_images"])
            elif idx == 1:
                st.success(config.MESSAGES["table_with_images_text"])
            else:
                st.warning(config.MESSAGES["table_basic"])
            break

    if not table_name:
        st.error(config.MESSAGES["no_table"])
        return None, llm, db

    try:
        vectorstore = LanceDB(
            connection=db,
            embedding=embedding_model,
            table_name=table_name,
        )
        return vectorstore, llm, db
    except Exception as e:
        st.error(f"벡터스토어 초기화 오류: {e}")
        return None, llm, db


def analyze_image_with_llava(image_path, question_context=""):
    """LLaVA로 이미지를 분석하여 아이콘이나 UI 요소 설명"""
    try:
        with open(image_path, 'rb') as image_file:
            img_data = image_file.read()
            base64_img = base64.b64encode(img_data).decode()

        # ✅ config에서 프롬프트 가져오기
        prompt = config.IMAGE_ANALYSIS_PROMPT_TEMPLATE.format(
            question_context=question_context
        )

        response = ollama.generate(
            model=config.DEFAULT_LLM_MODEL,
            prompt=prompt,
            images=[base64_img],
            stream=False
        )

        return response['response']
    except Exception as e:
        return f"이미지 분석 오류: {e}"


def display_image_with_analysis(image_path, question_context=""):
    """이미지 표시 + LLaVA 분석 결과"""
    try:
        if os.path.exists(image_path):
            image = Image.open(image_path)
            st.image(image, caption=f"📄 {os.path.basename(image_path)}", use_container_width=True)

            # LLaVA 분석 버튼
            if st.button(f"🔍 아이콘 분석", key=f"analyze_{os.path.basename(image_path)}"):
                with st.spinner("이미지를 분석하는 중..."):
                    analysis = analyze_image_with_llava(image_path, question_context)
                    with st.expander("📋 이미지 상세 분석", expanded=True):
                        st.write(analysis)
        else:
            st.warning(f"이미지 파일을 찾을 수 없습니다: {image_path}")
    except Exception as e:
        st.error(f"이미지 로딩 오류: {e}")


def display_image_from_path(image_path):
    """기본 이미지 표시 (호환성 유지)"""
    try:
        if os.path.exists(image_path):
            image = Image.open(image_path)
            st.image(image, caption=f"📄 {os.path.basename(image_path)}", use_container_width=True)
        else:
            st.warning(f"이미지 파일을 찾을 수 없습니다: {image_path}")
    except Exception as e:
        st.error(f"이미지 로딩 오류: {e}")


def format_docs_with_images(docs):
    """문서와 이미지를 함께 포맷팅"""
    context_parts = []
    images_to_display = []

    for i, doc in enumerate(docs):
        context_parts.append(f"문서 {i+1}:\n{doc.page_content}")

        # 메타데이터에서 이미지 정보 추출
        metadata = doc.metadata
        page = metadata.get('page')

        # image_info가 있는 경우 (tesla_manual_with_images 테이블)
        image_info = metadata.get('image_info', [])
        if image_info and isinstance(image_info, list):
            for img in image_info:
                if isinstance(img, dict):
                    filename = img.get('filename')
                    if filename:
                        # ✅ config에서 이미지 경로 가져오기
                        image_path = config.get_image_path(filename)
                        images_to_display.append({
                            'path': image_path,
                            'filename': filename,
                            'page': page,
                            'doc_index': i+1
                        })

        # 직접 이미지 경로가 있는 경우 (tesla_manual_with_images_text 테이블)
        elif metadata.get('image_path'):
            images_to_display.append({
                'path': metadata.get('image_path'),
                'filename': metadata.get('filename'),
                'page': page,
                'doc_index': i+1
            })

    return "\n\n".join(context_parts), images_to_display


# 모델 초기화
vectorstore, llm, db = initialize_models()

if vectorstore and llm:
    # ✅ config에서 프롬프트 템플릿 가져오기
    prompt = ChatPromptTemplate.from_template(config.RAG_PROMPT_TEMPLATE)

    # 사이드바에 테이블 정보 표시
    with st.sidebar:
        st.header("📊 데이터베이스 정보")
        try:
            table_names = db.table_names()
            st.write("사용 가능한 테이블:")
            for table in table_names:
                st.write(f"- {table}")

            # 현재 테이블 정보
            if config.TABLE_NAMES[1] in table_names:  # tesla_manual_with_images_text
                table = db.open_table(config.TABLE_NAMES[1])
                df = table.to_pandas()
                st.write(f"총 문서 수: {len(df)}")

                # 페이지 범위 표시
                pages = df['metadata'].apply(lambda x: x.get('page', 0) if isinstance(x, dict) else 0)
                st.write(f"페이지 범위: {pages.min()} - {pages.max()}")
        except Exception as e:
            st.error(f"테이블 정보 로딩 오류: {e}")

    # 사이드바 설정
    with st.sidebar:
        st.header("⚙️ 모델 설정")

        # ✅ config에서 모델 목록 가져오기
        llm_model = st.selectbox(
            "🤖 답변 생성 모델",
            config.AVAILABLE_LLM_MODELS,
            index=0
        )

        st.header("🔍 검색 설정")
        # ✅ config에서 검색 설정 가져오기
        search_k = st.slider(
            "검색할 문서 수",
            config.MIN_SEARCH_K,
            config.MAX_SEARCH_K,
            config.DEFAULT_SEARCH_K
        )

        st.header("📊 현재 모델")
        if vectorstore:
            st.success(f"✅ 임베딩: {config.DEFAULT_EMBEDDING_MODEL}")
            st.success(f"✅ 답변: {llm_model}")
        else:
            st.error("❌ 모델 초기화 실패")

    # 채팅 기록 초기화
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "current_images" not in st.session_state:
        st.session_state.current_images = []

    # 메인 채팅 인터페이스
    st.header("💬 Tesla 매뉴얼 채팅")

    # 이전 채팅 기록 표시
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # 사용자 입력 받기 (맨 아래에 고정)
    if user_question := st.chat_input("Tesla 매뉴얼에 대해 질문해보세요..."):
        # 사용자 메시지 기록 및 표시
        st.session_state.messages.append({"role": "user", "content": user_question})
        with st.chat_message("user"):
            st.markdown(user_question)

        # AI 답변 생성 및 표시
        with st.chat_message("assistant"):
            with st.spinner("검색 및 답변 생성 중..."):
                # 유사 문서 검색
                docs = vectorstore.similarity_search(user_question, k=search_k)

                if docs:
                    # 컨텍스트와 이미지 정보 추출
                    context, images_to_display = format_docs_with_images(docs)

                    # 현재 이미지 정보 업데이트
                    st.session_state.current_images = images_to_display

                    # 선택된 모델로 새로운 LLM 생성
                    # ✅ config에서 temperature 가져오기
                    selected_llm = OllamaLLM(
                        model=llm_model,
                        temperature=config.ANSWER_TEMPERATURE
                    )

                    # RAG 체인 실행
                    rag_chain = (
                        {"context": RunnablePassthrough(), "question": RunnablePassthrough()}
                        | prompt
                        | selected_llm
                        | StrOutputParser()
                    )

                    # 답변 생성
                    answer = rag_chain.invoke({"context": context, "question": user_question})

                    # 빠른 답변을 위해 자동 분석 비활성화 (필요시 수동 분석)
                    enhanced_answer = answer
                    if images_to_display:
                        enhanced_answer += f"\n\n**📸 관련 매뉴얼 이미지:** {len(images_to_display)}개 이미지가 아래에 표시됩니다."

                    # 스트리밍으로 답변 표시
                    response_sentences = [
                        sentence.strip(". ") + "."
                        for sentence in enhanced_answer.split(".")
                        if sentence.strip(". ") != ""
                    ]

                    message_placeholder = st.empty()
                    full_response = ""

                    for sentence in response_sentences:
                        full_response += sentence + " "
                        message_placeholder.markdown(full_response + "▌")
                        # ✅ config에서 딜레이 시간 가져오기
                        time.sleep(config.STREAMING_DELAY)

                    # 마지막 커서 제거
                    message_placeholder.markdown(full_response)

                    # 이미지들 표시
                    if images_to_display:
                        st.markdown("---")
                        # ✅ config에서 최대 표시 개수 가져오기
                        for idx, img_info in enumerate(images_to_display[:config.MAX_IMAGES_DISPLAY]):
                            col1, col2 = st.columns([3, 1])

                            with col1:
                                if os.path.exists(img_info['path']):
                                    image = Image.open(img_info['path'])
                                    st.image(image, caption=f"📄 페이지 {img_info['page']} - {img_info['filename']}", use_container_width=True)

                            with col2:
                                if st.button(f"🔍 아이콘 분석", key=f"analyze_btn_{idx}"):
                                    with st.spinner("이미지 아이콘 분석 중..."):
                                        analysis = analyze_image_with_llava(img_info['path'], user_question)
                                        st.success("분석 완료!")
                                        with st.expander("📋 아이콘 & UI 분석", expanded=True):
                                            st.write(analysis)

                            st.divider()

                    st.session_state.messages.append({"role": "assistant", "content": full_response})

                else:
                    # ✅ config에서 에러 메시지 가져오기
                    error_msg = config.MESSAGES["no_results"]
                    st.warning(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})
                    st.session_state.current_images = []

else:
    # ✅ config에서 에러 메시지 가져오기
    st.error(config.MESSAGES["init_error"])

# 사용법 설명
with st.expander("📖 사용법"):
    st.markdown("""
    ### Tesla 매뉴얼 RAG 시스템 사용법

    1. **질문 입력**: 왼쪽 텍스트 영역에 Tesla 매뉴얼 관련 질문을 입력하세요.
    2. **검색 문서 수 설정**: 슬라이더로 검색할 문서 수를 조정하세요.
    3. **검색 실행**: "검색 및 답변" 버튼을 클릭하세요.
    4. **결과 확인**:
       - 왼쪽에 AI가 생성한 답변이 표시됩니다
       - 오른쪽에 관련 이미지들이 표시됩니다
       - 하단에 검색된 원본 문서들을 확인할 수 있습니다

    ### 예시 질문
    - "도어 잠금 방법을 알려주세요"
    - "충전 포트는 어디에 있나요?"
    - "에어컨 사용법을 설명해주세요"
    - "비상시 문을 여는 방법"
    """)
