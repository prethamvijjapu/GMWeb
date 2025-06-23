import os
import json
import requests

# --- STEP 1: Load the JS file content ---
with open("genrewise_books.js", "r", encoding="utf-8") as f:
    js_data = f.read()

# Remove JS variable declaration to get pure JSON
json_data = js_data.replace("const genrewise_books = ", "").rstrip(";")

# Convert to Python dict
genre_books = json.loads(json_data)

# --- STEP 2: Prepare output folder ---
output_folder = "photos"
os.makedirs(output_folder, exist_ok=True)

# --- STEP 3: Download images and update links ---
book_counter = 1

for genre in genre_books:
    for book in genre_books[genre]:
        image_url = book["image"]
        image_ext = os.path.splitext(image_url)[-1].split("?")[0] or ".jpg"
        local_path = f"{output_folder}/product_{book_counter}.jpg"
        try:
            response = requests.get(image_url, timeout=10)
            if response.status_code == 200:
                with open(local_path, "wb") as img_file:
                    img_file.write(response.content)
                print(f"✅ Saved: {local_path}")
            else:
                print(f"❌ Failed to download image for book {book['title']}")
        except Exception as e:
            print(f"❌ Error for {image_url}: {e}")
        
        book["localImage"] = f"./photos/product_{book_counter}.jpg"
        book_counter += 1

# --- STEP 4: Save updated JS ---
with open("genrewise_books_local.js", "w", encoding="utf-8") as f:
    f.write("const genrewise_books = " + json.dumps(genre_books, indent=2) + ";")

print("\n✅ All images downloaded and genrewise_books_local.js updated.")
