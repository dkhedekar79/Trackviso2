/**
 * Data export/import utilities
 * Allows users to export and import their data for backup/portability
 */

import logger from './logger';

/**
 * Export all user data to JSON
 */
export const exportUserData = async () => {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      userStats: JSON.parse(localStorage.getItem('userStats') || '{}'),
      subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      studySessions: JSON.parse(localStorage.getItem('studySessions') || '[]'),
      masteryData: {},
    };

    // Export mastery data for each subject
    const subjects = data.subjects || [];
    for (const subject of subjects) {
      const masteryKey = `mastery_${subject.name || subject.id}`;
      const mastery = localStorage.getItem(masteryKey);
      if (mastery) {
        try {
          data.masteryData[subject.name || subject.id] = JSON.parse(mastery);
        } catch (e) {
          logger.error('Error parsing mastery data:', e);
        }
      }
    }

    return JSON.stringify(data, null, 2);
  } catch (error) {
    logger.error('Error exporting user data:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Download data as JSON file
 */
export const downloadUserData = async (filename = 'trackviso-backup.json') => {
  try {
    const data = await exportUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    logger.error('Error downloading user data:', error);
    throw error;
  }
};

/**
 * Import user data from JSON
 */
export const importUserData = async (jsonData, options = {}) => {
  const { 
    merge = false, 
    overwrite = false,
    validate = true 
  } = options;

  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // Validate data structure
    if (validate) {
      if (!data.version || !data.exportDate) {
        throw new Error('Invalid data format');
      }
    }

    if (overwrite) {
      // Clear existing data
      localStorage.removeItem('userStats');
      localStorage.removeItem('subjects');
      localStorage.removeItem('tasks');
      localStorage.removeItem('studySessions');
    }

    // Import data
    if (data.userStats) {
      if (merge) {
        const existing = JSON.parse(localStorage.getItem('userStats') || '{}');
        localStorage.setItem('userStats', JSON.stringify({ ...existing, ...data.userStats }));
      } else {
        localStorage.setItem('userStats', JSON.stringify(data.userStats));
      }
    }

    if (data.subjects) {
      localStorage.setItem('subjects', JSON.stringify(data.subjects));
    }

    if (data.tasks) {
      localStorage.setItem('tasks', JSON.stringify(data.tasks));
    }

    if (data.studySessions) {
      localStorage.setItem('studySessions', JSON.stringify(data.studySessions));
    }

    if (data.masteryData) {
      Object.keys(data.masteryData).forEach(subject => {
        localStorage.setItem(`mastery_${subject}`, JSON.stringify(data.masteryData[subject]));
      });
    }

    logger.log('Data imported successfully');
    return true;
  } catch (error) {
    logger.error('Error importing user data:', error);
    throw error;
  }
};

/**
 * Import data from file input
 */
export const importUserDataFromFile = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const result = await importUserData(e.target.result, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export default {
  exportUserData,
  downloadUserData,
  importUserData,
  importUserDataFromFile
};

