/**
 * Memory Deterioration System
 * Based on Ebbinghaus forgetting curve research
 * 
 * Realistic decay rates:
 * - After 1 day: ~80% retention (20% loss)
 * - After 3 days: ~60% retention (40% loss)
 * - After 7 days: ~40% retention (60% loss)
 * - After 14 days: ~25% retention (75% loss)
 * - After 30 days: ~15% retention (85% loss)
 * 
 * Uses exponential decay: retention = baseRetention * e^(-decayRate * days)
 */

/**
 * Calculate memory retention based on days since last practice
 * @param {number} daysSincePractice - Number of days since last practice
 * @returns {number} Retention factor (0-1)
 */
export function calculateMemoryRetention(daysSincePractice) {
  if (daysSincePractice <= 0) return 1.0; // No decay if practiced today
  
  // Exponential decay model
  // Base retention after 1 day: 0.8 (80%)
  // Decay rate: ~0.05 per day
  const baseRetention = 0.8;
  const decayRate = 0.05;
  
  // Calculate retention using exponential decay
  const retention = baseRetention * Math.exp(-decayRate * daysSincePractice);
  
  // Minimum retention floor (15% after very long periods)
  return Math.max(0.15, retention);
}

/**
 * Calculate days since last practice
 * @param {string|null|undefined} lastPracticeDate - ISO date string or null
 * @returns {number} Number of days since last practice
 */
export function getDaysSinceLastPractice(lastPracticeDate) {
  if (!lastPracticeDate) return Infinity; // Never practiced
  
  const lastDate = new Date(lastPracticeDate);
  const now = new Date();
  const diffTime = now - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Apply memory deterioration to a score
 * @param {number} originalScore - Original score (0-100)
 * @param {string|null|undefined} lastPracticeDate - ISO date string or null
 * @returns {number} Deteriorated score (0-100)
 */
export function applyMemoryDeterioration(originalScore, lastPracticeDate) {
  if (!originalScore || originalScore === 0) return 0;
  
  const daysSince = getDaysSinceLastPractice(lastPracticeDate);
  const retention = calculateMemoryRetention(daysSince);
  
  // Apply retention to the score
  return Math.round(originalScore * retention);
}

/**
 * Get deterioration information for display
 * @param {string|null|undefined} lastPracticeDate - ISO date string or null
 * @returns {object} Deterioration info with percentage loss and message
 */
export function getDeteriorationInfo(lastPracticeDate) {
  const daysSince = getDaysSinceLastPractice(lastPracticeDate);
  const retention = calculateMemoryRetention(daysSince);
  const lossPercent = Math.round((1 - retention) * 100);
  
  let message = '';
  if (daysSince === 0) {
    message = 'Practiced today - no deterioration';
  } else if (daysSince === 1) {
    message = 'Practiced yesterday - minimal deterioration';
  } else if (daysSince <= 3) {
    message = `${daysSince} days ago - slight deterioration`;
  } else if (daysSince <= 7) {
    message = `${daysSince} days ago - moderate deterioration`;
  } else if (daysSince <= 14) {
    message = `${daysSince} days ago - significant deterioration`;
  } else {
    message = `${daysSince} days ago - severe deterioration`;
  }
  
  return {
    daysSince,
    retention: Math.round(retention * 100),
    lossPercent,
    message,
  };
}

