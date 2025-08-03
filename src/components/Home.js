import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h2>Welcome to the To Do List App</h2>
        <p className="hero-text">
          A simple and efficient way to organize your tasks and boost your productivity.
        </p>
        <Link to="/register" className="cta-button">
          Sign Up Now
        </Link>
      </section>

      <section className="features-section">
        <h3>Key Features</h3>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h4>Easy Task Management</h4>
            <p>Create, edit, and organize your tasks with a user-friendly interface.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h4>Reminders</h4>
            <p>Set reminders for important tasks and never miss a deadline.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Progress Tracking</h4>
            <p>Monitor your productivity with visual progress indicators.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h3>Why Choose Our To Do List App?</h3>
        <p>
          Our To Do List application is designed with simplicity and efficiency in mind. 
          Whether you're a student, professional, or anyone looking to stay organized, 
          our app provides the tools you need to manage your tasks effectively.
        </p>
        <p>
          With a clean interface and intuitive features, you can focus on what matters most - 
          getting things done!
        </p>
      </section>
    </div>
  );
}

export default Home;