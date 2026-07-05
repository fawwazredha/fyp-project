from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db
from app.routes import main

app = Flask(__name__)

# ── Load config ───────────────────────────────────────────────────────────────
app.config.from_object(Config)

# ── CORS — single call, all allowed origins + methods ─────────────────────────
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:5173",
        "https://ckdawarenessproject.up.railway.app",
        "https://gallant-youth-production-dc3b.up.railway.app",
    ],
    "methods": ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}}, supports_credentials=True)

# ── Init DB ───────────────────────────────────────────────────────────────────
db.init_app(app)

# ── Register blueprints ───────────────────────────────────────────────────────
app.register_blueprint(main)

# ── Auto-create tables ────────────────────────────────────────────────────────
with app.app_context():
    db.create_all()
    print("✅ Database tables ready")

# ── Ensure DB session is cleaned up after every request, even on errors ──────
@app.teardown_appcontext
def shutdown_session(exception=None):
    if exception:
        db.session.rollback()
    db.session.remove()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)