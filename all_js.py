import pandas as pd
import json
import ast

# Load the CSV file
df = pd.read_csv("Book_Details_New.csv")

# Convert stringified list fields safely
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

# Build JS-like objects with sequential IDs
js_objects = []
for i, (_, row) in enumerate(df.iterrows(), start=1):
    js_objects.append({
        "id": i,
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

# Format as a JS file
js_string = "const all_books = " + json.dumps(js_objects, indent=2) + ";"

# Save to file
with open("all_books.js", "w", encoding="utf-8") as f:
    f.write(js_string)

print("✅ all_books.js saved with sequential IDs")
