import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The useSpotify hook will handle the token extraction from the hash
    // Just redirect back to study page after a brief moment
    const timer = setTimeout(() => {
      navigate('/study', { replace: true });
    }, 100);

    return () => clearTimeout(timer);
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

