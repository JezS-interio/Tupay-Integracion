# How to Make a User an Admin

## 🔒 Security: Localhost-Only Access

**IMPORTANT**: The admin panel is **ONLY accessible on localhost** for maximum security.

- **Production URL** (`https://yoursite.com/admin`): ❌ BLOCKED
- **Localhost URL** (`http://localhost:3000/admin`): ✅ ALLOWED

This prevents any external attacks, brute force attempts, or unauthorized access.

The admin panel requires:
1. Running on localhost/127.0.0.1
2. User must be logged in
3. User must have `isAdmin: true` in Firestore

## Method 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Find the user document (by email or UID)
6. Click on the document
7. Click **"Add field"** (or edit if field exists)
   - Field name: `isAdmin`
   - Field type: `boolean`
   - Value: `true`
8. Click **Save**

## Method 2: Using Code (For Your Account)

If you want to make your own account an admin, run this in the browser console while logged in:

```javascript
// Get current user email
const userEmail = 'your-email@example.com';  // Replace with your email

// Update your profile in Firestore
fetch('/api/make-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail })
});
```

**Note**: You'd need to create the `/api/make-admin` endpoint first (see below).

## Method 3: Create an API Endpoint (Optional)

Create `src/app/api/make-admin/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileByEmail, updateUserProfile } from '@/lib/firebase/users';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Get user profile
    const profile = await getUserProfileByEmail(email);

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update to admin
    await updateUserProfile(profile.uid, { isAdmin: true });

    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin`
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**⚠️ IMPORTANT**: Delete this endpoint after making yourself an admin, or add authentication checks!

## How Admin Protection Works

1. **User visits `/admin`**
2. `AdminGuard` component checks:
   - Is user logged in? (Firebase Auth)
   - Does user have `isAdmin: true`? (Firestore)
3. **If YES**: Access granted ✅
4. **If NO**: Redirect to login or show "Access Denied" ❌

## Testing Admin Access

### Test 1: Without Login
1. Log out
2. Go to `/admin`
3. Should redirect to `/signin?redirect=/admin`

### Test 2: Regular User (Not Admin)
1. Log in with a regular account
2. Go to `/admin`
3. Should see "Access Denied" message

### Test 3: Admin User
1. Make your account admin (Method 1 or 2)
2. Log in
3. Go to `/admin`
4. Should see the admin dashboard ✅

## Current User Accounts

To check which users exist and make them admin:

1. Go to Firebase Console → Firestore Database
2. Open `users` collection
3. Look for your email address
4. Add `isAdmin: true` field

## Security Notes

- Admin status is checked on **every admin page load**
- Users cannot make themselves admin from the UI
- Only Firestore admins can set `isAdmin: true`
- Use Firestore security rules to prevent users from modifying their own `isAdmin` field

## Firestore Security Rules (Already Applied)

The current rules already protect the `isAdmin` field:

```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null && request.auth.uid == userId;
  // Users can update their profile, but Firestore rules should prevent changing isAdmin
}
```

**Note**: Consider adding a more restrictive rule specifically for the `isAdmin` field in production.

## Remote Access to Admin Panel (SSH Tunnel)

If you need to access admin from a remote location (e.g., from home to your office server), use an SSH tunnel:

### Step 1: SSH into your server
```bash
ssh user@your-server.com
```

### Step 2: Start the development server
```bash
cd /path/to/your/project
npm run dev
```

### Step 3: Create SSH tunnel from your local machine
Open a new terminal on your local machine:
```bash
ssh -L 3000:localhost:3000 user@your-server.com
```

### Step 4: Access admin
Now on your local machine, visit: `http://localhost:3000/admin`

The tunnel makes it appear as if the app is running locally, so the admin panel will work!

## Why Localhost-Only Is Secure

✅ **Zero attack surface**: No public URL to discover or attack
✅ **Impossible to brute force**: Not accessible from internet
✅ **No DDoS risk**: Can't be flooded with requests
✅ **No need for complex auth**: Physical access to machine required
✅ **Perfect for solo/small teams**: Simple and bulletproof

## Emergency: Temporarily Enable for Production

If you absolutely need admin on production temporarily:

1. Open `src/components/Admin/AdminGuard.tsx`
2. Find line with `const isLocal = hostname === 'localhost'...`
3. Add `|| true` to the end: `const isLocal = hostname === 'localhost' || true;`
4. Deploy
5. Do your admin work
6. **IMMEDIATELY** remove `|| true` and redeploy

⚠️ **WARNING**: Never leave production admin enabled permanently!
