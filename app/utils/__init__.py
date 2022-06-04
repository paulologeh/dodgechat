import os


def get_front_end():
    return os.getenv("FRONT_END_URL", "http://localhost:8080")
