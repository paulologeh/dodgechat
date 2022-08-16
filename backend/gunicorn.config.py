import multiprocessing
import os

from dotenv import load_dotenv

load_dotenv()

bind = "0.0.0.0:8000"
workers = (
    multiprocessing.cpu_count() * 2 + 1
    if os.environ.get("ENVIRONMENT") == "PRODUCTION"
    else 1
)
accesslog = "flask.log"
errorlog = "flask.log"
capture_output = True
reload = True
