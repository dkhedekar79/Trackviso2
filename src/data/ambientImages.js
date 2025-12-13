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
      }
      
      
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
      }
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

