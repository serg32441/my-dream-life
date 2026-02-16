import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const auth = getAuth();

    const handleGoogleSignIn = async () => {
        const googleProvider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // User signed in
            const user = result.user;
            console.log('Google User: ', user);
        } catch (error) {
            console.error('Error signing in with Google: ', error);
        }
    };

    const handleEmailSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // User signed up
            const user = userCredential.user;
            console.log('User signed up: ', user);
        } catch (error) {
            console.error('Error signing up with email: ', error);
        }
    };

    const handleEmailSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // User signed in
            const user = userCredential.user;
            console.log('User signed in: ', user);
        } catch (error) {
            console.error('Error signing in with email: ', error);
        }
    };

    return (
        <div>
            <h2>Authentication</h2>
            <button onClick={handleGoogleSignIn}>Sign in with Google</button>
            <hr />
            <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleEmailSignUp}>Sign Up</button>
            <button onClick={handleEmailSignIn}>Sign In</button>
        </div>
    );
};

export default Auth;