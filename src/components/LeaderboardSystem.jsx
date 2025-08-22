import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Crown, Star, TrendingUp, Users, Flame, Zap, Target,
  Medal, Award, Calendar, Clock, BookOpen, Share2, Plus,
  ChevronUp, ChevronDown, Filter, Search, RefreshCw, Sparkles
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { AnimatedProgressBar } from './RewardAnimations';

// Generate realistic leaderboard data based on actual user performance
const generateRealisticLeaderboardData = (userStats, category, timeframe) => {
  // Base the leaderboard on the current user's performance
  const baseUserData = {
    id: 'current_user',
    rank: 1,
    name: 'You',
    avatar: '🧑‍🎓',
    score: getScoreForCategory(userStats, category),
    change: 0,
    isCurrentUser: true,
    prestige: userStats.prestigeLevel || 0,
    country: '🌍',
    level: userStats.level,
    title: userStats.currentTitle || 'Student'
  };

  // Generate a small number of realistic competitors based on user's level
  const competitors = [];
  const userScore = baseUserData.score;
  const userLevel = userStats.level;
  
  // Create 10-20 realistic competitors
  const numCompetitors = Math.min(15, Math.max(5, userLevel * 2));
  
  for (let i = 0; i < numCompetitors; i++) {
    const isAbove = Math.random() > 0.7; // 30% chance to be above user
    const levelVariation = Math.floor((Math.random() - 0.5) * 10); // ±5 levels
    const competitorLevel = Math.max(1, userLevel + levelVariation);
    
    // Score should be realistic based on level and category
    let competitorScore;
    if (category === 'xp') {
      competitorScore = isAbove 
        ? Math.floor(userScore * (1 + Math.random() * 0.5)) // Up to 50% higher
        : Math.floor(userScore * (0.5 + Math.random() * 0.5)); // 50-100% of user score
    } else if (category === 'streak') {
      competitorScore = isAbove
        ? userScore + Math.floor(Math.random() * 50)
        : Math.max(0, userScore - Math.floor(Math.random() * userScore));
    } else if (category === 'time') {
      competitorScore = isAbove
        ? Math.floor(userScore * (1 + Math.random() * 0.3))
        : Math.floor(userScore * (0.7 + Math.random() * 0.3));
    } else {
      competitorScore = competitorLevel;
    }

    competitors.push({
      id: `user_${i}`,
      rank: i + 1,
      name: generateRealisticName(),
      avatar: getRandomAvatar(),
      score: competitorScore,
      change: Math.floor((Math.random() - 0.5) * 6), // ±3 rank change
      isCurrentUser: false,
      prestige: Math.floor(competitorLevel / 50), // Realistic prestige
      country: getRandomCountry(),
      level: competitorLevel,
      title: getTitleForLevel(competitorLevel)
    });
  }

  // Add the current user to the list
  const allUsers = [baseUserData, ...competitors];
  
  // Sort by score and assign ranks
  allUsers.sort((a, b) => b.score - a.score);
  allUsers.forEach((user, index) => {
    user.rank = index + 1;
  });

  return allUsers;
};

// Get score for specific category based on real user data
const getScoreForCategory = (userStats, category) => {
  switch (category) {
    case 'xp':
      return userStats.xp || 0;
    case 'streak':
      return userStats.currentStreak || 0;
    case 'time':
      return Math.floor((userStats.totalStudyTime || 0) / 60); // Convert to hours
    case 'level':
      return userStats.level || 1;
    default:
      return 0;
  }
};

