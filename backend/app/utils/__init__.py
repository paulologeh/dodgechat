import os
from flask import current_app


def extract_all_errors(err):
    errors = []
    for key in err.messages:
        errors += err.messages[key]
    return errors


def get_test_emails():
    with open(f"{current_app.root_path}/test_data/accounts.txt") as f:
        test_emails = f.read().splitlines()

    return test_emails


def get_test_conversation():
    with open(f"{current_app.root_path}/test_data/conversations.txt") as f:
        test_conversations = f.read().splitlines()

    return test_conversations


def get_database_uri():
    host = os.environ.get("POSTGRES_HOST")
    password = os.environ.get("POSTGRES_PASSWORD")
    database = os.environ.get("POSTGRES_DB")

    return f"postgresql://postgres:{password}@{host}/{database}"


def get_redis_uri():
    host = os.environ.get("REDIS_HOST")
    password = os.environ.get("REDIS_PASSWORD")
    port = int(os.environ.get("REDIS_PORT"))

    return f"redis://:{password}@{host}:{port}"
