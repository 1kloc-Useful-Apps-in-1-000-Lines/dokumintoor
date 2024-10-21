import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { currentUser, login } = useAuth(); // Use currentUser from AuthProvider

    // If user is already logged in, redirect to the dashboard
    useEffect(() => {
        if (currentUser) {
            navigate('/'); // Redirect to dashboard if logged in
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password); // Login the user
            navigate('/'); // Redirect to the dashboard after login
        } catch (error) {
            setError('Failed to sign in. Please check your credentials.');
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-background">
            <h2 className="text-2xl mb-4 text-primary dark:text-white">Login</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="w-80 space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 border rounded"
                />
                <button type="submit" className="w-full bg-primary text-white py-2 rounded">
                    Login
                </button>
            </form>
            <p className="mt-4">
                Don’t have an account?{' '}
                <Link to="/signup" className="text-blue-500">Sign up here</Link>
            </p>
        </div>
    );
};

export default Login;
