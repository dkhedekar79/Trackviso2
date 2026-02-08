import { useState, useEffect, useCallback } from 'react';

// Spotify API Configuration
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
// Ensure redirect URI has no trailing slash and matches exactly what's in Spotify Dashboard
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}/callback`.replace(/\/$/, '')
  : '';
const SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

// Lofi playlist ID (Chill Lofi Beats - a popular Spotify playlist)
const DEFAULT_LOFI_PLAYLIST_ID = '37i9dQZF1DX4WYpdgoIcn6'; // Lofi Hip Hop

export const useSpotify = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing token in localStorage on mount
  useEffect(() => {
    const loadToken = () => {
      const storedToken = localStorage.getItem('spotify_access_token');
      const tokenExpiry = localStorage.getItem('spotify_token_expiry');
      
      if (storedToken && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
        console.log('Loading Spotify token from localStorage');
        setAccessToken(storedToken);
      } else {
        // Clear expired token
        if (storedToken) {
          console.log('Spotify token expired, clearing...');
        }
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
    };

    loadToken();
    
    // Also listen for storage events in case token is saved from another tab/window
    const handleStorageChange = (e) => {
      if (e.key === 'spotify_access_token' && e.newValue) {
        console.log('Spotify token updated from storage event');
        loadToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically in case we're on the same page (storage events don't fire for same tab)
    // Reduced frequency to avoid performance issues
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken && !accessToken) {
        loadToken();
      }
    }, 2000); // Check every 2 seconds instead of 100ms
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [accessToken]);

  // Initialize Spotify Web Playback SDK
  const initializePlayer = useCallback((token) => {
    if (!token || !window.Spotify) return;

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Trackviso Ambient Player',
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5
    });

    // Error handling
    spotifyPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Spotify initialization error:', message);
      setError(message);
    });

    spotifyPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Spotify authentication error:', message);
      setError(message);
      handleLogout();
    });

    spotifyPlayer.addListener('account_error', ({ message }) => {
      console.error('Spotify account error:', message);
      setError(message);
    });

    // Playback state updates
    spotifyPlayer.addListener('player_state_changed', (state) => {
      if (!state) return;
      setIsPlaying(!state.paused);
      setCurrentTrack(state.track_window.current_track);
    });

    // Ready
    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('Spotify player ready with device ID:', device_id);
      setDeviceId(device_id);
      setPlayer(spotifyPlayer);
    });

    // Not ready
    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('Spotify device has gone offline:', device_id);
    });

    spotifyPlayer.connect();
  }, []);

  // Load Spotify Web Playback SDK script
  useEffect(() => {
    if (!window.Spotify && accessToken) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer(accessToken);
      };
    } else if (window.Spotify && accessToken && !player) {
      initializePlayer(accessToken);
    }
  }, [accessToken, initializePlayer, player]);

  // Note: Token extraction is now handled in SpotifyCallback.jsx
  // This useEffect is kept for backward compatibility but shouldn't be needed
  // since the callback page handles it before redirecting

  const handleLogin = () => {
    if (!CLIENT_ID) {
      setError('Spotify Client ID not configured. Please add VITE_SPOTIFY_CLIENT_ID to your .env file.');
      return;
    }

    // Ensure redirect URI doesn't have trailing slash
    const cleanRedirectUri = REDIRECT_URI.replace(/\/$/, '');
    
    // Log the redirect URI for debugging
    console.log('=== Spotify Authorization Debug ===');
    console.log('Client ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 10)}...` : 'MISSING');
    console.log('Redirect URI (clean):', cleanRedirectUri);
    console.log('Redirect URI (encoded):', encodeURIComponent(cleanRedirectUri));
    console.log('Scopes:', SCOPES);
    console.log('Response Type: token (Implicit Grant Flow)');
    console.log('');
    console.log('⚠️ Make sure this EXACT URL is added in your Spotify Dashboard:');
    console.log('   ', cleanRedirectUri);
    console.log('');
    console.log('Steps:');
    console.log('1. Go to https://developer.spotify.com/dashboard');
    console.log('2. Click on your app');
    console.log('3. Click "Edit Settings"');
    console.log('4. Under "Redirect URIs", add:', cleanRedirectUri);
    console.log('5. Make sure there are NO trailing slashes');
    console.log('6. Click "Add" and then "Save"');
    console.log('===================================');

    // Construct the authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(cleanRedirectUri)}&scope=${encodeURIComponent(SCOPES)}&show_dialog=true`;
    
    console.log('Authorization URL:', authUrl);
    console.log('Redirecting to Spotify...');
    
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    setAccessToken(null);
    setDeviceId(null);
    setPlayer(null);
    setIsPlaying(false);
    setCurrentTrack(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    
    if (player) {
      player.disconnect();
    }
  };

  const playLofiPlaylist = async () => {
    if (!accessToken || !deviceId) {
      setError('Not connected to Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${DEFAULT_LOFI_PLAYLIST_ID}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to play playlist');
      }

      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing playlist:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.resume();
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setError(err.message);
    }
  };

  const searchAndPlay = async (query) => {
    if (!accessToken || !deviceId) {
      setError('Not connected to Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search for tracks
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }

      const searchData = await searchResponse.json();
      const track = searchData.tracks.items[0];

      if (!track) {
        throw new Error('No tracks found');
      }

      // Play the track
      const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [track.uri],
        }),
      });

      if (!playResponse.ok) {
        throw new Error('Failed to play track');
      }

      setIsPlaying(true);
    } catch (err) {
      console.error('Error searching and playing:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Consider connected if we have an access token (deviceId will be set when player is ready)
  const isConnected = !!accessToken;

  return {
    accessToken,
    deviceId,
    isConnected,
    isPlaying,
    currentTrack,
    isLoading,
    error,
    handleLogin,
    handleLogout,
    playLofiPlaylist,
    togglePlayback,
    searchAndPlay,
  };
};

