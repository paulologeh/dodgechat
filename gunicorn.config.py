import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
accesslog = "flask.log"
errorlog = "flask.log"
capture_output = True
reload = True
