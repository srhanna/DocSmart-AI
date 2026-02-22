import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './index.css';

function HomePage() {
    return (
        <div className="homepage">
            <Navbar />
            <main>
                <h1>Welcome to DocSmart-AI</h1>
                <p>Your intelligent documentation assistant.</p>
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;