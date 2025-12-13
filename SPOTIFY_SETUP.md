# Spotify Integration Setup

This guide will help you set up Spotify integration for the ambient mode feature.

## Prerequisites

1. A Spotify account (Free or Premium)
2. A Spotify Developer account

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an app"
4. Fill in the app details:
   - **App name**: Trackviso (or your preferred name)
   - **App description**: Study timer with ambient music
   - **Redirect URI**: `http://localhost:5173/callback` (for development)
   - **Redirect URI**: `https://yourdomain.com/callback` (for production)
5. Accept the terms and click "Save"
6. Note down your **Client ID**

## Step 2: Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your Spotify Client ID:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

**Important**: 
- For development, use `http://localhost:5173/callback` as the redirect URI
- For production, add your production URL as a redirect URI in the Spotify Dashboard
- Make sure to add both development and production URLs in the Spotify Dashboard

## Step 3: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Study page
3. Enter ambient mode
4. Click "Connect Spotify" in the widget below the subject name
5. Authorize the app in the Spotify popup
6. You should be redirected back and see the Spotify controls

## Features

- **Connect/Disconnect**: Link your Spotify account
- **Play Lofi**: One-click button to play a curated lofi playlist
- **Search & Play**: Search for any song and play it
- **Play/Pause**: Control playback
- **Current Track Display**: See what's currently playing

## Troubleshooting

### "Spotify Client ID not configured"
- Make sure you've added `VITE_SPOTIFY_CLIENT_ID` to your `.env` file
- Restart your development server after adding the environment variable

### "Authentication error"
- Check that your redirect URI in the Spotify Dashboard matches your current URL
- Make sure you've accepted all the required permissions

### "Device not found" or playback not working
- Make sure you have Spotify open on at least one device (desktop app, web player, or mobile)
- Try refreshing the page and reconnecting

### Web Playback SDK not loading
- Check your browser console for errors
- Make sure you have an active internet connection
- The SDK script loads automatically when you connect

## Notes

- **Spotify Premium Required**: The Web Playback SDK requires a Spotify Premium account
- **Token Expiry**: Access tokens expire after 1 hour. The app will automatically handle re-authentication
- **Playback Device**: Music will play on the device where Spotify is currently active, or you can select a device in the Spotify app

## Security

- Never commit your `.env` file to version control
- Keep your Client ID secure (though it's safe to expose in client-side code)
- The redirect URI must exactly match what's configured in the Spotify Dashboard

