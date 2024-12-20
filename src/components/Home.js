import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import './Styles.css';
import './Sets.css';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Home = () => {
    const [popularThemes, setPopularThemes] = useState([]);
    const [userCollections, setUserCollections] = useState([]);
    const [recentSets, setRecentSets] = useState([]);
    const [hasRecentSets, setHasRecentSets] = useState(false);
    const [selectedSets, setSelectedSets] = useState({});
    const [submittedSets, setSubmittedSets] = useState({});
    const [showAllRecentSets, setShowAllRecentSets] = useState(false);
    const [loadedImages, setLoadedImages] = useState({});
    const [loadedThemeImages, setLoadedThemeImages] = useState({});
    const navigate = useNavigate();
    const { user } = useAuth();

    const INITIAL_SETS_TO_SHOW = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [themesResponse, collectionsResponse, recentSetsResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/get_popular_themes.php`),
                    axios.get(`${process.env.REACT_APP_API_URL}/get_random_collections.php`),
                    axios.get(`${process.env.REACT_APP_API_URL}/get_recent_set_additions.php`)
                ]);

                setPopularThemes(themesResponse.data);
                setUserCollections(collectionsResponse.data);
                setRecentSets(recentSetsResponse.data.sets);
                setHasRecentSets(recentSetsResponse.data.hasRecentSets);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleThemeClick = (themeId) => {
        navigate(`/themes/${themeId}`);
    };

    const toggleSelectSet = (setNum) => {
        if (user) {
            setSelectedSets(prevSelectedSets =>
                prevSelectedSets[setNum]
                    ? { ...prevSelectedSets, [setNum]: undefined }
                    : { ...prevSelectedSets, [setNum]: 1 }
            );
        }
    };

    const handleQuantityChange = (setNum, quantity) => {
        setSelectedSets(prevSelectedSets => ({
            ...prevSelectedSets,
            [setNum]: quantity
        }));
    };

    const addToCollection = (setNum, quantity) => {
        const setToAdd = [{ setNum, quantity }];
    
        axios.post(`${process.env.REACT_APP_API_URL}/add_to_collection.php`, { sets: setToAdd })
            .then(response => {
                if (response.data.success) {
                    setSubmittedSets(prev => ({ ...prev, [setNum]: true }));
                    setSelectedSets(prev => {
                        const newSelected = { ...prev };
                        delete newSelected[setNum];
                        return newSelected;
                    });
                } else {
                    alert('Failed to add set to collection.');
                }
            })
            .catch(error => console.error('Error adding set to collection:', error));
    };

    const addToWishlist = (setNum) => {
        const setsToAdd = [{ setNum, quantity: selectedSets[setNum] }];
    
        axios.post(`${process.env.REACT_APP_API_URL}/add_to_wishlist.php`, { sets: setsToAdd })
            .then(response => {
                if (response.data.success) {
                    setSelectedSets(prev => {
                        const newSelected = { ...prev };
                        delete newSelected[setNum];
                        return newSelected;
                    });
                } else {
                    alert('Failed to add set to wishlist.');
                }
            })
            .catch(error => console.error('Error adding set to wishlist:', error));
    };

    const handleImageLoad = (setNum) => {
        setLoadedImages(prev => ({ ...prev, [setNum]: true }));
    };

    const handleThemeImageLoad = (themeId) => {
        setLoadedThemeImages(prev => ({ ...prev, [themeId]: true }));
    };

    const displayedSets = showAllRecentSets ? recentSets : recentSets.slice(0, INITIAL_SETS_TO_SHOW);
    const hasMoreSets = recentSets.length > INITIAL_SETS_TO_SHOW;

    return (
        <div className="home-container">
            <div className="home-header">
                Keep track of your LEGO&copy; collection.
            </div>
            <div className="home-subtext">
                It's time to get organized and take control of your LEGO collection. Our platform helps you catalog, manage, and share your sets with friends.
                <br /><br />
                No more duplicates, no more forgotten favorites!
            </div>

            <div className="home-footer">
                Not affiliated with the LEGO&copy; Group.
            </div>

            <div className="theme-header">Recently Added Sets</div>
            <div className="theme-details">Discover the newest LEGO sets, freshly added to our database and ready to join your collection.</div>
            <div className="sets-list-container">
                {displayedSets.map(set => (
                    <div
                        key={set.set_num}
                        className={`set-card ${selectedSets[set.set_num] ? 'selected' : ''}`}
                        onClick={() => user && toggleSelectSet(set.set_num)}
                    >
                        <div className="set-image-container">
                            {!loadedImages[set.set_num] && (
                                <Skeleton height={100} />
                            )}
                            <img
                                src={set.img_url || '/images/lego_piece_questionmark.png'}
                                alt={set.name}
                                className={`set-image ${loadedImages[set.set_num] ? 'loaded' : 'loading'}`}
                                onError={(e) => e.target.src = '/images/lego_piece_questionmark.png'}
                                onLoad={() => handleImageLoad(set.set_num)}
                                style={{ display: loadedImages[set.set_num] ? 'block' : 'none' }}
                            />
                        </div>
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
                                    <div className="button-container">
                                        <button
                                            className="add-to-collection-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCollection(set.set_num, selectedSets[set.set_num]);
                                            }}
                                        >
                                            {submittedSets[set.set_num] ? (
                                                <>
                                                    <FontAwesomeIcon icon="thumbs-up" style={{ marginRight: '8px' }} />
                                                    Added!
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon="plus" style={{ marginRight: '8px' }} />
                                                    Add To Collection
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="wishlist-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToWishlist(set.set_num);
                                            }}
                                        >
                                            <FontAwesomeIcon icon="plus" style={{ marginRight: '8px' }} />
                                            Add to Wishlist
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                set.set_num
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {hasMoreSets && (
                <button 
                    className="show-more-button"
                    onClick={() => setShowAllRecentSets(!showAllRecentSets)}
                >
                    {showAllRecentSets ? (
                        <>
                            Show Less <FontAwesomeIcon icon="chevron-up" />
                        </>
                    ) : (
                        <>
                            Show More <FontAwesomeIcon icon="chevron-down" />
                        </>
                    )}
                </button>
            )}

            {/* Existing PopularThemes section */}
            <div className="popular-themes-container">
                <div className="theme-header">Popular Themes</div>
                <div className="theme-details"><span>See what types of sets other users love having in their collection.</span></div>
                <div className="themes-list-container">
                    {popularThemes.map(theme => (
                        <div key={theme.id} className="theme-card" onClick={() => handleThemeClick(theme.id)}>
                            <div className="theme-image-container">
                                {!loadedThemeImages[theme.id] && (
                                    <Skeleton height={150} />
                                )}
                                <img 
                                    src={theme.theme_image_url || '/images/lego_piece_questionmark.png'} 
                                    alt={theme.name} 
                                    className={`theme-image ${loadedThemeImages[theme.id] ? 'loaded' : 'loading'}`}
                                    onError={(e) => e.target.src = '/images/lego_piece_questionmark.png'}
                                    onLoad={() => handleThemeImageLoad(theme.id)}
                                    style={{ display: loadedThemeImages[theme.id] ? 'block' : 'none' }}
                                />
                            </div>
                            <div className="theme-name">
                                <strong>{theme.name}</strong>
                                <div className="theme-count">
                                    {theme.collection_count} sets in collections
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="explore-themes-container">
                    <button className="explore-themes-btn">
                        <Link to="/themes" className="explore-themes-link">
                            Explore other themes!
                        </Link>
                    </button>
                </div>
            </div>

            {/* Existing UserCollections section */}
            <div className="user-collections-container">
                <div className="user-collections-header">User Collections</div>
                <div className="user-collections-desc">Randomly selected user's collections</div>
                <div className="user-collections-list">
                    {userCollections.map(user => (
                        <div key={user.user_id} className="user-card">
                            <Link to={`/collection/${user.user_id}`} className="user-link">
                                <div className="user-image-container">
                                    <img 
                                        src={user.profile_picture ? `https://mybricklog.s3.us-east-2.amazonaws.com/profile-pictures/${user.profile_picture}` : '/images/lego_user.png'}
                                        alt="User Collection" 
                                        className="user-image" 
                                    />
                                </div>
                                <div className="user-name">{user.username}</div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;