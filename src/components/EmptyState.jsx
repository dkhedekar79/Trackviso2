import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * Reusable empty state component with helpful guidance
 */
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  tips = [],
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-20 ${className}`}
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/40 mb-6">
        {Icon && <Icon className="w-10 h-10 text-purple-400" />}
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      
      {description && (
        <p className="text-purple-300/70 mb-6 max-w-md mx-auto">{description}</p>
      )}
      
      {action && (
        <div className="mb-8">{action}</div>
      )}
      
      {tips.length > 0 && (
        <div className="mt-8 max-w-md mx-auto">
          <p className="text-sm font-semibold text-purple-300/80 mb-3">💡 Tips:</p>
          <ul className="space-y-2 text-left">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-purple-300/60 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;

