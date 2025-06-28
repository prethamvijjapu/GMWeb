// src/Pages/LoginSignup.jsx
import axios from 'axios';
import { useContext, useRef, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const toggleMode = () => setIsLogin(prev => !prev);
  const togglePassword = () => setShowPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameRef.current?.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      if (isLogin) {
        // LOGIN
        const res = await axios.post('http://localhost:4000/login', { email, password });
        const { token, message } = res.data;
        alert(message || 'Login successful!');
        // persist and update global auth state
        login(token, message.replace(/^Hi, /, '').replace(/!$/, ''));
        navigate('/dashboard');
      } else {
        // SIGNUP
        const res = await axios.post('http://localhost:4000/signup', { name, email, password });
        alert(res.data.message || 'Signup successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Server error');
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
        <form onSubmit={handleSubmit}>
          <div className="loginsignupfields">
            {!isLogin && (
              <input type="text" placeholder="Your Name" ref={nameRef} required />
            )}
            <input type="email" placeholder="Email Address" ref={emailRef} required />
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                ref={passwordRef}
                required
              />
              <span className="password-toggle" onClick={togglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Continue'}
          </button>
        </form>
        <p className="loginsignup-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span onClick={toggleMode}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
        {!isLogin && (
          <div className="loginsignup-agree">
            <input type="checkbox" id="agree" required />
            <label htmlFor="agree">
              By continuing, I agree to Terms of Use & Privacy Policy
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
