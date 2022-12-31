from dotenv import load_dotenv

load_dotenv()

bind = "0.0.0.0:8000"
worker_class = "eventlet"
workers = 1
accesslog = "flask.log"
errorlog = "flask.log"
capture_output = True
reload = True
