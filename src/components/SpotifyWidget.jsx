import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, LogOut, Search, X } from 'lucide-react';
import { useSpotify } from '../hooks/useSpotify';

const SpotifyWidget = () => {
  const {
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
  } = useSpotify();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchAndPlay(searchQuery);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex items-center justify-center"
      >
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Music className="w-4 h-4" />
          Connect Spotify
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex flex-col items-center gap-3"
    >
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm bg-red-900/30 px-3 py-1 rounded"
        >
          {error}
        </motion.div>
      )}

      {/* Current Track Info */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs"
        >
          <p className="text-white/90 text-sm font-medium truncate">
            {currentTrack.name}
          </p>
          <p className="text-white/60 text-xs truncate">
            {currentTrack.artists.map(a => a.name).join(', ')}
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Play Lofi Button */}
        {!isPlaying && !currentTrack && (
          <button
            onClick={playLofiPlaylist}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Play Lofi</span>
              </>
            )}
          </button>
        )}

        {/* Play/Pause Toggle */}
        {currentTrack && (
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          title="Search and play"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          title="Disconnect Spotify"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <AnimatePresence>
        {showSearch && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full max-w-xs"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SpotifyWidget;

