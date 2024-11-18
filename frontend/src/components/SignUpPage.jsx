import React, { useState } from 'react';
import styles from './SignUpPage.module.css';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addToLocalStorage = async () => {
    try {
      const response = await fetch('http://localhost:5000/static/dataJson.json');
      if (!response.ok) {
        throw new Error("Fetch json error");
      }
      const result = await response.json();
      console.log(result);
      for (const key in result) {
        localStorage.setItem(key, JSON.stringify(result[key]));
      }

      console.log("All data in localStorage");
    } catch (error) {
      console.error("Load json error:", error);
      alert("Add to localstorage failed");
    }
};

  const handleSubmit = async(e) => {
    e.preventDefault();
    await addToLocalStorage();
    try{
      const request = {
        email: email,
        password: password,
        name: name
      }
      const formData = new URLSearchParams(); 
      for (const key in request) {
        formData.append(key, request[key]);
      }
      console.log(formData);
      const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString() 
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (data.result_code === 200) {
        console.log('Sign up submitted', { email, name, password });
        console.log('Signup successfully');
        localStorage.setItem('email', email);
        navigate('/search'); 
      } else {
        console.log('Sign up failed');
        setError(data.message || 'Sign up failed. Please try again.');
      }
    }catch(err){
        setError('An error occurred. Please try again later.');
        console.error('Sign up error:', err);
    }finally{
        setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleClick = () => {
      navigate('/login');
  }


  return (
    <div className={styles.signupPage}>
      <header className={styles.header}>
        <div className={styles.logo}>eCom platform</div>
        <nav>
          <a href="#" className={styles.loginLink} onClick={handleClick} >Log in</a>
        </nav>
      </header>
      <main className={styles.main}>
        <div className={styles.backgroundImage}></div>
        <form className={styles.signupForm} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle} >Sign up</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />
          {/* <button type="submit" className={styles.submitButton}>Sign up</button> */}
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Sign up'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SignUpPage;