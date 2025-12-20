import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL hash
    console.log('=== Spotify Callback Debug ===');
    console.log('Full URL:', window.location.href);
    console.log('URL Hash:', window.location.hash);
    
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((acc, item) => {
        const parts = item.split('=');
        if (parts.length === 2) {
          acc[parts[0]] = decodeURIComponent(parts[1]);
        }
        return acc;
      }, {});
    
    console.log('Parsed hash:', hash);

    if (hash.access_token) {
      const expiresIn = parseInt(hash.expires_in) * 1000; // Convert to milliseconds
      const expiryTime = new Date().getTime() + expiresIn;
      
      // Save token to localStorage
      localStorage.setItem('spotify_access_token', hash.access_token);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      
      console.log('Spotify token saved successfully');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Trigger a storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'spotify_access_token',
        newValue: hash.access_token,
        storageArea: localStorage
      }));
      
      // Redirect after saving token
      setTimeout(() => {
        navigate('/study', { replace: true });
      }, 200); // Reduced delay since we're dispatching storage event
    } else {
      // No token found, check for errors
      if (hash.error) {
        const errorDescription = hash.error_description 
          ? decodeURIComponent(hash.error_description) 
          : 'Unknown error';
        
        console.error('Spotify auth error:', hash.error);
        console.error('Error description:', errorDescription);
        
        // Store error in localStorage so Study page can display it
        localStorage.setItem('spotify_auth_error', JSON.stringify({
          error: hash.error,
          description: errorDescription,
          timestamp: Date.now()
        }));
        
        // If it's unsupported_response_type, provide helpful message
        if (hash.error === 'unsupported_response_type') {
          console.error('⚠️ This usually means:');
          console.error('1. The redirect URI is not configured in Spotify Dashboard');
          console.error('2. Go to https://developer.spotify.com/dashboard');
          console.error('3. Select your app → Edit Settings');
          console.error(`4. Add this EXACT redirect URI: ${window.location.origin}/callback`);
          console.error('5. Make sure there are no trailing slashes or differences');
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

