from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db
from app.routes import main

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "https:/ckdawarenessproject.up.railway.app"
], supports_credentials=True)
# ── Load config ───────────────────────────────────────────────────────────────
app.config.from_object(Config)

# ── CORS — allow all methods (GET, POST, PATCH, DELETE, OPTIONS) ──────────────
CORS(app, resources={r"/*": {
    "origins":      "http://localhost:5173",
    "methods":      ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

# ── Init DB ───────────────────────────────────────────────────────────────────
db.init_app(app)

# ── Register blueprints ───────────────────────────────────────────────────────
app.register_blueprint(main)

# ── Auto-create tables ────────────────────────────────────────────────────────
with app.app_context():
    db.create_all()
    print("✅ Database tables ready")

if __name__ == "__main__":
    app.run(debug=True)