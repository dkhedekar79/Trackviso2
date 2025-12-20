import { useState, useEffect, useCallback, useRef } from 'react';

// YouTube API Configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';

// Predefined Lofi Playlist Queries
const LOFI_PLAYLISTS = [
  { id: 'lofi-hip-hop', name: 'Lofi Hip Hop', query: 'lofi hip hop music' },
  { id: 'lofi-study', name: 'Lofi Study Beats', query: 'lofi study beats' },
  { id: 'lofi-chill', name: 'Lofi Chill', query: 'lofi chill music' },
  { id: 'lofi-sleep', name: 'Lofi Sleep', query: 'lofi sleep music' },
  { id: 'lofi-jazz', name: 'Lofi Jazz', query: 'lofi jazz music' },
  { id: 'lofi-rain', name: 'Lofi Rain', query: 'lofi rain sounds' },
  { id: 'lofi-anime', name: 'Lofi Anime', query: 'lofi anime music' },
  { id: 'lofi-coffee', name: 'Lofi Coffee Shop', query: 'lofi coffee shop music' },
  { id: 'lofi-focus', name: 'Lofi Focus', query: 'lofi focus music' },
  { id: 'lofi-relax', name: 'Lofi Relax', query: 'lofi relax music' },
];

// Get most played playlists from localStorage
const getMostPlayedPlaylists = () => {
  try {
    const stored = localStorage.getItem('youtube_music_playlist_stats');
    if (!stored) return [];
    
    const stats = JSON.parse(stored);
    return Object.entries(stats)
      .map(([id, count]) => {
        const playlist = LOFI_PLAYLISTS.find(p => p.id === id);
        return playlist ? { ...playlist, playCount: count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);
  } catch (e) {
    return [];
  }
};

// Track playlist play
const trackPlaylistPlay = (playlistId) => {
  try {
    const stored = localStorage.getItem('youtube_music_playlist_stats') || '{}';
    const stats = JSON.parse(stored);
    stats[playlistId] = (stats[playlistId] || 0) + 1;
    localStorage.setItem('youtube_music_playlist_stats', JSON.stringify(stats));
  } catch (e) {
    console.error('Error tracking playlist play:', e);
  }
};

export const useYouTubeMusic = () => {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);
  const playerDivRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = YOUTUBE_IFRAME_API_URL;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else if (window.YT && window.YT.Player && !player) {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const initializePlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player) {
      setError('YouTube IFrame API not loaded');
      return;
    }

    // Create a hidden div for the player
    if (!playerDivRef.current) {
      const div = document.createElement('div');
      div.id = 'youtube-music-player';
      div.style.display = 'none';
      div.style.position = 'absolute';
      div.style.top = '-9999px';
      document.body.appendChild(div);
      playerDivRef.current = div;
    }

    try {
      const ytPlayer = new window.YT.Player('youtube-music-player', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            setPlayer(ytPlayer);
            playerRef.current = ytPlayer;
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2, YT.PlayerState.ENDED = 0
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            setError('Failed to play video');
          },
        },
      });
    } catch (err) {
      console.error('Error initializing YouTube player:', err);
      setError(err.message || 'Failed to initialize YouTube player');
    }
  }, [volume]);

  // Update volume when it changes
  useEffect(() => {
    if (player && isReady) {
      try {
        player.setVolume(volume);
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  }, [volume, player, isReady]);

  const searchVideo = useCallback(async (query) => {
    if (!YOUTUBE_API_KEY) {
      setError('YouTube API Key not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
      return null;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const thumbnail = video.snippet?.thumbnails?.default?.url || 
                         video.snippet?.thumbnails?.medium?.url || 
                         video.snippet?.thumbnails?.high?.url || 
                         null;
        return {
          videoId: video.id.videoId,
          title: video.snippet?.title || 'Unknown Title',
          channel: video.snippet?.channelTitle || 'Unknown Channel',
          thumbnail: thumbnail,
        };
      }
      return null;
    } catch (err) {
      console.error('Error searching YouTube:', err);
      setError(err.message || 'Failed to search YouTube');
      return null;
    }
  }, []);

  const playLofiPlaylist = useCallback(async (playlistId = 'lofi-hip-hop') => {
    if (!player || !isReady) {
      setError('YouTube player not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const playlist = LOFI_PLAYLISTS.find(p => p.id === playlistId) || LOFI_PLAYLISTS[0];
      
      // Search for a lofi music video
      const video = await searchVideo(playlist.query);
      if (video) {
        player.loadVideoById(video.videoId);
        setCurrentTrack({
          name: video.title,
          artist: video.channel,
          thumbnail: video.thumbnail,
          playlistId: playlist.id,
          playlistName: playlist.name,
        });
        setIsPlaying(true);
        
        // Track this playlist play
        trackPlaylistPlay(playlist.id);
      } else {
        throw new Error('No lofi music found');
      }
    } catch (err) {
      console.error('Error playing lofi:', err);
      setError(err.message || 'Failed to play lofi music');
    } finally {
      setIsLoading(false);
    }
  }, [player, isReady, searchVideo]);

  const getMostPlayedPlaylistsHook = useCallback(() => {
    return getMostPlayedPlaylists();
  }, []);

  const searchAndPlay = useCallback(async (query) => {
    if (!player || !isReady) {
      setError('YouTube player not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const video = await searchVideo(query);
      if (video) {
        player.loadVideoById(video.videoId);
        setCurrentTrack({
          name: video.title,
          artist: video.channel,
          thumbnail: video.thumbnail,
        });
        setIsPlaying(true);
      } else {
        throw new Error('No results found');
      }
    } catch (err) {
      console.error('Error searching and playing:', err);
      setError(err.message || 'Failed to search and play');
    } finally {
      setIsLoading(false);
    }
  }, [player, isReady, searchVideo]);

  const togglePlayback = useCallback(() => {
    if (!player || !isReady) {
      setError('YouTube player not ready');
      return;
    }

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setError(err.message || 'Failed to toggle playback');
    }
  }, [player, isReady, isPlaying]);

  const handleLogin = useCallback(() => {
    // YouTube doesn't require login for basic playback
    // This is just for consistency with other music services
    if (!isReady) {
      setError('YouTube player not ready. Please wait...');
      return;
    }
    // Player is already ready, no login needed
  }, [isReady]);

  const handleLogout = useCallback(() => {
    if (player && isReady) {
      try {
        player.stopVideo();
        setIsPlaying(false);
        setCurrentTrack(null);
      } catch (err) {
        console.error('Error stopping video:', err);
      }
    }
  }, [player, isReady]);

  const isConnected = isReady && !!player;

  return {
    player,
    isConnected,
    isPlaying,
    currentTrack,
    isLoading,
    error,
    volume,
    setVolume,
    handleLogin,
    handleLogout,
    playLofiPlaylist,
    togglePlayback,
    searchAndPlay,
    getMostPlayedPlaylists: getMostPlayedPlaylistsHook,
    availablePlaylists: LOFI_PLAYLISTS,
  };
};

