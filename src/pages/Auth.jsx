import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password
                });
                if (error) throw error;
                alert('Проверьте вашу почту для подтверждения регистрации!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google'
            });
            if (error) throw error;
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🚀 ПромтМаркетплейс</h1>
                <p className="auth-subtitle">Делитесь промтами для нейросетей бесплатно</p>
                
                <form onSubmit={handleEmailAuth} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Загрузка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
                    </button>
                </form>

                <div className="divider">
                    <span>или</span>
                </div>

                <button onClick={handleGoogleSignIn} className="google-btn">
                    Войти через Google
                </button>

                <p className="toggle-auth">
                    {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)} 
                        className="toggle-btn"
                    >
                        {isSignUp ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;