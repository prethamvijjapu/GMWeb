from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# BookRecommender class definition
class BookRecommender:
    def __init__(self, df, tfidf, tfidf_matrix, similarity_matrix):
        self.df = df
        self.tfidf = tfidf
        self.tfidf_matrix = tfidf_matrix
        self.similarity_matrix = similarity_matrix
        self.id_to_index = pd.Series(df.index, index=df['book_id']).drop_duplicates()
        self.index_to_id = pd.Series(df['book_id'], index=df.index)
    
    def recommend(self, liked_ids, n=30):
        liked_indices = [self.id_to_index[bid] for bid in liked_ids if bid in self.id_to_index]
        if not liked_indices:
            return []
        sim_scores = self.similarity_matrix[liked_indices].mean(axis=0)
        for idx in liked_indices:
            sim_scores[idx] = -1
        top_indices = sim_scores.argsort()[-n:][::-1]
        recommended_ids = [int(self.index_to_id[i]) for i in top_indices]
        return recommended_ids

# Load the saved model
recommender = joblib.load("book_recommender.pkl")

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    liked_ids = data.get('liked_books', [])
    recommendations = recommender.recommend(liked_ids, n=30)
    return jsonify({"recommendations": recommendations})

@app.route('/', methods=['GET'])
def home():
    return "<h1>Book Recommendation Flask API</h1><p>POST to /recommend with {'liked_books': [ids]}</p>"

if __name__ == '__main__':
    app.run(port=5000)
