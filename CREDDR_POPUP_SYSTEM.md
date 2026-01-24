# Creddr Popup System Documentation

## Overview
The Creddr popup is a one-time promotional popup that appears automatically for authenticated users. It can also be manually opened from the Settings page.

## How It Works

### 1. **Auto-Display Logic** (First-Time Users)

The popup automatically shows when:
- User is logged in (`user` exists)
- User is NOT on the landing page (`location.pathname !== '/'`)
- User hasn't seen the popup before (checked in both localStorage and Supabase)

**Flow:**
1. Component mounts and waits 1.5 seconds for auth to be ready
2. Checks `localStorage.getItem('hasSeenCreddrPopup')` first (fast check)
3. If not found in localStorage, checks Supabase `user_stats.has_seen_creddr_popup` column
4. If user hasn't seen it, sets `isOpen = true` to display the popup

### 2. **Manual Opening** (Settings Page)

Users can view the popup again from the Settings page:
- Settings page has a "View Creddr Offer" button
- Clicking the button dispatches a custom event: `window.dispatchEvent(new CustomEvent('openCreddrPopup'))`
- The popup listens for this event and opens when triggered
- When opened manually, it does NOT mark the popup as "seen" (so it won't prevent future auto-shows)

### 3. **Tracking System**

**Two-Tier Storage:**
- **localStorage**: Fast client-side check (`hasSeenCreddrPopup: 'true'`)
- **Supabase**: Persistent server-side tracking (`user_stats.has_seen_creddr_popup: true`)

**When Popup is Closed:**
- If auto-opened (first time): Marks as seen in both localStorage and Supabase
- If manually opened: Does NOT mark as seen (allows future auto-shows)

### 4. **Component Structure**

**File:** `src/components/CreddrPopup.jsx`

**Key State:**
- `isOpen`: Controls popup visibility
- `isManualOpen`: Tracks if popup was opened manually (prevents marking as seen)

**Key Functions:**
- `checkAndShowPopup()`: Auto-display logic (runs on mount)
- `handleClose()`: Closes popup and conditionally marks as seen
- `handleJoinWaitlist()`: Opens Creddr website and closes popup

**Event Listeners:**
- Listens for `openCreddrPopup` custom event (from Settings page)

### 5. **Database Schema**

**Table:** `user_stats`
**Column:** `has_seen_creddr_popup` (BOOLEAN, default: FALSE)

**Migration:** `supabase/migrations/012_add_creddr_popup_flag.sql`

### 6. **Integration Points**

**App.jsx:**
- `<CreddrPopup />` is rendered inside `<ProtectedRoute>` wrapper
- Ensures popup only appears for authenticated users

**Settings.jsx:**
- New section: "Creddr Launch Offer"
- Button dispatches `openCreddrPopup` event to trigger popup

## Usage Examples

### Opening Popup Manually (from any component):
```javascript
// Dispatch the custom event
window.dispatchEvent(new CustomEvent('openCreddrPopup'));
```

### Checking if User Has Seen Popup:
```javascript
// Check localStorage
const hasSeen = localStorage.getItem('hasSeenCreddrPopup') === 'true';

// Or check Supabase
const { data } = await supabase
  .from('user_stats')
  .select('has_seen_creddr_popup')
  .eq('user_id', user.id)
  .single();
```

## Key Features

1. **One-Time Auto-Show**: Only shows once automatically per user
2. **Manual Access**: Can be reopened from Settings anytime
3. **Persistent Tracking**: Uses both localStorage (fast) and Supabase (persistent)
4. **Auth-Aware**: Only shows for logged-in users
5. **Route-Aware**: Doesn't show on landing page
6. **Scrollable**: Content is scrollable if it exceeds viewport height

## Future Enhancements

- Add analytics tracking for popup views/clicks
- A/B testing different popup designs
- Time-based re-showing (e.g., show again after 30 days)
- User preference to disable popup entirely

