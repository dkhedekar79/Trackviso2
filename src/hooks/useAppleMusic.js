import { useState, useEffect, useCallback } from 'react';

// Apple Music Configuration
const DEVELOPER_TOKEN = import.meta.env.VITE_APPLE_MUSIC_DEVELOPER_TOKEN || '';
const MUSICKIT_VERSION = '3.0.0';

export const useAppleMusic = () => {
  const [musicKitInstance, setMusicKitInstance] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const setupEventListeners = useCallback((music) => {
    // Playback state changes
    music.addEventListener('playbackStateDidChange', (event) => {
      setIsPlaying(event.state === 1); // 1 = playing, 0 = paused
    });

    // Now playing item changes
    music.addEventListener('nowPlayingItemDidChange', (event) => {
      if (event.item) {
        setCurrentTrack({
          name: event.item.title,
          artist: event.item.artistName,
          album: event.item.albumName,
          artwork: event.item.artworkURL,
        });
      } else {
        setCurrentTrack(null);
      }
    });

    // Playback time changes
    music.addEventListener('playbackTimeDidChange', () => {
      // Update UI if needed
    });
  }, []);

  const initializeMusicKit = useCallback(async () => {
    if (!window.MusicKit || !DEVELOPER_TOKEN) {
      setError('Apple Music Developer Token not configured. Please add VITE_APPLE_MUSIC_DEVELOPER_TOKEN to your .env file.');
      return;
    }

    try {
      const music = await window.MusicKit.configure({
        developerToken: DEVELOPER_TOKEN,
        app: {
          name: 'Trackviso',
          build: '1.0.0',
        },
      });

      setMusicKitInstance(music);

      // Check if already authorized
      if (music.isAuthorized) {
        setIsAuthorized(true);
        setupEventListeners(music);
        setIsPlaying(music.isPlaying);
        if (music.nowPlayingItem) {
          setCurrentTrack({
            name: music.nowPlayingItem.title,
            artist: music.nowPlayingItem.artistName,
            album: music.nowPlayingItem.albumName,
            artwork: music.nowPlayingItem.artworkURL,
          });
        }
      }
    } catch (err) {
      console.error('Error initializing MusicKit:', err);
      setError(err.message || 'Failed to initialize Apple Music');
    }
  }, [DEVELOPER_TOKEN, setupEventListeners]);

  // Load MusicKit JS script
  useEffect(() => {
    if (!window.MusicKit && DEVELOPER_TOKEN) {
      const script = document.createElement('script');
      script.src = `https://js-cdn.music.apple.com/musickit/v${MUSICKIT_VERSION}/musickit.js`;
      script.async = true;
      script.onload = () => {
        initializeMusicKit();
      };
      script.onerror = () => {
        setError('Failed to load Apple MusicKit library');
      };
      document.body.appendChild(script);
    } else if (window.MusicKit && DEVELOPER_TOKEN && !musicKitInstance) {
      initializeMusicKit();
    }

    return () => {
      if (musicKitInstance) {
        try {
          musicKitInstance.unauthorize();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [DEVELOPER_TOKEN, initializeMusicKit, musicKitInstance]);


  const handleLogin = useCallback(async () => {
    if (!musicKitInstance) {
      setError('Apple Music not initialized. Please check your developer token.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userToken = await musicKitInstance.authorize();
      if (userToken) {
        setIsAuthorized(true);
        setupEventListeners(musicKitInstance);
      }
    } catch (err) {
      console.error('Error authorizing Apple Music:', err);
      setError(err.message || 'Failed to authorize Apple Music');
    } finally {
      setIsLoading(false);
    }
  }, [musicKitInstance, setupEventListeners]);

  const handleLogout = useCallback(async () => {
    if (musicKitInstance) {
      try {
        await musicKitInstance.unauthorize();
        setIsAuthorized(false);
        setIsPlaying(false);
        setCurrentTrack(null);
      } catch (err) {
        console.error('Error logging out:', err);
      }
    }
  }, [musicKitInstance]);

  const playLofiPlaylist = useCallback(async () => {
    if (!musicKitInstance || !isAuthorized) {
      setError('Not connected to Apple Music');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search for a lofi playlist
      const searchResults = await musicKitInstance.api.search('lofi hip hop', {
        types: ['playlists'],
        limit: 1,
      });

      if (searchResults.playlists && searchResults.playlists.data.length > 0) {
        const playlist = searchResults.playlists.data[0];
        await musicKitInstance.setQueue({ playlist: playlist.id });
        await musicKitInstance.play();
        setIsPlaying(true);
      } else {
        throw new Error('No lofi playlists found');
      }
    } catch (err) {
      console.error('Error playing playlist:', err);
      setError(err.message || 'Failed to play playlist');
    } finally {
      setIsLoading(false);
    }
  }, [musicKitInstance, isAuthorized]);

  const togglePlayback = useCallback(async () => {
    if (!musicKitInstance || !isAuthorized) {
      setError('Not connected to Apple Music');
      return;
    }

    try {
      if (isPlaying) {
        await musicKitInstance.pause();
      } else {
        await musicKitInstance.play();
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setError(err.message || 'Failed to toggle playback');
    }
  }, [musicKitInstance, isAuthorized, isPlaying]);

  const searchAndPlay = useCallback(async (query) => {
    if (!musicKitInstance || !isAuthorized) {
      setError('Not connected to Apple Music');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search for tracks
      const searchResults = await musicKitInstance.api.search(query, {
        types: ['songs'],
        limit: 1,
      });

      if (searchResults.songs && searchResults.songs.data.length > 0) {
        const song = searchResults.songs.data[0];
        await musicKitInstance.setQueue({ song: song.id });
        await musicKitInstance.play();
        setIsPlaying(true);
      } else {
        throw new Error('No tracks found');
      }
    } catch (err) {
      console.error('Error searching and playing:', err);
      setError(err.message || 'Failed to search and play');
    } finally {
      setIsLoading(false);
    }
  }, [musicKitInstance, isAuthorized]);

  const isConnected = isAuthorized && !!musicKitInstance;

  return {
    musicKitInstance,
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

