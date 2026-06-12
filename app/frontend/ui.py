import streamlit as st
import requests

from app.config.settings import settings
from app.common.logger import get_logger
from app.common.custom_exception import CustomException

logger = get_logger(__name__)

st.set_page_config(page_title="Multi-AI Agent", layout="centered")
st.title("Multi-AI Agent")

system_prompt = st.text_area("Define Your AI Agent", height=70, value="You are a helpful assistant.")
selected_model = st.selectbox("Select AI Model", settings.ALLOWED_MODEL_NAMES)

allow_web_search = st.checkbox("Allow Web Search")

user_query = st.text_area("Enter Your Query", height=100)

API_URL = "http://localhost:8080/chat"

if st.button("Ask Agent") and user_query.strip():
    payload = {
        "model_name": selected_model,
        "system_prompt": system_prompt,
        "messages": [user_query],
        "allow_search": allow_web_search
    }
    
    try:
        logger.info(f"Sending request to API with model: {selected_model}") 
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 200:
            agent_response = response.json().get("response", "")
            logger.info("Successfully received response from backend")
            st.subheader("Agent Response:")
            st.markdown(agent_response.replace("\n", "<br>"), unsafe_allow_html=True)
        else:
            logger.error("Backend error")
            st.error("Error from backend: " + response.text)

    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {e}")
        st.error(f"Failed to get response from AI agent: {str(CustomException('API request failed', error_detail=e))}")