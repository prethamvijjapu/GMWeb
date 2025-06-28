import pandas as pd

# Load the CSV file
df = pd.read_csv("Book_Details.csv")

# Function to generate a basic placeholder description
def generate_description(row):
    return f"This book titled '{row['book_title']}' is written by {row['author']} and falls under the genres: {row['genres']}."

# Fill missing values in 'book_details'
df['book_details'] = df.apply(
    lambda row: generate_description(row) if pd.isna(row['book_details']) else row['book_details'],
    axis=1
)

# Confirm no missing values remain
print("Missing values after fill:", df['book_details'].isnull().sum())

# Save the cleaned DataFrame
df.to_csv("Book_Details_New.csv", index=False)
