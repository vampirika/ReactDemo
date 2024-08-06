// src/components/PasswordProtected.tsx
import React, { useState } from 'react';

interface PasswordProtectedProps {
    correctPassword: string;
    children: React.ReactNode;
}

const PasswordProtected: React.FC<PasswordProtectedProps> = ({ correctPassword, children }) => {
    const [inputPassword, setInputPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputPassword === correctPassword) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div>
            {isAuthenticated ? (
                children
            ) : (
                <div>
                    <h2>Please Enter the Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='wrapper'>
                            <input
                                type="password"
                                value={inputPassword}
                                onChange={(e) => setInputPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                            <button className='button' type="submit">Submit</button>
                        </div>
                    </form>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default PasswordProtected;