import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Step 1: Load & Preprocess Data
def load_and_preprocess(filepath):
    df = pd.read_csv(filepath)
    df = df.drop_duplicates(subset=['book_title'])
    df = df.dropna(subset=['book_title'])
    text_cols = ['book_details', 'genres', 'author']
    df[text_cols] = df[text_cols].fillna('')
    df['content'] = (
        df['book_title'] + " " +
        df['book_details'] + " " +
        df['genres'] + " " +
        df['author']
    )
    df = df.reset_index(drop=True)
    df['book_id'] = df.index  # Assign numeric IDs if not present
    return df

# Step 2: Vectorize with TF-IDF
def vectorize_content(df):
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['content'])
    return tfidf, tfidf_matrix

# Step 3: Compute Similarity Matrix
def compute_similarity(tfidf_matrix):
    return cosine_similarity(tfidf_matrix, tfidf_matrix)

# Step 4: Build Recommendation Function
class BookRecommender:
    def __init__(self, df, tfidf, tfidf_matrix, similarity_matrix):
        self.df = df
        self.tfidf = tfidf
        self.tfidf_matrix = tfidf_matrix
        self.similarity_matrix = similarity_matrix
        self.id_to_index = pd.Series(df.index, index=df['book_id']).drop_duplicates()
        self.index_to_id = pd.Series(df['book_id'], index=df.index)
    
    def recommend(self, liked_ids, n=30):
        # Get indices of liked books
        liked_indices = [self.id_to_index[bid] for bid in liked_ids if bid in self.id_to_index]
        if not liked_indices:
            return []
        # Aggregate similarity scores across liked books
        sim_scores = self.similarity_matrix[liked_indices].mean(axis=0)
        # Exclude liked books themselves
        for idx in liked_indices:
            sim_scores[idx] = -1
        # Get top n indices
        top_indices = sim_scores.argsort()[-n:][::-1]
        # Map indices back to book IDs
        recommended_ids = [int(self.index_to_id[i]) for i in top_indices]
        return recommended_ids

# Main Pipeline
if __name__ == "__main__":
    print("Loading data...")
    df = load_and_preprocess("Book_Details.csv")
    print("Fitting TF-IDF...")
    tfidf, tfidf_matrix = vectorize_content(df)
    print("Computing similarity matrix...")
    similarity_matrix = compute_similarity(tfidf_matrix)
    recommender = BookRecommender(df, tfidf, tfidf_matrix, similarity_matrix)
    
    # Example: Recommend for liked book IDs [2, 5, 7]
    liked_ids = [2, 5, 7]
    print(f"Recommendations for liked IDs {liked_ids}:")
    print(recommender.recommend(liked_ids, n=30))
    
    print("\nSaving model...")
    joblib.dump(recommender, "book_recommender.pkl")
    print("Done! Model saved as 'book_recommender.pkl'")