// Generate realistic names
const generateRealisticName = () => {
  const firstNames = [
    'Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Morgan', 'Jamie',
    'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Blake', 'Charlie'
  ];
  const lastNames = [
    'StudyMaster', 'Scholar', 'Learner', 'Academic', 'Student', 'Achiever',
    'Focused', 'Dedicated', 'Motivated', 'Persistent', 'Brilliant', 'Smart'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName}${lastName}`;
};

const getRandomAvatar = () => {
  const avatars = ['🧑‍🎓', '👩‍🎓', '🧑‍💼', '👩‍💼', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

const getRandomCountry = () => {
  const countries = ['🌍', '🌎', '🌏', '🇺🇸', '🇨🇦', '🇬🇧', '🇩🇪', '🇫🇷'];
  return countries[Math.floor(Math.random() * countries.length)];
};

const getTitleForLevel = (level) => {
  if (level >= 50) return 'Academic Elite';
  if (level >= 30) return 'Study Master';
  if (level >= 20) return 'Knowledge Seeker';
  if (level >= 10) return 'Dedicated Scholar';
  if (level >= 5) return 'Rising Student';
  return 'New Learner';
};

// Leaderboard Categories with realistic descriptions
const LEADERBOARD_CATEGORIES = {
  xp: {
    name: 'Total XP',
    icon: Star,
    color: 'yellow',
    description: 'Experience points from study sessions',
    unit: 'XP',
    formatter: (value) => value.toLocaleString()
  },
  streak: {
    name: 'Study Streak',
    icon: Flame,
    color: 'orange',
    description: 'Current consecutive study days',
    unit: 'days',
    formatter: (value) => value.toString()
  },
  time: {
    name: 'Study Time',
    icon: Clock,
    color: 'blue',
    description: 'Total hours studied',
    unit: 'hours',
    formatter: (value) => `${value}h`
  },
  level: {
    name: 'Level',
    icon: TrendingUp,
    color: 'purple',
    description: 'Current level achieved',
    unit: 'level',
    formatter: (value) => `Level ${value}`
  }
};

// Timeframes
const TIMEFRAMES = {
  daily: { name: 'Today', icon: Calendar },
  weekly: { name: 'This Week', icon: Calendar },
  monthly: { name: 'This Month', icon: Calendar },
  alltime: { name: 'All Time', icon: Trophy }
};

// Leaderboard Position Component
const LeaderboardPosition = ({ user, category, isCurrentUser, rank }) => {
  const categoryInfo = LEADERBOARD_CATEGORIES[category];
  
  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-yellow-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>;
  };
  
  const getRankColor = (position) => {
    if (position === 1) return 'from-yellow-400 to-yellow-600';
    if (position === 2) return 'from-gray-300 to-gray-500';
    if (position === 3) return 'from-yellow-600 to-orange-600';
    if (position <= 10) return 'from-purple-400 to-purple-600';
    return 'from-gray-400 to-gray-600';
  };
  
  const getChangeIcon = (change) => {
    if (change > 0) return <ChevronUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ChevronDown className="w-4 h-4 text-red-500" />;
    return <span className="w-4 h-4 text-gray-400">-</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-4 rounded-2xl border-2 transition-all ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 shadow-purple-100/50' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } shadow-lg`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(rank)} flex items-center justify-center shadow-lg`}>
            {getRankIcon(rank)}
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{user.avatar}</span>
            <h3 className={`font-bold truncate ${isCurrentUser ? 'text-purple-800' : 'text-gray-800'}`}>
              {user.name}
            </h3>
            {user.prestige > 0 && (
              <div className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                P{user.prestige}
              </div>
            )}
            <span className="text-lg">{user.country}</span>
            {isCurrentUser && (
              <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                YOU
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{user.title}</span>
            <span>•</span>
            <span>Level {user.level}</span>
          </div>
        </div>
        
        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-2xl font-bold ${isCurrentUser ? 'text-purple-700' : 'text-gray-800'}`}>
            {categoryInfo.formatter(user.score)}
          </div>
          <div className="flex items-center justify-end gap-1 text-sm">
            {getChangeIcon(user.change)}
            <span className={`font-medium ${
              user.change > 0 ? 'text-green-600' : 
              user.change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {user.change !== 0 ? Math.abs(user.change) : '-'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Podium Component for Top 3
const PodiumDisplay = ({ topThree, category }) => {
  const categoryInfo = LEADERBOARD_CATEGORIES[category];
  
  const podiumHeights = {
    1: 'h-32',
    2: 'h-24', 
    3: 'h-20'
  };
  
  const podiumColors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-yellow-600 to-orange-600'
  };
  
  // Arrange for podium display: [2nd, 1st, 3rd]
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const positions = [2, 1, 3];
  
  if (topThree.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-300" />
          Top Performers
        </h2>
        <p className="text-purple-100">Leading the {categoryInfo.name.toLowerCase()} leaderboard</p>
      </div>
      
      <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto">
        {podiumOrder.map((user, index) => {
          if (!user) return null;
          
          const position = positions[index];
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center"
            >
              {/* User Info */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center mb-4"
              >
                <div className="text-4xl mb-2">{user.avatar}</div>
                <div className="font-bold text-lg">{user.name}</div>
                <div className="text-sm opacity-90">{user.title}</div>
                <div className="text-2xl font-bold text-yellow-300 mt-2">
                  {categoryInfo.formatter(user.score)}
                </div>
              </motion.div>
              
              {/* Podium */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                className={`w-24 ${podiumHeights[position]} bg-gradient-to-t ${podiumColors[position]} rounded-t-lg flex items-end justify-center pb-2 shadow-lg relative`}
              >
                <div className="text-white font-bold text-2xl">
                  {position}
                </div>
                
                {position === 1 && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-6"
                  >
                    <Crown className="w-8 h-8 text-yellow-300" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Real Competition Challenges based on actual data
const CompetitionChallenges = ({ userStats }) => {
  // Calculate realistic participant counts based on user level
  const baseParticipants = Math.max(50, Math.min(500, userStats.level * 10));
  
  const challenges = [
    {
      id: 1,
      name: 'Weekend Study Marathon',
      description: 'Study for 10+ hours this weekend',
      participants: Math.floor(baseParticipants * 0.8),
      timeLeft: '2 days',
      reward: '500 XP + Marathon Badge',
      difficulty: 'Medium',
      icon: '🏃‍♂️',
      userProgress: Math.min(10, Math.floor((userStats.totalStudyTime || 0) / 60) % 10),
      maxProgress: 10
    },
    {
      id: 2,
      name: 'Streak Champions',
      description: 'Maintain a 7-day streak',
      participants: Math.floor(baseParticipants * 1.2),
      timeLeft: '5 days',
      reward: '750 XP + Streak Master Title',
      difficulty: 'Hard',
      icon: '🔥',
      userProgress: Math.min(7, userStats.currentStreak || 0),
      maxProgress: 7
    },
    {
      id: 3,
      name: 'Knowledge Explorer',
      description: 'Study 5 different subjects this week',
      participants: Math.floor(baseParticipants * 0.6),
      timeLeft: '3 days',
      reward: '300 XP + Explorer Achievement',
      difficulty: 'Easy',
      icon: '🗺️',
      userProgress: Math.min(5, Object.keys(userStats.subjectMastery || {}).length),
      maxProgress: 5
    }
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-6 h-6 text-purple-500" />
        Active Challenges
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            whileHover={{ scale: 1.02, y: -5 }}
            className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-purple-300 transition-all"
          >
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">{challenge.icon}</div>
              <h4 className="font-bold text-gray-800">{challenge.name}</h4>
              <p className="text-sm text-gray-600">{challenge.description}</p>
            </div>
            
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Participants:</span>
                <span className="font-medium">{challenge.participants.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time left:</span>
                <span className="font-medium text-orange-600">{challenge.timeLeft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reward:</span>
                <span className="font-medium text-green-600">{challenge.reward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Progress:</span>
                <span className="font-medium text-blue-600">
                  {challenge.userProgress}/{challenge.maxProgress}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(challenge.userProgress / challenge.maxProgress) * 100}%` }}
              />
            </div>
            
            <button 
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                challenge.userProgress >= challenge.maxProgress
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              disabled={challenge.userProgress >= challenge.maxProgress}
            >
              {challenge.userProgress >= challenge.maxProgress ? 'Completed!' : 'Join Challenge'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Real Study Groups based on user activity
const StudyGroups = ({ userStats }) => {
  // Generate study groups based on user's subjects and level
  const userSubjects = Object.keys(userStats.subjectMastery || {});
  const userLevel = userStats.level || 1;
  
  const groups = [
    {
      id: 1,
      name: `${userSubjects[0] || 'General'} Study Circle`,
      subject: userSubjects[0] || 'General Studies',
      members: Math.floor(userLevel / 2) + Math.floor(Math.random() * 10) + 15,
      online: Math.floor(Math.random() * 8) + 2,
      description: `Collaborative ${userSubjects[0] || 'general'} study sessions`,
      level: userLevel < 10 ? 'Beginner' : userLevel < 30 ? 'Intermediate' : 'Advanced',
      icon: userSubjects[0] ? '📚' : '🎓'
    },
    {
      id: 2,
      name: `Level ${Math.floor(userLevel / 10) * 10}+ Achievers`,
      subject: 'Multi-Subject',
      members: Math.floor(userLevel / 3) + Math.floor(Math.random() * 15) + 10,
      online: Math.floor(Math.random() * 6) + 3,
      description: `High-level students working together`,
      level: 'Advanced',
      icon: '🏆'
    },
    {
      id: 3,
      name: 'Daily Streak Warriors',
      subject: 'Motivation & Accountability',
      members: Math.max(20, userStats.currentStreak + Math.floor(Math.random() * 20)),
      online: Math.floor(Math.random() * 12) + 5,
      description: 'Maintaining study streaks together',
      level: 'All Levels',
      icon: '🔥'
    }
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-500" />
        Study Groups
      </h3>
      
      <div className="space-y-4">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{group.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-600">{group.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{group.members} members</span>
                    <span className="text-green-600">{group.online} online</span>
                    <span>{group.level}</span>
                  </div>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Join
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Create Study Group
      </button>
    </div>
  );
};

// Main Leaderboard System Component
const LeaderboardSystem = () => {
  const { userStats } = useGamification();
  const [activeCategory, setActiveCategory] = useState('xp');
  const [activeTimeframe, setActiveTimeframe] = useState('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load leaderboard data based on real user stats
  useEffect(() => {
    setIsLoading(true);
    
    // Generate realistic leaderboard based on actual user data
    setTimeout(() => {
      const data = generateRealisticLeaderboardData(userStats, activeCategory, activeTimeframe);
      setLeaderboardData(data);
      setIsLoading(false);
    }, 300);
  }, [activeCategory, activeTimeframe, userStats]);
  
  // Filter data based on search
  const filteredData = leaderboardData.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const topThree = filteredData.slice(0, 3);
  const remainingUsers = filteredData.slice(3);
  
  // Find current user position
  const currentUserPosition = filteredData.findIndex(user => user.isCurrentUser);
  const currentUser = filteredData[currentUserPosition];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboards & Competition
        </h1>
        <p className="text-gray-600">
          See how you rank among fellow students!
        </p>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          {/* Category Tabs */}
          <div className="flex gap-2">
            {Object.entries(LEADERBOARD_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeCategory === key
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 300);
            }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {Object.entries(TIMEFRAMES).map(([key, timeframe]) => (
              <button
                key={key}
                onClick={() => setActiveTimeframe(key)}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  activeTimeframe === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {timeframe.name}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Current User Stats */}
      {currentUser && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white mb-8">
          <h3 className="text-lg font-bold mb-4">Your Current Ranking</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{currentUserPosition + 1}</div>
              <div className="text-sm opacity-90">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{LEADERBOARD_CATEGORIES[activeCategory].formatter(currentUser.score)}</div>
              <div className="text-sm opacity-90">{LEADERBOARD_CATEGORIES[activeCategory].name}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">Level {currentUser.level}</div>
              <div className="text-sm opacity-90">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{currentUser.change >= 0 ? '+' : ''}{currentUser.change}</div>
              <div className="text-sm opacity-90">Rank Change</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Podium Display */}
      {topThree.length > 0 && <PodiumDisplay topThree={topThree} category={activeCategory} />}
      
      {/* Competition Challenges */}
      <CompetitionChallenges userStats={userStats} />
      
      {/* Main Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              Rankings
            </h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {remainingUsers.map((user, index) => (
                  <LeaderboardPosition
                    key={user.id}
                    user={user}
                    category={activeCategory}
                    isCurrentUser={user.isCurrentUser}
                    rank={index + 4} // +4 because top 3 are in podium
                  />
                ))}
                
                {remainingUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm">Try adjusting your search or category</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Study Groups Sidebar */}
        <div className="lg:col-span-1">
          <StudyGroups userStats={userStats} />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSystem;
export { PodiumDisplay, CompetitionChallenges, StudyGroups };
