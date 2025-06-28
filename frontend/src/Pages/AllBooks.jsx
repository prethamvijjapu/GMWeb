import { useState } from 'react';
import all_books from '../Components/Assets/books'; // Adjust path as needed
import Item from '../Components/Item/Item'; // Your existing Item component
import './CSS/AllBooks.css';

const AllBooks = () => {
    const [visibleCount, setVisibleCount] = useState(50);

    // Slice the books array to show only visibleCount books
    const visibleBooks = all_books.slice(0, visibleCount);

    // Handler to load more books
    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + 50, all_books.length));
    };

    return (
        <div className="all-books-container">
            <h1>All Books</h1>
            <div className="books-grid">
                {visibleBooks.map(book => (
                    <Item key={book.id} item={book} />
                ))}
            </div>
            {visibleCount < all_books.length && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                    More
                </button>
            )}
        </div>
    );
};

export default AllBooks;
