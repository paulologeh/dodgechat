from dotenv import load_dotenv
from flask_migrate import Migrate

from app import create_app, db

load_dotenv()

app = create_app("DEVELOPMENT")
migrate = Migrate(app, db)

app.run(debug=True)
