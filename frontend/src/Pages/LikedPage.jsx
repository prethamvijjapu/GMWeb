// src/Pages/LikedPage.jsx
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import booksData from '../Components/Assets/books';
import Item from '../Components/Item/Item';
import './CSS/LikedPage.css';

// Get the backend API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL;

const LikedPage = () => {
    const [likedBooks, setLikedBooks] = useState(null);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    // Fetch liked books from backend
    const fetchLikedBooks = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            setLikedBooks([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/liked-books`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikedBooks(res.data.likedBooks || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load liked books. Please try again.'
            );
            setLikedBooks([]);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchLikedBooks();
    }, [fetchLikedBooks]);

    if (!isLoggedIn) {
        return (
            <div className="liked-page">
                <h1>Liked Books</h1>
                <p>You must <Link to="/loginsignup">log in</Link> to view your liked books.</p>
            </div>
        );
    }

    if (likedBooks === null) {
        return <p>Loading your liked books…</p>;
    }

    // Map IDs to book objects and filter out missing entries
    const likedBookObjects = likedBooks
        .map(id => booksData.find(book => book.id === id))
        .filter(Boolean);

    return (
        <div className="liked-page">
            <h1>Liked Books</h1>
            {error && <p className="error">{error}</p>}

            {likedBookObjects.length > 0 ? (
                <div className="liked-books-list-grid">
                    {likedBookObjects.map(book => (
                        <Item
                            key={book.id}
                            item={book}
                            // Tell each Item to trigger a refresh after like/unlike
                            onLikeChanged={fetchLikedBooks}
                        />
                    ))}
                </div>
            ) : (
                <p>You haven’t liked any books yet.</p>
            )}
        </div>
    );
};

export default LikedPage;
