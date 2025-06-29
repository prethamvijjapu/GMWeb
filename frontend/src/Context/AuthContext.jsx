// src/context/AuthContext.js
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Get the backend API URL from environment variable
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUser(res.data.user))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
            });
    }, [API_URL]);

    const login = (token, name) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userName', name);
        setUser({ name });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
