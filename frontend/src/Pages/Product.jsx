// src/Pages/Product.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import all_books from '../Components/Assets/books';
import './CSS/Product.css';

// Get the backend API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL;

const Product = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const book = all_books.find(b => String(b.id) === String(productId));

    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token || !book) {
            setLoading(false);
            return;
        }
        const fetchLiked = async () => {
            try {
                const res = await axios.get(`${API_URL}/liked-books`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLiked(res.data.likedBooks.includes(book.id));
            } catch (err) {
                console.error('Failed to fetch liked books:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLiked();
    }, [book, token]);

    if (!book) {
        return <div style={{ padding: '2rem' }}>Book not found.</div>;
    }

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) return navigate('/loginsignup');
        try {
            if (!liked) {
                await axios.post(`${API_URL}/like`, { bookId: book.id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/unlike`, { bookId: book.id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setLiked(prev => !prev);
        } catch (err) {
            console.error('Error updating like status:', err);
            alert(err.response?.data?.message || 'Error updating like status.');
        }
    };

    return (
        <div className="product-detail-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <div className="product-detail-card">
                <div className="product-image-section">
                    <img src={book.image} alt={book.title} className="product-image" />
                </div>

                <div className="product-info-section">
                    <h1>{book.title}</h1>
                    <p className="product-author"><strong>Author:</strong> {book.author}</p>

                    <div className="product-tags">
                        {book.genres.map((tag, idx) => (
                            <span key={idx} className="product-tag">{tag}</span>
                        ))}
                    </div>

                    <p className="product-description">{book.description}</p>

                    <button
                        className={`like-btn ${liked ? 'liked' : ''}`}
                        onClick={handleLike}
                        disabled={loading}
                        aria-label={liked ? 'Unlike' : 'Like'}
                    >
                        {liked ? <FaHeart color="#ff4141" /> : <FaRegHeart color="#888" />}
                        <span>{liked ? 'Liked' : 'Like'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Product;
