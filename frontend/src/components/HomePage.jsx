import React from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import ChatWindow from './ChatBot';

const HomePage = () => {
  const navigate = useNavigate();
  const OPENAI_API_KEY = REACT_APP_OPENAI_API_KEY;
  const handleSignUpClick = () => {
    navigate('/signup');
  }

  const handleLoginClick = () => {
    navigate('/login');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Camera className={styles.icon} />
          <span className={styles.logoText}>ecoM</span>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>ecoM</h1>
          <p className={styles.description}>
            Powerful and efficient e-commerce platform designed to assist
            corporations and investors in managing ESG (Environmental,
            Social, Governance) reporting and metrics.
          </p>
          <div className={styles.buttonContainer}>
            <button className={styles.signUpButton} onClick={handleSignUpClick}>
              Sign Up
            </button>
            <button className={styles.loginButton} onClick={handleLoginClick}>
              Log In
            </button>
          </div>
        </div>
      </main>
      
      <ChatWindow apiKey={OPENAI_API_KEY} />
    </div>
  );
};

export default HomePage;