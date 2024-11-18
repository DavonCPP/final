import React, { useState } from 'react';
import styles from './SignUpPage.module.css';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

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
        console.log('Login submitted', { email, password });
        setError('');
        setIsLoading(true);

        try{
          const request = {
            email: email,
            password: password
          }
          const formData = new URLSearchParams(); 
          for (const key in request) {
            formData.append(key, request[key]);
          }
          console.log(formData);
          const response = await fetch('http://localhost:5000/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString() 
          });

          const data = await response.json();
          console.log('Login response:', data);

          if (data.result_code === 200) {
            console.log('Login successfully');
            localStorage.setItem('email', email);
            navigate('/search'); 
          } else {
            console.log('Login failed');
            setError(data.message || 'Login failed. Please try again.');
          }
        }catch(err){
            setError('An error occurred. Please try again later.');
            console.error('Login error:', err);
        }finally{
            setIsLoading(false);
        }
    };

    const handleClick = () => {
      navigate('/signup');
    }

    return(
        <div className={styles.signupPage}>
            <header className={styles.header}>
                <div className={styles.logo}>eCom platform</div>
                <nav>
                  <a href="#" className={styles.loginLink} onClick={handleClick}>Sign up </a>
                </nav>
            </header>
            <main className={styles.main}>
                <div className={styles.backgroundImage}></div>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Log in</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    {error && <p className={styles.errorMessage}>{error}</p>} 
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </main>
        </div>
    );

}

export default LoginPage;
