// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Collection from './components/Collection';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Themes from './components/Themes';
import SubThemes from './components/SubThemes';
import { AuthProvider } from './components/AuthContext';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/collection/:userId" element={<Collection />} />
                        <Route path="/themes" element={<Themes />} />
                        <Route path="/themes/:themeId" element={<SubThemes />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
