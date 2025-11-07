
// // src/components/PWAInstallPrompt.jsx
// import { useState, useEffect } from 'react';

// export default function PWAInstallPrompt() {
//     const [deferredPrompt, setDeferredPrompt] = useState(null);
//     const [showPrompt, setShowPrompt] = useState(false);
//     const [isIOS, setIsIOS] = useState(false);
//     const [isStandalone, setIsStandalone] = useState(false);
//     const [dismissed, setDismissed] = useState(false);

//     useEffect(() => {
//         // Check if user is on iOS
//         const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
//         setIsIOS(isIos);

//         // Check if app is already installed
//         const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
//         setIsStandalone(isInStandaloneMode);

//         // Check if user previously dismissed the prompt
//         const wasDismissed = localStorage.getItem('pwaPromptDismissed');
//         if (wasDismissed) {
//             setDismissed(true);
//         }

//         const handler = (e) => {
//             e.preventDefault();
//             setDeferredPrompt(e);
//             // Only show if not dismissed and not in standalone mode
//             if (!dismissed && !isInStandaloneMode) {
//                 setShowPrompt(true);
//             }
//         };

//         window.addEventListener('beforeinstallprompt', handler);

//         return () => {
//             window.removeEventListener('beforeinstallprompt', handler);
//         };
//     }, [dismissed]);

//     const installApp = async () => {
//         if (!deferredPrompt) return;

//         try {
//             deferredPrompt.prompt();
//             const { outcome } = await deferredPrompt.userChoice;

//             console.log('📱 Installation outcome:', outcome);

//             if (outcome === 'accepted') {
//                 console.log('✅ PWA installed successfully');
//                 // Hide prompt after successful installation
//                 setShowPrompt(false);
//                 setDismissed(true);
//                 localStorage.setItem('pwaPromptDismissed', 'true');
//             }

//             setDeferredPrompt(null);
//         } catch (error) {
//             console.error('❌ Installation failed:', error);
//         }
//     };

//     const dismissPrompt = () => {
//         console.log('❌ Prompt dismissed by user');
//         setShowPrompt(false);
//         setDismissed(true);
//         localStorage.setItem('pwaPromptDismissed', 'true');
//     };

//     const dismissTemporarily = () => {
//         console.log('⏸️ Prompt dismissed temporarily');
//         setShowPrompt(false);
//         // Show again after 24 hours
//         setTimeout(() => {
//             setDismissed(false);
//             localStorage.removeItem('pwaPromptDismissed');
//         }, 24 * 60 * 60 * 1000);
//     };

//     // Don't show if:
//     // - Already installed
//     // - User dismissed permanently
//     // - On iOS (we'll show different instructions)
//     if (isStandalone || dismissed) {
//         return null;
//     }

//     // For iOS, show a different prompt that doesn't rely on beforeinstallprompt
//     if (isIOS && !showPrompt) {
//         return (
//             <div style={{
//                 position: 'fixed',
//                 bottom: '20px',
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 color: 'white',
//                 padding: '16px 20px',
//                 borderRadius: '12px',
//                 boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
//                 zIndex: 10000,
//                 maxWidth: '400px',
//                 width: '90%',
//                 textAlign: 'center'
//             }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
//                     <div style={{
//                         width: '48px',
//                         height: '48px',
//                         background: 'rgba(255,255,255,0.2)',
//                         borderRadius: '12px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         marginRight: '12px',
//                         fontSize: '20px'
//                     }}>
//                         📱
//                     </div>
//                     <div style={{ textAlign: 'left' }}>
//                         <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Add to Home Screen</h3>
//                         <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>For better experience</p>
//                     </div>
//                 </div>

