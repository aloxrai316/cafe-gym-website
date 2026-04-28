import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiCoffee, FiActivity, FiCalendar, FiTruck, FiStar, FiArrowRight } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content container">
          <div className="hero-text">
            <span className="hero-badge">CAFE & GYM</span>
            <h1>Fuel Your Body,<br/><span className="gradient-text">Feed Your Soul</span></h1>
            <p>One platform for your fitness and food cravings. Order meals, manage gym membership, and more.</p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">
                <FiCoffee /> Order Now
              </Link>
              <Link to="/gym" className="btn btn-outline btn-lg">
                <FiActivity /> Join Gym
              </Link>
            </div>
            {!user && (
              <p className="hero-note">
                <Link to="/register">Create a free account</Link> to get started
              </p>
            )}
          </div>
          <div className="hero-visual">
            <div className="hero-card hero-card-cafe">
              <span className="hero-card-icon">☕</span>
              <h3>Fresh Cafe</h3>
              <p>20+ menu items</p>
            </div>
            <div className="hero-card hero-card-gym">
              <span className="hero-card-icon">💪</span>
              <h3>Modern Gym</h3>
              <p>Cardio & Training</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features container">
        <h2 className="section-title">What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{background:'rgba(233,69,96,0.1)', color:'var(--primary)'}}>
              <FiCoffee />
            </div>
            <h3>Digital Menu</h3>
            <p>Scan QR code at your table and order directly from your phone. No waiting!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'rgba(0,200,151,0.1)', color:'var(--green)'}}>
              <FiCalendar />
            </div>
            <h3>Table Reservations</h3>
            <p>Reserve your favorite table in advance with time slot booking and advance payment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'rgba(255,107,53,0.1)', color:'var(--orange)'}}>
              <FiTruck />
            </div>
            <h3>Home Delivery</h3>
            <p>Get your favorite food delivered to your doorstep. Track your order in real-time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'rgba(15,52,96,0.1)', color:'var(--secondary)'}}>
              <FiActivity />
            </div>
            <h3>Gym Membership</h3>
            <p>Monthly memberships with cardio add-on. Track attendance and get trainer support.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'rgba(255,193,7,0.1)', color:'var(--yellow)'}}>
              <FiStar />
            </div>
            <h3>Pre-Order</h3>
            <p>Pre-order your meal before arriving. 50% advance payment, food ready when you arrive.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'rgba(233,69,96,0.1)', color:'var(--primary)'}}>
              <FiArrowRight />
            </div>
            <h3>Quick Payments</h3>
            <p>Multiple payment options: Cash, Card, eSewa, Khalti. Fast and secure checkout.</p>
          </div>
        </div>
      </section>

      <section className="cta container">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Ready to get started?</h2>
            <p>Join hundreds of members enjoying our cafe and gym facilities.</p>
          </div>
          <Link to={user ? '/menu' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Browse Menu' : 'Sign Up Free'} <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
