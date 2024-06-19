// Collection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Themes.css';
import './Collection.css';
import './Styles.css';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Collection = () => {
    const [sets, setSets] = useState([]);
    const [username, setUsername] = useState('');
    const [selectedSet, setSelectedSet] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const { userId } = useParams();
    const { user } = useAuth();

    useEffect(() => {
        const fetchCollection = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/get_user_collection.php?user_id=${userId}`);
                if (response.data.error) {
                    // Handle specific errors from server
                    console.error('Error fetching user collection:', response.data.error);
                    // Optionally, set state to indicate an error occurred
                } else {
                    setSets(response.data.sets);
                    setUsername(response.data.username);
                }
            } catch (error) {
                console.error('Error fetching user collection:', error);
                // Set state to indicate an error occurred
            }
            setIsLoading(false);
        };
    
        fetchCollection();
    }, [userId]);

    useEffect(() => {
        if (copiedUrl) {
          setTimeout(() => setCopiedUrl(false), 5000); // Set copiedUrl to false after 5 seconds
        }
    }, [copiedUrl]);

    const handleImageError = (e) => {
        e.target.src = '/images/lego_piece_questionmark.png'; // Set fallback image path
    };

    const shareCollection = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          setCopiedUrl(true); // Set copiedUrl to true after copying the URL
        }).catch(err => {
          console.error('Error copying URL:', err);
        });
    };

    const updateQuantity = async (set_num, newQuantity) => {
        try {
            const response = await axios.post('/update_set_quantity.php', { user_id: userId, set_num, quantity: newQuantity });
            if (response.data.success) {
                setSets(sets.map(set => (set.set_num === set_num ? { ...set, quantity: newQuantity } : set)));
            } else {
                console.error('Error updating quantity:', response.data.error);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const removeSet = async (set_num) => {
        try {
            const response = await axios.post('/remove_set_from_collection.php', { user_id: userId, set_num });
            if (response.data.success) {
                setSets(sets.filter(set => set.set_num !== set_num));
            } else {
                console.error('Error removing set:', response.data.error);
            }
        } catch (error) {
            console.error('Error removing set:', error);
        }
    };

    const toggleCompleteStatus = async (set_num, currentStatus) => {
        try {
            const response = await axios.post('/toggle_set_complete_status.php', { user_id: userId, set_num, complete: currentStatus ? 0 : 1 });
            if (response.data.success) {
                setSets(sets.map(set => (set.set_num === set_num ? { ...set, complete: currentStatus ? 0 : 1 } : set)));
            } else {
                console.error('Error toggling complete status:', response.data.error);
            }
        } catch (error) {
            console.error('Error toggling complete status:', error);
        }
    };

    const toggleSelectSet = (set_num) => {
        if (user && user.user_id === parseInt(userId)) {
            setSelectedSet(selectedSet === set_num ? null : set_num);
        }
    };

    const [collapsedThemes, setCollapsedThemes] = useState({});

    const toggleCollapse = (themeId) => {
        setCollapsedThemes(prev => ({ ...prev, [themeId]: !prev[themeId] }));
    };

    const groupedSets = sets.reduce((acc, set) => {
        if (!acc[set.theme_id]) {
            acc[set.theme_id] = { theme_name: set.theme_name, sets: [] };
        }
        acc[set.theme_id].sets.push(set);
        return acc;
    }, {});

    // Calculate Collection Stats
    console.log('Updated sets:', sets);
    const totalSets = sets.reduce((acc, set) => acc + set.quantity, 0);
    const totalParts = sets.reduce((acc, set) => acc + (set.num_parts * set.quantity), 0);
    const totalMinifigures = sets.reduce((acc, set) => acc + (set.num_minifigures * set.quantity), 0);
    console.log('Total minifigures:', totalMinifigures);

    return (
        <div className="content">

            {sets.length === 0 && !isLoading && (
                <div className="error-message">Something went wrong! This user couldn't be found.</div>
            )}

            {!isLoading && sets.length > 0 && (
                <>

                    <button onClick={shareCollection} className="share-button">
                        {copiedUrl ? <FontAwesomeIcon icon="thumbs-up" style={{ marginRight: '8px' }} /> : <FontAwesomeIcon icon="share" style={{ marginRight: '8px' }} />}
                        {copiedUrl ? 'Successfully copied link!' : 'Share Collection'}
                    </button>

                    <div className="theme-header">{user && user.user_id === parseInt(userId) ? 'My Collection' : `${username}'s Collection`}</div>

                    <div className="stats-container">
                        <div className="collection-stats">
                            <div className="stats-section">
                                <div className="stats-header">Number of Sets</div>
                                <div className="stats-value">{totalSets}</div>
                            </div>
                            <div className="stats-section">
                                <div className="stats-header">Number of Parts</div>
                                <div className="stats-value">{totalParts}</div>
                            </div>
                            <div className="stats-section">
                                <div className="stats-header">Number of Minifigures</div>
                                <div className="stats-value">{totalMinifigures}</div>
                            </div>
                        </div>
                    </div>

                    <div className="themes-container">
                        {Object.keys(groupedSets).map(themeId => (
                            <div key={themeId} className="theme-section">
                                <div className="theme-title" onClick={() => toggleCollapse(themeId)}>
                                    {groupedSets[themeId].theme_name}
                                    <FontAwesomeIcon icon={collapsedThemes[themeId] ? "chevron-right" : "chevron-down"} style={{ marginLeft: '8px' }} />
                                </div>
                                {!collapsedThemes[themeId] && (
                                    <div className="sets-container">
                                        {groupedSets[themeId].sets.map(set => (
                                            <div
                                                key={set.set_num}
                                                className={`set-card ${set.complete === 0 ? 'incomplete' : ''} ${selectedSet === set.set_num ? 'selected' : ''}`}
                                                onClick={() => toggleSelectSet(set.set_num)}
                                            >
                                                <img
                                                    src={set.img_url}
                                                    alt={set.name}
                                                    className="set-image"
                                                    onError={handleImageError}
                                                    loading="lazy"
                                                />
                                                <div className="set-name">{set.name}</div>
                                                {user && user.user_id === parseInt(userId) && selectedSet === set.set_num ? (
                                                    <div className="set-actions">
                                                        <button className="quantity-button" onClick={() => updateQuantity(set.set_num, set.quantity - 1)} disabled={set.quantity <= 1}>-</button>
                                                        <span className="quantity-input">{set.quantity}</span>
                                                        <button className="quantity-button" onClick={() => updateQuantity(set.set_num, set.quantity + 1)}>+</button>
                                                
                                                        <button className={`${set.complete === 0 ? 'incomplete-button' : 'complete-button'}`} onClick={() => toggleCompleteStatus(set.set_num, set.complete)}>
                                                            {set.complete ? 'Incomplete' : 'Complete'}
                                                        </button>
                                                
                                                        <button className="remove-button" onClick={() => removeSet(set.set_num)}>Remove</button>
                                                    </div>
                                                ) : (
                                                    <div className="set-num">{set.set_num}</div>
                                                )}

                                                {set.quantity > 1 && (
                                                    <div className="badge">x{set.quantity}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </>
            )}

            
            
            
            
            {isLoading && (
                <div className="loading">Loading...</div>
            )}
        </div>



    );
};

export default Collection;
