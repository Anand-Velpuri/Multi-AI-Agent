import json
import requests
import streamlit as st

from app.config.settings import settings
from app.common.logger import get_logger
from app.common.custom_exception import CustomException

logger = get_logger(__name__)

st.set_page_config(
    page_title="Multi-AI Agent",
    layout="centered"
)

st.title("Multi-AI Agent")

# Session State
if "checkpoint_id" not in st.session_state:
    st.session_state.checkpoint_id = None

system_prompt = st.text_area(
    "Define Your AI Agent",
    value="You are a helpful assistant.",
    height=70
)

selected_model = st.selectbox(
    "Select AI Model",
    settings.ALLOWED_MODEL_NAMES
)

allow_web_search = st.checkbox(
    "Allow Web Search"
)

user_query = st.text_area(
    "Enter Your Query",
    height=100
)

API_URL = "http://localhost:9090/chat/stream"

if st.button("Ask Agent") and user_query.strip():

    payload = {
        "model_name": selected_model,
        "system_prompt": system_prompt,
        "messages": [user_query],
        "allow_search": allow_web_search,
        "checkpointer_id": st.session_state.checkpoint_id
    }

    try:

        logger.info(
            f"Sending streaming request using model: {selected_model}"
        )

        response = requests.post(
            API_URL,
            json=payload,
            stream=True,
            timeout=300
        )

        if response.status_code != 200:
            st.error(response.text)
            st.stop()

        st.subheader("Agent Response")

        response_placeholder = st.empty()
        search_status_placeholder = st.empty()
        sources_placeholder = st.empty()

        full_response = ""
        all_urls = set()

        for raw_line in response.iter_lines():

            if not raw_line:
                continue

            line = raw_line.decode("utf-8")

            if not line.startswith("data: "):
                continue

            try:
                event = json.loads(line[6:])
            except Exception:
                continue

            event_type = event.get("type")

            # --------------------------------
            # CHECKPOINT
            # --------------------------------
            if event_type == "checkpoint":

                checkpoint_id = event.get("checkpoint_id")

                if checkpoint_id:
                    st.session_state.checkpoint_id = checkpoint_id

            # --------------------------------
            # CONTENT STREAM
            # --------------------------------
            elif event_type == "content":

                chunk = event.get("content", "")

                if not chunk:
                    continue

                chunk = chunk.replace("\\n", "\n")

                full_response += chunk

                response_placeholder.markdown(full_response)

            # --------------------------------
            # SEARCH START
            # --------------------------------
            elif event_type == "search_start":

                query = event.get("query", "")

                search_status_placeholder.info(
                    f"🔍 Searching: {query}"
                )

            # --------------------------------
            # SEARCH RESULTS
            # --------------------------------
            elif event_type == "search_results":

                urls = event.get("urls", [])

                if urls:

                    all_urls.update(urls)

                    with sources_placeholder.container():

                        with st.expander(
                            f"Sources ({len(all_urls)})",
                            expanded=False
                        ):
                            for url in sorted(all_urls):
                                st.markdown(f"- {url}")

                search_status_placeholder.success(
                    "✅ Search completed"
                )

            # --------------------------------
            # END
            # --------------------------------
            elif event_type == "end":

                search_status_placeholder.empty()

                logger.info(
                    "Streaming completed successfully"
                )

                break

        logger.info(
            "Successfully received streaming response"
        )

    except requests.exceptions.RequestException as e:

        logger.error(
            f"API request failed: {e}"
        )

        st.error(
            str(
                CustomException(
                    "API request failed",
                    error_detail=e
                )
            )
        )

    except Exception as e:

        logger.exception(
            "Unexpected error during streaming"
        )

        st.error(str(e))