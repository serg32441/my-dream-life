import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setError('Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignUp = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            
            if (error) throw error;
            console.log('User signed up:', data);
        } catch (error) {
            console.error('Error signing up with email:', error);
            setError('Failed to sign up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignIn = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            console.log('User signed in:', data);
        } catch (error) {
            console.error('Error signing in with email:', error);
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Authentication</h2>
            
            {error && <p className="error-message">{error}</p>}
            
            <button 
                onClick={handleGoogleSignIn} 
                disabled={loading}
                className="google-btn"
            >
                {loading ? 'Loading...' : 'Sign in with Google'}
            </button>
            
            <hr />
            
            <div className="form-group">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="input-field"
                />
            </div>
            
            <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="input-field"
                />
            </div>
            
            <div className="button-group">
                <button 
                    onClick={handleEmailSignUp} 
                    disabled={loading || !email || !password}
                    className="action-btn"
                >
                    Sign Up
                </button>
                <button 
                    onClick={handleEmailSignIn} 
                    disabled={loading || !email || !password}
                    className="action-btn"
                >
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default Auth;