import pandas as pd
import json
import ast

# Load the main CSV
df = pd.read_csv("Book_Details_New.csv")

# Clean stringified lists
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

# Convert and sort by popularity (number of ratings)
df = df.sort_values(by="num_ratings", ascending=False).head(12).reset_index(drop=True)

# Build the JS-like object list
popular_books = []
for i, row in df.iterrows():
    popular_books.append({
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
js_string = "const popular_books = " + json.dumps(popular_books, indent=2) + ";"

# Save to file
with open("popular.js", "w", encoding="utf-8") as f:
    f.write(js_string)

print("✅ Saved top 12 popular books to popular.js")
