import pandas as pd
import json
import ast
from collections import defaultdict

# Load CSV
df = pd.read_csv("Book_Details_New.csv")

# Convert stringified lists
def safe_eval_list(val):
    try:
        result = ast.literal_eval(val)
        return result if isinstance(result, list) else []
    except:
        return []

df['genres'] = df['genres'].apply(safe_eval_list)

def extract_page_count(val):
    try:
        pages = ast.literal_eval(val)
        return int(pages[0]) if isinstance(pages, list) and pages else None
    except:
        return None

df['num_pages'] = df['num_pages'].apply(extract_page_count)

# Prepare genre-wise top 16 book dictionary
genre_books = defaultdict(list)

# Flatten by genre
for genre in df['genres'].explode().dropna().unique():
    genre_df = df[df['genres'].apply(lambda g: genre in g)]
    top_books = genre_df.sort_values(by="num_ratings", ascending=False).head(16)

    genre_books[genre] = []
    for i, row in top_books.iterrows():
        genre_books[genre].append({
            "id": i + 1,
            "title": row["book_title"],
            "author": row["author"],
            "image": row["cover_image_uri"],
            "description": row["book_details"],
            "genres": row["genres"],
            "pages": row["num_pages"],
            "rating": float(row["average_rating"]) if pd.notna(row["average_rating"]) else None,
            "ratingsCount": int(row["num_ratings"]) if pd.notna(row["num_ratings"]) else 0,
            "reviewsCount": int(row["num_reviews"]) if pd.notna(row["num_reviews"]) else 0,
            "publication": row["publication_info"]
        })

# Format to JS syntax
js_output = "const genrewise_books = " + json.dumps(genre_books, indent=2) + ";"

# Save to file
with open("genrewise_books.js", "w", encoding="utf-8") as f:
    f.write(js_output)

print("✅ Saved genre-wise top 16 books in genrewise_books.js")
