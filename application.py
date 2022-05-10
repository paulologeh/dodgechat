import os

from dotenv import load_dotenv
from flask_migrate import Migrate

from app import create_app, db

dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)


app = create_app(os.getenv("FLASK_CONFIG"))
migrate = Migrate(app, db)
