# flask-api/app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# Import the recommender class from its own module
from recommender import BookRecommender

app = Flask(__name__)
# Enable CORS for all domains; restrict origins in production if needed
CORS(app)

# Determine absolute paths for model and data files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "book_recommender.pkl")
DATA_CSV   = os.path.join(BASE_DIR, "Book_Details_New.csv")

# Load your dataset (if needed) and the serialized recommender
# If your pickled BookRecommender already contains the dataframe and matrices, you can skip loading the CSV here.
df = pd.read_csv(DATA_CSV)  # Only needed if your recommender was built externally and requires df for future retraining
recommender: BookRecommender = joblib.load(MODEL_PATH)

@app.route("/", methods=["GET"])
def home():
    return (
        "<h1>Book Recommendation Flask API</h1>"
        "<p>POST JSON <code>{'liked_books': [id1, id2, ...]}</code> to <code>/recommend</code></p>"
    )

@app.route("/recommend", methods=["POST"])
def recommend_route():
    data = request.get_json(force=True)
    liked_ids = data.get("liked_books", [])

    # Validate input
    if not isinstance(liked_ids, list):
        return jsonify({"error": "Field 'liked_books' must be a list of book IDs"}), 400

    try:
        recommendations = recommender.recommend(liked_ids, n=30)
        return jsonify({"recommendations": recommendations}), 200
    except Exception:
        # In production, log the exception details
        return jsonify({"error": "Failed to compute recommendations"}), 500

if __name__ == "__main__":
    # Use the PORT environment variable if set (Render, Heroku), default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Listen on all network interfaces
    app.run(host="0.0.0.0", port=port, debug=False)
