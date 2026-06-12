import subprocess
import threading
import time

from app.common.logger import get_logger
from app.common.custom_exception import CustomException

from dotenv import load_dotenv

logger = get_logger(__name__)

load_dotenv(override=True)

def run_backend():
    try:
        logger.info("Starting backend service...")
        subprocess.run(["uvicorn", "app.backend.api:app", "--host", "0.0.0.0", "--port", "8080"], check=True)
    except CustomException as e:
        logger.error("Problem with backend service")
        raise CustomException("Failed to start backend", e)


def run_frontend():
    try:
        logger.info("Starting frontend service...")
        subprocess.run(["streamlit", "run", "app/frontend/ui.py"], check=True)
    except CustomException as e:
        logger.error("Problem with frontend service")
        raise CustomException("Failed to start frontend", e)


if __name__ == "__main__":
    try:
        threading.Thread(target=run_backend).start()
        time.sleep(2)
        run_frontend()
    except CustomException as e:
        logger.error(f"Application failed to start: {e}")