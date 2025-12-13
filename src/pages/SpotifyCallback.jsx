import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL hash
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((acc, item) => {
        const parts = item.split('=');
        acc[parts[0]] = decodeURIComponent(parts[1]);
        return acc;
      }, {});

    if (hash.access_token) {
      const expiresIn = parseInt(hash.expires_in) * 1000; // Convert to milliseconds
      const expiryTime = new Date().getTime() + expiresIn;
      
      // Save token to localStorage
      localStorage.setItem('spotify_access_token', hash.access_token);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      
      console.log('Spotify token saved successfully');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect after saving token
      setTimeout(() => {
        navigate('/study', { replace: true });
      }, 500); // Give it a bit more time to ensure localStorage is saved
    } else {
      // No token found, check for errors
      if (hash.error) {
        console.error('Spotify auth error:', hash.error);
        if (hash.error_description) {
          console.error('Error description:', decodeURIComponent(hash.error_description));
        }
      } else {
        console.error('No access token in callback');
      }
      // Redirect anyway
      setTimeout(() => {
        navigate('/study', { replace: true });
      }, 1000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p>Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;

