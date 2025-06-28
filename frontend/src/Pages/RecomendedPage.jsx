// src/Pages/RecommendedPage.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import booksData from '../Components/Assets/books';
import Item from '../Components/Item/Item';
import './CSS/RecommendedPage.css';

const RecommendedPage = () => {
    const [recommendedBooks, setRecommendedBooks] = useState(null);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [loading, setLoading] = useState(false);

    // Fetch stored recommendations
    const fetchRecommendations = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            setRecommendedBooks([]);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:4000/recommended-books', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendedBooks(res.data.recommendedBooks || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load recommendations. Please try again.');
            setRecommendedBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Regenerate recommendations and update DB
    const refreshRecommendations = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            return;
        }
        try {
            setLoading(true);
            await axios.post('http://localhost:4000/generate-recommendations', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchRecommendations();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to refresh recommendations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (!isLoggedIn) {
        return (
            <div className="recommended-page">
                <h1>Recommended Books</h1>
                <p>You must <Link to="/login">log in</Link> to view your recommendations.</p>
            </div>
        );
    }

    if (recommendedBooks === null) {
        return <p>Loading your recommendations…</p>;
    }

    // Map IDs to book objects and filter out missing entries
    const recommendedBookObjects = recommendedBooks
        .map(id => booksData.find(book => book.id === id))
        .filter(Boolean);

    return (
        <div className="recommended-page">
            <div className="recommended-header">
                <h1>Recommended Books</h1>
                <button
                    className="refresh-btn"
                    onClick={refreshRecommendations}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Recommendations'}
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            {recommendedBookObjects.length > 0 ? (
                <div className="recommended-books-grid">
                    {recommendedBookObjects.map(item => (
                        <Item key={item.id} item={item} initialLiked={false} />
                    ))}
                </div>
            ) : (
                <p>No recommendations available. Like some books and refresh!</p>
            )}
        </div>
    );
};

export default RecommendedPage;
