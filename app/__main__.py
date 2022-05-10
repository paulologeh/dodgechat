import os

from . import create_app

app = create_app(os.getenv("FLASK_CONFIG", "DEVELOPMENT"))
app.run(debug=True)
