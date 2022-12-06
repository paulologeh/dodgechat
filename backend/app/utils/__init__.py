import os
from flask import current_app


def get_front_end():
    return os.getenv("FRONT_END_URL", "http://localhost:8080")


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
