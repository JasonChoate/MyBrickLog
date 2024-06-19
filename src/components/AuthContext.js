// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const login = async (username, password) => {
        const response = await fetch('/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.success) {
            const user = { user_id: data.user_id, username: data.username };
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const register = async (username, email, password) => {
        const response = await fetch('/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (data.success) {
            return true;
        }
        return false;
    };

    const logout = async () => {
        await fetch('/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