//                 <div style={{
//                     background: 'rgba(255,255,255,0.1)',
//                     padding: '10px',
//                     borderRadius: '8px',
//                     margin: '10px 0',
//                     fontSize: '13px',
//                     lineHeight: '1.4'
//                 }}>
//                     <div style={{ marginBottom: '8px' }}>
//                         <strong>To install:</strong>
//                     </div>
//                     <div>1. Tap the <strong>Share</strong> button 📤</div>
//                     <div>2. Scroll down and tap <strong>"Add to Home Screen"</strong></div>
//                     <div>3. Tap <strong>"Add"</strong> to confirm</div>
//                 </div>

//                 <button
//                     onClick={dismissPrompt}
//                     style={{
//                         padding: '10px 20px',
//                         background: 'rgba(255,255,255,0.2)',
//                         color: 'white',
//                         border: '1px solid rgba(255,255,255,0.3)',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontSize: '14px',
//                         width: '100%'
//                     }}
//                 >
//                     Got It, Thanks!
//                 </button>
//             </div>
//         );
//     }

//     // Temporary debug version - add this to see what's happening
//     useEffect(() => {
//         console.log('🔍 PWA Debug Info:');
//         console.log(' - isIOS:', /iPad|iPhone|iPod/.test(navigator.userAgent));
//         console.log(' - isStandalone:', window.matchMedia('(display-mode: standalone)').matches);
//         console.log(' - beforeinstallprompt supported:', 'beforeinstallprompt' in window);
//         console.log(' - UserAgent:', navigator.userAgent);
//     }, []);

//     // For Android/Chrome - show the install prompt
//     if (!showPrompt) return null;

//     return (
//         <div style={{
//             position: 'fixed',
//             bottom: '20px',
//             left: '50%',
//             transform: 'translateX(-50%)',
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             color: 'white',
//             padding: '16px 20px',
//             borderRadius: '12px',
//             boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
//             zIndex: 10000,
//             maxWidth: '400px',
//             width: '90%',
//             textAlign: 'center'
//         }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
//                 <div style={{
//                     width: '48px',
//                     height: '48px',
//                     background: 'rgba(255,255,255,0.2)',
//                     borderRadius: '12px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     marginRight: '12px',
//                     fontSize: '20px'
//                 }}>
//                     📱
//                 </div>
//                 <div style={{ textAlign: 'left' }}>
//                     <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Install Nirmaan App</h3>
//                     <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Better experience • Quick access</p>
//                 </div>
//             </div>

//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
//                 <button
//                     onClick={dismissTemporarily}
//                     style={{
//                         padding: '10px 16px',
//                         background: 'rgba(255,255,255,0.2)',
//                         color: 'white',
//                         border: '1px solid rgba(255,255,255,0.3)',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontSize: '14px',
//                         flex: 1
//                     }}
//                 >
//                     Later
//                 </button>
//                 <button
//                     onClick={installApp}
//                     style={{
//                         padding: '10px 20px',
//                         background: 'white',
//                         color: '#667eea',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontWeight: 'bold',
//                         fontSize: '14px',
//                         flex: 1
//                     }}
//                 >
//                     Install Now
//                 </button>
//                 <button
//                     onClick={dismissPrompt}
//                     style={{
//                         padding: '10px 8px',
//                         background: 'transparent',
//                         color: 'rgba(255,255,255,0.7)',
//                         border: 'none',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontSize: '20px',
//                         width: '40px'
//                     }}
//                     title="Don't show again"
//                 >
//                     ✕
//                 </button>
//             </div>
//         </div>
//     );
// }

