import os


def get_front_end():
    return os.getenv("FRONT_END_URL", "http://localhost:8080")


def extract_all_errors(err):
    errors = []
    for key in err.messages:
        errors += err.messages[key]
    return errors
