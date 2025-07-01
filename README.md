#NEXTPAGE - Book Reccommendation Engine Python JavaScript Tailwind CSS License

NextPage is a fast, personalized web app that helps you find books you’ll actually love. Built with a Python backend and a clean React frontend, it delivers smart recommendations based on your ratings and reading preferences. Search, explore, rate, and stack your next reads—all in one place

Features

Frontend Home page for guests with genre discovery and tagline Personalized home page for logged-in users with recommendations Book cards with cover, title, author, ratings, and add-to-shelf option Detailed book pages with shelving, rating, reviewing, and community reviews User profile with avatar, stats, ratings, bookshelves (To-Read, Finished), and reviews Search and filter books by genre, year, rating, and author Grid/List view toggle for search results Recommendation page with clickable book suggestions

Backend Loads and preprocesses book data from CSV Vectorizes book content using TF-IDF Calculates cosine similarity to recommend similar books Recommends books based on title input Saves trained recommendation model using joblib Integrated with the frontend to serve live recommendations

Demo:

[ like.mp4 ](https://github.com/user-attachments/assets/63ede532-6dfe-4993-9da1-4fe34a8b8385)

https://github.com/user-attachments/assets/d72c432a-e8fb-45ce-96b9-2e5b8d62935f

https://github.com/user-attachments/assets/8fc49815-56fa-4bd1-a764-b76923dc7309

Project Structure project/ │ ├── src/ # React Frontend │ ├── backend/ # Python Backend │ ├── recommender.py │ ├── Book_Details.csv │ └── book_recommender.pkl │ └── README.md

Installation - Backend

cd backend pip install pandas scikit-learn joblib python recommender.py The trained model will be saved as book_recommender.pkl.

Frontend

cd src npm install npm run dev

Usage Visit the live site.

Sign up and log in to access personalized features.

Rate a few books you’ve read.

Get book recommendations tailored to your preferences.

Search, explore, and track your reading lists and reviews.

Security Notes User data is handled securely in the deployed version.

The application currently does not use advanced authentication or encryption layers.

Further security and scalability improvements can be added in future versions.

License This project is licensed under the MIT License.









