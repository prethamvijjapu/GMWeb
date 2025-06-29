# recommender.py

import pandas as pd

class BookRecommender:
    def __init__(self, df, tfidf, tfidf_matrix, similarity_matrix):
        self.df = df
        self.tfidf = tfidf
        self.tfidf_matrix = tfidf_matrix
        self.similarity_matrix = similarity_matrix
        self.id_to_index = pd.Series(df.index, index=df["book_id"]).drop_duplicates()
        self.index_to_id = pd.Series(df["book_id"], index=df.index)

    def recommend(self, liked_ids, n=30):
        liked_indices = [
            self.id_to_index[bid] for bid in liked_ids if bid in self.id_to_index
        ]
        if not liked_indices:
            return []
        # Average similarity scores for liked books
        sim_scores = self.similarity_matrix[liked_indices].mean(axis=0)
        # Exclude already liked
        for idx in liked_indices:
            sim_scores[idx] = -1
        top_idxs = sim_scores.argsort()[-n:][::-1]
        return [int(self.index_to_id[i]) for i in top_idxs]
