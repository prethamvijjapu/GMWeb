// src/context/AuthContext.js
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        axios.get('http://localhost:4000/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUser(res.data.user))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
            });
    }, []);

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
