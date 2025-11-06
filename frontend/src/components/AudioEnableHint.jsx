// src/components/AudioEnableHint.jsx
import { useState, useEffect } from 'react';

export default function AudioEnableHint() {
    const [showHint, setShowHint] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 2000); // Hide after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!showHint) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            zIndex: 1000,
            opacity: 40,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
            🔔 Click anywhere to enable notification sounds
        </div>
    );
}