// src/components/SubThemes.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Themes.css';
import './Styles.css';
import './Sets.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SubThemes = () => {
    const [subThemes, setSubThemes] = useState([]);
    const [sets, setSets] = useState([]);
    const [selectedSets, setSelectedSets] = useState({});
    const [submittedSets, setSubmittedSets] = useState(false);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { themeId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubThemes = async () => {
            try {
                axios.defaults.withCredentials = true;
                const subThemesResponse = await axios.get(`/get_sub_themes.php?parent_id=${themeId}`);
                setSubThemes(subThemesResponse.data);
            } catch (error) {
                console.error('Error fetching sub-themes:', error);
            }
        };

        fetchSubThemes();
        setSets([]); // Reset sets when themeId changes
        setPage(1); // Reset page to 1 when themeId changes
    }, [themeId]);

    useEffect(() => {
        const fetchSets = async () => {
            setIsLoading(true);
            try {
                const setsResponse = await axios.get(`/get_lego_sets.php?theme_id=${themeId}&page=${page}`);
                setSets(prevSets => {
                    // Check if the new sets already exist in the previous sets to avoid duplication
                    const newSets = setsResponse.data.filter(newSet => 
                        !prevSets.some(prevSet => prevSet.set_num === newSet.set_num)
                    );
                    return [...prevSets, ...newSets];
                });
            } catch (error) {
                console.error('Error fetching sets:', error);
            }
            setIsLoading(false);
        };

        fetchSets();
    }, [page, themeId]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight && !isLoading) {
                setPage(prevPage => prevPage + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading]);

    useEffect(() => {
        if (submittedSets) {
          setTimeout(() => setSubmittedSets(false), 5000); // Set copiedUrl to false after 5 seconds
        }
    }, [submittedSets]);

    const handleThemeClick = (subThemeId) => {
        navigate(`/themes/${subThemeId}`);
    };

    const handleQuantityChange = (setNum, quantity) => {
        setSelectedSets(prevSelectedSets => ({
            ...prevSelectedSets,
            [setNum]: quantity
        }));
    };

    const toggleSelectSet = (setNum) => {
        setSelectedSets(prevSelectedSets =>
            prevSelectedSets[setNum]
                ? { ...prevSelectedSets, [setNum]: undefined }
                : { ...prevSelectedSets, [setNum]: 1 }
        );
    };

    const addToCollection = () => {
        const setsToAdd = Object.entries(selectedSets)
            .filter(([setNum, quantity]) => quantity)
            .map(([setNum, quantity]) => ({ setNum, quantity }));
    
        axios.post('/add_to_collection.php', { sets: setsToAdd })
            .then(response => {
                if (response.data.success) {
                    //alert('Sets added to collection!');
                    setSubmittedSets(true);
                    setSelectedSets({}); // Clear the selection
                    
                    // Remove added sets from sets
                    setSets(prevSets => 
                        prevSets.filter(set => !selectedSets[set.set_num])
                    );
                } else {
                    alert('Failed to add sets to collection.');
                }
            })
            .catch(error => console.error('Error adding sets to collection:', error));
    };
    
    const goBack = () => {
        navigate('/themes');
    };

    const handleImageError = (e) => {
        e.target.src = '/images/lego_piece_questionmark.png'; // Set fallback image path
    };

    return (
        <div>
            {subThemes.length > 0 && (
                <button onClick={goBack} className="back-button">Return to themes</button>
            )}
            {subThemes.length > 0 && (
                <>
                    <div className="theme-header">Sub-Themes</div>
                    <div className="themes-list-container">
                        {subThemes.map(theme => (
                            <button key={theme.id} className="theme-button" onClick={() => handleThemeClick(theme.id)}>
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
            {!subThemes.length && (
                <button onClick={goBack} className="back-button">Return to themes</button>
            )}
            <div className="theme-header">Sets</div>
            {(Object.keys(selectedSets).filter(setNum => selectedSets[setNum]).length > 0 || submittedSets) && (
                <button onClick={addToCollection} className="add-to-collection-button">
                    {submittedSets ? <FontAwesomeIcon icon="thumbs-up" style={{ marginRight: '8px' }} /> : <FontAwesomeIcon icon="plus" style={{ marginRight: '8px' }} />}
                    {submittedSets ? 'Successfully Added Sets!' : 'Add To Collection'}
                </button>
            )}
            <div className="sets-list-container">
                {sets.map(set => (
                    <div
                        key={set.set_num}
                        className={`set-card ${selectedSets[set.set_num] ? 'selected' : ''}`}
                        onClick={() => toggleSelectSet(set.set_num)}
                    >
                        <img 
                            src={set.img_url} 
                            alt={set.name} 
                            className="set-image" 
                            onError={handleImageError}
                            loading="lazy"
                        />




                        <div className="set-name">{set.name} ({set.year})</div>
                        <div className="set-num">
                            {selectedSets[set.set_num] !== undefined ? (
                                <div className="quantity-controls">
                                    <button
                                        className="quantity-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(set.set_num, Math.max(1, selectedSets[set.set_num] - 1));
                                        }}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="text"
                                        className="quantity-input"
                                        value={selectedSets[set.set_num]}
                                        onChange={(e) => {
                                            const quantity = parseInt(e.target.value, 10);
                                            if (!isNaN(quantity) && quantity > 0) {
                                                handleQuantityChange(set.set_num, quantity);
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        className="quantity-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(set.set_num, selectedSets[set.set_num] + 1);
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                set.set_num
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="loading">Loading more sets...</div>
                )}
            </div>
        </div>
    );
};

export default SubThemes;

