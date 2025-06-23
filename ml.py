import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Step 1: Load & Preprocess Data
def load_and_preprocess(filepath):
    # Load CSV
    df = pd.read_csv(filepath)
    
    # Drop duplicates and nulls
    df = df.drop_duplicates(subset=['book_title'])
    df = df.dropna(subset=['book_title'])
    
    # Fill missing text fields with empty string
    text_cols = ['book_details', 'genres', 'author']
    df[text_cols] = df[text_cols].fillna('')
    
    # Combine all text into a single "content" field
    df['content'] = (
        df['book_title'] + " " + 
        df['book_details'] + " " + 
        df['genres'] + " " + 
        df['author']
    )
    
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
        self.title_to_index = pd.Series(df.index, index=df['book_title']).drop_duplicates()
    
    def recommend(self, title, n=5):
        # Get the index of the book
        idx = self.title_to_index[title]
        
        # Get pairwise similarity scores
        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        
        # Sort by similarity
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top N most similar books (skip self)
        sim_scores = sim_scores[1:n+1]
        book_indices = [i[0] for i in sim_scores]
        
        # Return titles
        return self.df['book_title'].iloc[book_indices].tolist()

# Main Pipeline
if __name__ == "__main__":
    # Load and preprocess
    print("Loading data...")
    df = load_and_preprocess("Book_Details.csv")
    
    # Vectorize
    print("Fitting TF-IDF...")
    tfidf, tfidf_matrix = vectorize_content(df)
    
    # Compute similarity
    print("Computing similarity matrix...")
    similarity_matrix = compute_similarity(tfidf_matrix)
    
    # Initialize recommender
    recommender = BookRecommender(df, tfidf, tfidf_matrix, similarity_matrix)
    
    # Test
    print("\nTesting recommendation...")
    test_title = "Harry Potter and the Chamber of Secrets"  # Replace with a title from your dataset
    if test_title in df['book_title'].values:
        print(f"Recommendations for '{test_title}':")
        print(recommender.recommend(test_title, n=5))
    else:
        print(f"'{test_title}' not found in dataset. Try another title.")
    
    # Save model
    print("\nSaving model...")
    joblib.dump(recommender, "book_recommender.pkl")
    print("Done! Model saved as 'book_recommender.pkl'")