// src/components/PWAInstallPrompt.jsx
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [supportsPWA, setSupportsPWA] = useState(false);

    useEffect(() => {
        // Check device type
        const userAgent = navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isMobileDevice = isIos || isAndroid;

        setIsIOS(isIos);
        setIsMobile(isMobileDevice);

        // Check if app is already installed
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(isInStandaloneMode);

        // Check if user previously dismissed the prompt
        const wasDismissed = localStorage.getItem('pwaPromptDismissed');
        if (wasDismissed) {
            setDismissed(true);
        }

        // Check PWA support
        const checkPWASupport = () => {
            // Check if we're in a supporting environment
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const hasServiceWorker = 'serviceWorker' in navigator;
            const hasManifest = document.querySelector('link[rel="manifest"]') !== null;

            // For development, show prompt anyway for testing
            const shouldShow = isMobileDevice && hasServiceWorker && hasManifest;

            setSupportsPWA(shouldShow);

            if (shouldShow && !dismissed && !isInStandaloneMode) {
                // Show prompt after a delay for better UX
                setTimeout(() => {
                    setShowPrompt(true);
                }, 3000);
            }
        };

        // Standard PWA install prompt (for Chrome/Android)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setSupportsPWA(true);
            if (!dismissed && !isInStandaloneMode) {
                setShowPrompt(true);
            }
        };

        // Check initial support
        checkPWASupport();

        // Add event listener for browsers that support beforeinstallprompt
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [dismissed]);

    const installApp = async () => {
        if (deferredPrompt) {
            // Standard PWA installation flow
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                console.log('📱 Installation outcome:', outcome);

                if (outcome === 'accepted') {
                    // console.log('✅ PWA installed successfully');
                    setShowPrompt(false);
                    setDismissed(true);
                    localStorage.setItem('pwaPromptDismissed', 'true');
                }

                setDeferredPrompt(null);
            } catch (error) {
                console.error('❌ Installation failed:', error);
            }
        } else {
            // Fallback: show instructions
            console.log('ℹ️ Showing installation instructions');
            // The prompt will show instructions based on the device
        }
    };

    const dismissPrompt = () => {
        // console.log('❌ Prompt dismissed by user');
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwaPromptDismissed', 'true');
    };

    const dismissTemporarily = () => {
        // console.log('⏸️ Prompt dismissed temporarily');
        setShowPrompt(false);
        // Show again after 7 days instead of 24 hours
        setTimeout(() => {
            setDismissed(false);
            localStorage.removeItem('pwaPromptDismissed');
        }, 60 * 60 * 1000);
    };

    // Don't show if already installed or permanently dismissed
    if (isStandalone || dismissed) {
        return null;
    }

    // Don't show on desktop (unless we're in development)
    if (!isMobile && process.env.NODE_ENV === 'production') {
        return null;
    }

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 10000,
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{
                    width: '52px',
                    height: '52px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    fontSize: '22px',
                    backdropFilter: 'blur(10px)'
                }}>
                    📱
                </div>
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                        Install Nirmaan App
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                        Better experience • Quick access • Offline support
                    </p>
                </div>
            </div>

            {/* Installation Instructions */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '14px',
                borderRadius: '10px',
                margin: '16px 0',
                fontSize: '14px',
                lineHeight: '1.5',
                textAlign: 'left',
                backdropFilter: 'blur(5px)'
            }}>
                {isIOS ? (
                    <div>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>📲 To install on iOS:</div>
                        <div>1. Tap the <strong>Share</strong> button <span style={{ fontSize: '16px' }}>📤</span></div>
                        <div>2. Scroll and tap <strong>"Add to Home Screen"</strong></div>
                        <div>3. Tap <strong>"Add"</strong> to confirm</div>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>📲 To install on Android/Chrome:</div>
                        <div>1. Tap the <strong>Menu</strong> button <span style={{ fontSize: '16px' }}>⋮</span></div>
                        <div>2. Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong></div>
                        <div>3. Confirm the installation</div>
                        {deferredPrompt && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', textAlign: 'center' }}>
                                <strong>Or use the "Install Now" button below!</strong>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                    onClick={dismissTemporarily}
                    style={{
                        padding: '12px 18px',
                        background: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1,
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                >
                    Later
                </button>

                {deferredPrompt && (
                    <button
                        onClick={installApp}
                        style={{
                            padding: '12px 18px',
                            background: 'white',
                            color: '#667eea',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            flex: 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                        Install Now
                    </button>
                )}

                <button
                    onClick={dismissPrompt}
                    style={{
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        width: '50px',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    title="Don't show again"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}