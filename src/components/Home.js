import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import './Styles.css';

const Home = () => {
    const navigate = useNavigate();

    const startCollection = () => {
        navigate('/themes'); // Adjust the route as per your routing structure
    };

    return (
        <div className="home-container">
            <div className="home-header">
                Keep track of your LEGO&copy; collection.
            </div>
            <div className="home-subtext">
            It's time to get organized and take control of your LEGO collection. Our platform helps you catalog, manage, and share your sets with friends.
            <br></br><br></br>
            No more duplicates, no more forgotten favorites!
            </div>
            <button onClick={startCollection} className="start-collection-button">
                Start your collection today
            </button>
            <div className="home-footer">
                Not affiliated with the LEGO&copy; Group.
            </div>
        </div>
    );
};

export default Home;
