/**
 * Ambient Mode Background Images Configuration
 * 
 * DEVELOPER INSTRUCTIONS:
 * =======================
 * 
 * To add background images for Ambient Mode:
 * 
 * OPTION 1: Using image files (Recommended)
 * -------------------------------------------
 * 1. Create a directory: public/ambient-images/
 * 2. Place your image files there (jpg, png, webp, etc.)
 * 3. Add entries to the array below:
 * 
 *    {
 *      id: 'unique-id',           // Unique identifier (e.g., 'forest-1')
 *      name: 'Display Name',       // Name shown in gallery
 *      path: '/ambient-images/your-image.jpg'  // Path from public folder
 *    }
 * 
 * OPTION 2: Using base64 data URLs
 * ---------------------------------
 * 1. Convert your image to base64 (use online tool or: base64 image.jpg)
 * 2. Add entry with data property:
 * 
 *    {
 *      id: 'unique-id',
 *      name: 'Display Name',
 *      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'  // Full base64 string
 *    }
 * 
 * NOTES:
 * - Images should be high quality (1920x1080 or larger recommended)
 * - Supported formats: JPG, PNG, WebP, GIF
 * - Keep file sizes reasonable for performance
 * - The first image in the array will be selected by default
 * 
 * EXAMPLE:
 * --------
 * const ambientImages = [
 *   {
 *     id: 'forest-1',
 *     name: 'Peaceful Forest',
 *     path: '/ambient-images/forest.jpg'
 *   },
 *   {
 *     id: 'ocean-1',
 *     name: 'Calm Ocean',
 *     path: '/ambient-images/ocean.jpg'
 *   },
 *   {
 *     id: 'mountain-1',
 *     name: 'Mountain View',
 *     data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...'
 *   }
 * ];
 */

/**
 * Ambient Mode Animated Wallpapers Configuration
 * 
 * To add animated wallpapers (MP4 videos):
 * 
 * 1. Place MP4 files in: public/ambient-images/videos/
 * 2. Add entries to the array below:
 * 
 *    {
 *      id: 'unique-id',           // Unique identifier (e.g., 'waves-1')
 *      name: 'Display Name',       // Name shown in gallery
 *      path: '/ambient-images/videos/your-video.mp4'  // Path from public folder
 *    }
 * 
 * NOTES:
 * - Videos should be optimized for web (H.264 codec recommended)
 * - Recommended resolution: 1920x1080 or 4K
 * - Keep file sizes reasonable for performance
 * - Videos will loop automatically
 * - Videos will be muted by default
 * 
 * EXAMPLE:
 * --------
 * const ambientVideos = [
 *   {
 *     id: 'waves-1',
 *     name: 'Ocean Waves',
 *     path: '/ambient-images/videos/waves.mp4'
 *   },
 *   {
 *     id: 'rain-1',
 *     name: 'Rainy Day',
 *     path: '/ambient-images/videos/rain.mp4'
 *   }
 * ];
 */

const ambientImages = [
    {
        id: 'anime_city-1',
        name: 'Anime city',
        path: '/ambient-images/animecity.jpg'
      },
      {
        id: 'clouds-1',
        name: 'Clouds',
        path: '/ambient-images/Clouds.png'
      },
      {
        id: 'future_garden-1',
        name: 'Future Garden',
        path: '/ambient-images/Futuregarden.jpg'
      },
      {
        id: 'aurora-1',
        name: 'Aurora',
        path: '/ambient-images/aurora.jpg'
      },
      {
        id: 'anime_cottage-3',
        name: 'Dreamy times',
        path: '/ambient-images/daydream.jpg'
      },
      {
        id: 'neon-rain-1',
        name: 'Neon Rain',
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%230f172a'/%3E%3Cstop offset='0.5' stop-color='%2331227a'/%3E%3Cstop offset='1' stop-color='%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3Cg stroke='%23ffffff22' stroke-width='2'%3E%3Cpath d='M120 0v1080M380 0v1080M640 0v1080M900 0v1080M1160 0v1080M1420 0v1080M1680 0v1080'/%3E%3C/g%3E%3C/svg%3E"
      },
      {
        id: 'sunrise-mist-1',
        name: 'Sunrise Mist',
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3CradialGradient id='r' cx='50%25' cy='15%25' r='80%25'%3E%3Cstop stop-color='%23fef3c7'/%3E%3Cstop offset='0.45' stop-color='%23fdba74'/%3E%3Cstop offset='1' stop-color='%231e293b'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23r)'/%3E%3Cg fill='%23ffffff1a'%3E%3Cellipse cx='350' cy='820' rx='420' ry='120'/%3E%3Cellipse cx='960' cy='860' rx='520' ry='130'/%3E%3Cellipse cx='1560' cy='820' rx='420' ry='120'/%3E%3C/g%3E%3C/svg%3E"
      },
      {
        id: 'deep-space-1',
        name: 'Deep Space',
        data: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='s' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23020117'/%3E%3Cstop offset='1' stop-color='%231b1c3a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23s)'/%3E%3Cg fill='%23ffffffaa'%3E%3Ccircle cx='180' cy='120' r='2'/%3E%3Ccircle cx='360' cy='260' r='1.5'/%3E%3Ccircle cx='590' cy='170' r='2.5'/%3E%3Ccircle cx='820' cy='90' r='1.5'/%3E%3Ccircle cx='1040' cy='240' r='2'/%3E%3Ccircle cx='1320' cy='140' r='1.5'/%3E%3Ccircle cx='1540' cy='220' r='2.5'/%3E%3Ccircle cx='1740' cy='110' r='1.5'/%3E%3C/g%3E%3C/svg%3E"
      },
      
      
  // Add your ambient mode background images here
  // 
  // Example entries (uncomment and modify):
  // {
  //   id: 'default-1',
  //   name: 'Default Background 1',
  //   path: '/ambient-images/default1.jpg'
  // },
  // {
  //   id: 'default-2',
  //   name: 'Default Background 2',
  //   path: '/ambient-images/default2.png'
  // },
  // {
  //   id: 'default-3',
  //   name: 'Default Background 3',
  //   data: 'data:image/jpeg;base64,...' // base64 encoded image
  // }
];

const ambientVideos = [
    {
        id: 'anime_coffee-1',
        name: 'Coffee',
        path: '/ambient-images/videos/Frozen Coffee Winter Snowfall 4K.mp4'
      },
      {
        id: 'mountain-1',
        name: 'Mountain',
        path: '/ambient-images/videos/Fantasy Mountain Waterfall River 4K.mp4'
      },
      {
        id: 'anime_cottage-1',
        name: 'Anime city',
        path: '/ambient-images/videos/Winter Night House Snowfall 4K.mp4'
      },
      {
        id: 'samurai-1',
        name: 'Samurai',
        path: '/ambient-images/videos/Samurai Sword 4K Wallpaper.mp4'
      },
      {
        id: 'anime_cottage-3',
        name: 'Sunset dock',
        path: '/ambient-images/videos/Evening Dock 4K Live Wallpaper.mp4'
      },
  // Add your animated wallpapers (MP4 videos) here
  // 
  // Example entries (uncomment and modify):
  // {
  //   id: 'waves-1',
  //   name: 'Ocean Waves',
  //   path: '/ambient-images/videos/waves.mp4'
  // },
  // {
  //   id: 'rain-1',
  //   name: 'Rainy Day',
  //   path: '/ambient-images/videos/rain.mp4'
  // }
];

export default ambientImages;
export { ambientVideos };

