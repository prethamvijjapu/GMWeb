// src/Components/Item/Item.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from 'react-router-dom';
import "./Item.css";

const Item = ({ item, onLikeChanged }) => {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    // Sync state from backend on mount
    useEffect(() => {
        const fetchLiked = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:4000/liked-books', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLiked(res.data.likedBooks.includes(item.id));
            } catch {
                // ignore errors
            } finally {
                setLoading(false);
            }
        };
        fetchLiked();
    }, [item.id, token]);

    // Handle like/unlike and notify parent
    const handleLike = async e => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            alert('Please log in to like books.');
            return;
        }
        try {
            if (!liked) {
                await axios.post(
                    'http://localhost:4000/like',
                    { bookId: item.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    'http://localhost:4000/unlike',
                    { bookId: item.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setLiked(prev => !prev);
            onLikeChanged();  // Trigger parent to refresh its data
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating like status.');
        }
    };

    if (loading) {
        return <div className="item loading">Loading…</div>;
    }

    return (
        <div className="item">
            <Link to={`/product/${item.id}`}>
                <div className="item-img-wrap">
                    <img src={item.image} alt={item.title} className="item-img" />
                    {item.genres?.[0] && <span className="item-genre">{item.genres[0]}</span>}
                    <span className="item-like" onClick={handleLike}>
                        {liked ? <FaHeart color="#ff4141" /> : <FaRegHeart color="#888" />}
                    </span>
                </div>
                <div className="item-info">
                    <p className="item-title">{item.title}</p>
                    <p className="item-author">{item.author}</p>
                </div>
            </Link>
        </div>
    );
};

export default Item;
