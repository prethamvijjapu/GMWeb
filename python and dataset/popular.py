import pandas as pd
import json
import ast

# Load CSV
df = pd.read_csv('Book_Details_New.csv')

# Safely convert stringified list fields (for genres)
def safe_eval_list(val):
    try:
        result = ast.literal_eval(val)
        return result if isinstance(result, list) else []
    except:
        return []

# Safely extract page count (if stored as a list or string)
def extract_page_count(val):
    try:
        pages = ast.literal_eval(val)
        if isinstance(pages, list) and pages:
            return int(pages[0])
        elif isinstance(pages, (int, float, str)):
            return int(pages)
        else:
            return None
    except:
        try:
            return int(val)
        except:
            return None

df['genres'] = df['genres'].apply(safe_eval_list)
df['pages'] = df['num_pages'].apply(extract_page_count)

# Add a sequential ID column matching your books.js file if not present
if 'id' not in df.columns:
    df['id'] = range(1, len(df) + 1)

# Sort by ratingsCount (num_ratings) descending and take top 10
df_top10 = df.sort_values(by='num_ratings', ascending=False).head(10)

# Build JS-like objects with original IDs
js_objects = []
for _, row in df_top10.iterrows():
    js_objects.append({
        "id": int(row["id"]),  # preserve original ID
        "title": row["book_title"],
        "author": row["author"],
        "image": row["cover_image_uri"],
        "description": row["book_details"],
        "genres": row["genres"],
        "pages": row["pages"],
        "rating": float(row["average_rating"]) if pd.notna(row["average_rating"]) else None,
        "ratingsCount": int(row["num_ratings"]) if pd.notna(row["num_ratings"]) else 0,
        "reviewsCount": int(row["num_reviews"]) if pd.notna(row["num_reviews"]) else 0,
        "publication": row["publication_info"]
    })

# Format as a JS file string
js_string = "const popular_books = " + json.dumps(js_objects, indent=2) + ";\n\nexport default popular_books;"

# Save to file
with open("popular.js", "w", encoding="utf-8") as f:
    f.write(js_string)

print("✅ popular.js saved in the required format with original IDs and top 10 by ratingsCount")
