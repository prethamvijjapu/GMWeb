# flask-api/app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
# Enable CORS for all domains; in production, you can restrict to your frontend domain
CORS(app)

# BookRecommender class definition
class BookRecommender:
    def __init__(self, df: pd.DataFrame, tfidf, tfidf_matrix, similarity_matrix):
        self.df = df
        self.tfidf = tfidf
        self.tfidf_matrix = tfidf_matrix
        self.similarity_matrix = similarity_matrix
        # Map book_id ↔ dataframe index
        self.id_to_index = pd.Series(df.index, index=df["book_id"]).drop_duplicates()
        self.index_to_id = pd.Series(df["book_id"], index=df.index)

    def recommend(self, liked_ids: list[int], n: int = 30) -> list[int]:
        # Convert liked book IDs to dataframe indices
        liked_indices = [
            self.id_to_index[bid]
            for bid in liked_ids
            if bid in self.id_to_index
        ]
        if not liked_indices:
            return []
        # Compute mean similarity across liked books
        sim_scores = self.similarity_matrix[liked_indices].mean(axis=0)
        # Exclude the books the user already liked
        for idx in liked_indices:
            sim_scores[idx] = -1
        # Get top N indices
        top_indices = sim_scores.argsort()[-n:][::-1]
        # Convert back to book IDs
        return [int(self.index_to_id[i]) for i in top_indices]

# Determine paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "book_recommender.pkl")
DATA_CSV = os.path.join(BASE_DIR, "Book_Details_New.csv")

# Load dataset and similarity structures if needed by your recommender
# If your pickled object already contains these, skip loading CSV below.
df = pd.read_csv(DATA_CSV)
# Assume the pickled object encapsulates tfidf, matrix, etc.
recommender: BookRecommender = joblib.load(MODEL_PATH)

@app.route("/", methods=["GET"])
def home():
    return (
        "<h1>Book Recommendation Flask API</h1>"
        "<p>POST to /recommend with JSON body "
        "<code>{'liked_books': [book_id, ...]}</code></p>"
    )

@app.route("/recommend", methods=["POST"])
def recommend_route():
    data = request.get_json(force=True)
    liked_ids = data.get("liked_books", [])
    if not isinstance(liked_ids, list):
        return jsonify({"error": "Field 'liked_books' must be a list of IDs"}), 400

    try:
        recommendations = recommender.recommend(liked_ids, n=30)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        # Log the exception in real-world apps
        return jsonify({"error": "Failed to compute recommendations"}), 500

if __name__ == "__main__":
    # Use PORT from environment (Render, Heroku) or default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Listen on all interfaces
    app.run(host="0.0.0.0", port=port, debug=False)
