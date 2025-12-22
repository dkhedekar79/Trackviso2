import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Users, Star, ArrowRight, Crown, Sparkles, MessageSquare, Copy, Check, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchReferrals, submitAmbassadorLink, fetchAmbassadorSubmissions } from '../utils/supabaseDb';

const PremiumGiftSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'referral', 'ambassador'
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Ambassador Form State
  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [views, setViews] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isPremiumUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const referralLink = user ? `${window.location.origin}/signup?ref=${user.id}` : '';

  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'referral') loadReferrals();
      if (activeTab === 'ambassador') loadSubmissions();
    }
  }, [isOpen, activeTab, user]);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const data = await fetchReferrals();
      setReferrals(data || []);
    } catch (err) {
      console.error('Error loading referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchAmbassadorSubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAmbassadorSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl || !views) return;
    
    setIsSubmitting(true);
    try {
      const result = await submitAmbassadorLink(videoUrl, platform, views);
      if (result) {
        setVideoUrl('');
        setViews('');
        loadSubmissions();
      }
    } catch (err) {
      console.error('Error submitting link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const completedCount = referrals.filter(r => r.status === 'completed').length;
  const progress = Math.min(100, (completedCount / 3) * 100);

  // Hidden on these pages
  const hiddenPages = ['/', '/login', '/signup', '/landing', '/terms', '/blog'];
  const isHiddenPage = hiddenPages.includes(location.pathname) || location.pathname.startsWith('/blog/');

  // For debugging - remove if everything works
  console.log('Gift System State:', { 
    path: location.pathname, 
    user: !!user, 
    isHiddenPage, 
    isPremium: isPremiumUser 
  });

  // Only show when logged in and not on hidden pages
  // (Removed isPremiumUser check temporarily to ensure visibility for debugging)
  if (!user || isHiddenPage || isDismissed) return null;

  const programs = [
    {
      id: 'referral',
      title: 'Referral Program',
      description: 'Invite 3 friends who reach level 10 and get permanent premium access.',
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
      tag: 'Easy',
      tagColor: 'bg-blue-500/10 text-blue-500',
      action: () => setActiveTab('referral')
    },
    {
      id: 'ambassador',
      title: 'Ambassador Program',
      description: 'Become a brand ambassador and earn permanent premium access by promoting us on social media.',
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
      tag: 'Best Value',
      tagColor: 'bg-amber-500/10 text-amber-500',
      action: () => setActiveTab('ambassador')
    }
  ];

  return (
    <>
      {/* Floating Bouncing Gift Icon */}
      <div 
        className="fixed right-6 top-1/2 -translate-y-1/2 z-[9999] group p-2 min-w-[80px] min-h-[80px] flex items-center justify-center pointer-events-none"
      >
        <motion.div
          animate={{ 
            y: [0, -12, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative pointer-events-auto"
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-rose-500 shadow-lg border border-white/20 cursor-pointer"
          >
            <X size={10} />
          </button>

          <div 
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true);
              setActiveTab('main');
            }}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 p-4 rounded-2xl shadow-2xl border border-white/20 group-hover:scale-110 cursor-pointer transition-transform duration-300 relative z-10"
          >
            <Gift className="w-8 h-8 text-white" />
          </div>
          
          {/* Label */}
          <div className="absolute top-1/2 right-full mr-4 -translate-y-1/2 flex items-center">
            <div className="bg-white/90 dark:bg-[#1a1a2e]/90 backdrop-blur-md text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 border border-rose-100 dark:border-rose-900 flex items-center gap-2">
              <Sparkles size={12} className="animate-pulse" />
              FREE PREMIUM
            </div>
          </div>

          {/* Pulsing rings */}
          <div className="absolute inset-0 bg-pink-500 rounded-2xl animate-ping opacity-20 scale-110" />
          <div className="absolute inset-0 bg-rose-500 rounded-2xl animate-pulse opacity-10 scale-125" />
        </motion.div>
      </div>

      {/* Modal Overlay and Content */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-indigo-950 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
            >
              {activeTab === 'main' && (
                <>
                  {/* Header Section */}
                  <div className="relative h-48 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 p-8 flex flex-col justify-end overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Crown size={120} className="rotate-12 text-white" />
                    </div>
                    
                    <div className="absolute inset-0">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: -20, opacity: 0 }}
                          animate={{
                            y: [0, 150],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                          }}
                          className="absolute text-white/10"
                          style={{ left: `${Math.random() * 100}%` }}
                        >
                          <Gift size={24} />
                        </motion.div>
                      ))}
                    </div>

                    <div className="relative z-10">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 mb-2"
                      >
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                          <Gift className="text-white w-6 h-6" />
                        </div>
                        <span className="text-white/80 font-medium tracking-wider uppercase text-[10px]">Special Offer</span>
                      </motion.div>
                      <h2 className="text-3xl font-black text-white leading-tight">
                        Get Free <span className="text-amber-300">Premium</span>
                      </h2>
                      <p className="text-white/70 text-sm mt-1 max-w-xs">
                        Unlock all pro features without spending a dime.
                      </p>
                    </div>

                    <button 
                      onClick={() => setIsOpen(false)}
                      className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all duration-300 backdrop-blur-md border border-white/10 group"
                    >
                      <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 space-y-4">
                    {programs.map((program, index) => (
                      <motion.button
                        key={program.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={program.action}
                        className="w-full text-left group relative p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${program.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="relative flex items-center gap-5">
                          <div className={`p-4 rounded-2xl bg-white/[0.03] ${program.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/5`}>
                            {program.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-lg text-[var(--text-main)] transition-colors">
                                {program.title}
                              </h3>
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${program.tagColor}`}>
                                {program.tag}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-80">
                              {program.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] text-[var(--text-muted)] group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-rose-500/20">
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'referral' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveTab('main')}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[var(--text-muted)]"
                      >
                        <ArrowRight size={20} className="rotate-180" />
                      </button>
                      <h2 className="text-2xl font-black text-[var(--text-main)]">Referral Program</h2>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[var(--text-muted)]"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                          <Info size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text-main)] mb-1">How it works</h3>
                          <p className="text-sm text-[var(--text-secondary)] opacity-80">
                            Share your link. When 3 people sign up and reach <span className="text-blue-500 font-bold">Level 10</span>, you get Premium forever.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Your Progress</span>
                          <div className="text-2xl font-black text-[var(--text-main)] mt-1">
                            {completedCount} <span className="text-[var(--text-muted)] font-normal text-lg">/ 3</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                            {completedCount >= 3 ? 'Goal Reached!' : `${3 - completedCount} more to go`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </div>

                    {/* Referral Link */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Your Referral Link</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-[var(--text-secondary)] font-mono truncate">
                          {referralLink}
                        </div>
                        <button 
                          onClick={copyToClipboard}
                          className={`px-6 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 ${
                            copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white text-black hover:bg-gray-200 shadow-lg'
                          }`}
                        >
                          {copied ? <Check size={18} /> : <Copy size={18} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Friends List */}
                    <div className="pt-2">
                      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 ml-1">Referred Friends</h3>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                          <div className="text-center py-4 text-[var(--text-muted)]">Loading...</div>
                        ) : referrals.length === 0 ? (
                          <div className="text-center py-8 rounded-3xl border border-dashed border-white/10 text-[var(--text-muted)] text-sm">
                            No referrals yet. Share your link to start!
                          </div>
                        ) : (
                          referrals.map((ref, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                  {i + 1}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-[var(--text-main)]">New Student</div>
                                  <div className="text-[10px] text-[var(--text-muted)]">Joined {new Date(ref.created_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                                  ref.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {ref.status === 'completed' ? 'Level 10 reached' : `Level ${ref.referred_stats?.level || 1} / 10`}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ambassador' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveTab('main')}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[var(--text-muted)]"
                      >
                        <ArrowRight size={20} className="rotate-180" />
                      </button>
                      <h2 className="text-2xl font-black text-[var(--text-main)]">Ambassador Program</h2>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[var(--text-muted)]"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Instructions Card */}
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-3xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                          <Star size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text-main)] mb-1">Earn Permanent Premium</h3>
                          <p className="text-sm text-[var(--text-secondary)] opacity-80 leading-relaxed">
                            Post <span className="text-purple-500 font-bold">5 videos</span> on TikTok, YouTube, or Instagram. Each video must reach <span className="text-purple-500 font-bold">500+ views</span>.
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-[10px] bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full font-bold w-fit">
                            <Sparkles size={12} />
                            PRO TIP: COMBINE WITH REFERRALS FOR MAX EFFICIENCY
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Checklist */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Videos Submitted</div>
                        <div className="text-xl font-black text-[var(--text-main)]">{submissions.length} / 5</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Videos Approved</div>
                        <div className="text-xl font-black text-green-500">{submissions.filter(s => s.status === 'approved').length} / 5</div>
                      </div>
                    </div>

                    {/* Submission Form */}
                    <form onSubmit={handleAmbassadorSubmit} className="space-y-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                      <h3 className="text-sm font-bold text-[var(--text-main)] ml-1">Submit New Video</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Platform</label>
                          <select 
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-purple-500/50 transition-colors"
                          >
                            <option value="tiktok">TikTok</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Current Views</label>
                          <input 
                            type="number" 
                            placeholder="500+"
                            value={views}
                            onChange={(e) => setViews(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-purple-500/50 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Video Link</label>
                        <input 
                          type="url" 
                          placeholder="https://..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-purple-500/50 transition-colors"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmitting || submissions.length >= 10}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                        <ArrowRight size={16} />
                      </button>
                    </form>

                    {/* Submissions List */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Your Submissions</h3>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                          <div className="text-center py-4 text-[var(--text-muted)]">Loading...</div>
                        ) : submissions.length === 0 ? (
                          <div className="text-center py-6 rounded-2xl border border-dashed border-white/10 text-[var(--text-muted)] text-[10px]">
                            No submissions yet.
                          </div>
                        ) : (
                          submissions.map((sub, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                              <div className="flex flex-col">
                                <span className="font-bold text-[var(--text-main)] capitalize">{sub.platform}</span>
                                <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[150px]">{sub.video_url}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[var(--text-muted)] font-medium">{sub.views} views</span>
                                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[8px] ${
                                  sub.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                                  sub.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 
                                  'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Section */}
              {activeTab === 'main' && (
                <div className="px-8 pb-8 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Sparkles size={16} />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Don't want to wait? <span className="text-amber-500 font-bold cursor-pointer hover:underline" onClick={() => {
                        setIsOpen(false);
                        navigate('/payment');
                      }}>Check out our plans</span> and get instant access to all features.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PremiumGiftSystem;
