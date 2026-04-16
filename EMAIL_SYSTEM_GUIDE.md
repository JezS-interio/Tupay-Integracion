# Email Notification System Guide

Complete guide for the IntiTech email notification system powered by Resend.

## Features

### Implemented Email Types

1. **Welcome Email** - Sent when user signs up
2. **Order Confirmation Email** - Sent when user completes checkout
3. **Abandoned Cart Email** - Sent when user leaves items in cart for 2+ hours

## Authentication System

### Sign In/Sign Up Options

Users can authenticate using:
- **Email/Password** - Traditional authentication
- **Google OAuth** - One-click sign-in with Google account

### Pages
- `/signin` - Sign in page with email/password and Google OAuth
- `/signup` - Sign up page with email/password and Google OAuth
- `/forgot-password` - Password reset page

## Email Templates

All email templates are located in `src/emails/` and built using [@react-email/components](https://react.email):

### 1. Welcome Email (`WelcomeEmail.tsx`)
- **Trigger**: User creates account (email/password or Google OAuth)
- **Content**: Welcome message, what to do next, support contact
- **Template Props**:
  - `userName` (optional)
  - `verificationUrl` (optional)

### 2. Order Confirmation Email (`OrderConfirmationEmail.tsx`)
- **Trigger**: User completes checkout
- **Content**: Order details, items, shipping address, total
- **Template Props**:
  - `userName`
  - `orderNumber`
  - `orderDate`
  - `items[]` - Array of order items
  - `subtotal`, `shipping`, `total`
  - `shippingAddress`

### 3. Abandoned Cart Email (`AbandonedCartEmail.tsx`)
- **Trigger**: Cart items older than 2 hours, email not sent yet
- **Content**: Cart items, total, checkout link, benefits
- **Template Props**:
  - `userName`
  - `items[]` - Array of cart items
  - `cartTotal`
  - `checkoutUrl`

## API Routes

### Email Sending Routes

#### 1. `/api/send-welcome-email` (POST)
Sends welcome email to new users.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "John Doe",
  "verificationUrl": "https://..." // optional
}
```

#### 2. `/api/send-order-confirmation` (POST)
Sends order confirmation email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "John Doe",
  "orderNumber": "#1234567890",
  "orderDate": "1/5/2026",
  "items": [
    {
      "name": "iPhone 14 Pro",
      "quantity": 1,
      "price": 999.99,
      "image": "https://..."
    }
  ],
  "subtotal": 999.99,
  "shipping": 15.00,
  "total": 1014.99,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

#### 3. `/api/send-abandoned-cart-email` (POST)
Sends abandoned cart reminder email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "John Doe",
  "items": [
    {
      "name": "iPhone 14 Pro",
      "quantity": 1,
      "price": 999.99,
      "image": "https://..."
    }
  ],
  "cartTotal": 999.99
}
```

### Cron Job Routes

#### `/api/cron/send-abandoned-cart-emails` (GET)
Automated cron job that:
1. Finds abandoned carts older than 2 hours
2. Sends reminder emails to users
3. Marks carts as "email sent"

**Security**: Requires `Authorization: Bearer <CRON_SECRET>` header

**Cron Schedule**: Runs every 2 hours (configured in `vercel.json`)

## Abandoned Cart Tracking System

### How It Works

1. **Automatic Tracking**: When a logged-in user adds items to cart, it's automatically tracked in Firestore
2. **Real-time Sync**: Cart changes sync to Firestore with 2-second debounce
3. **Email Trigger**: Cron job checks for carts older than 2 hours without checkout
4. **Email Sent**: User receives reminder email with cart items
5. **Cleanup**: When user checks out or empties cart, abandoned cart record is deleted

### Firestore Collection: `abandoned_carts`

**Document Structure:**
```typescript
{
  userId: string;           // Firebase Auth UID
  email: string;            // User email (document ID)
  userName?: string;        // Display name
  items: [                  // Cart items
    {
      id: number;
      title: string;
      price: number;
      discountedPrice: number;
      quantity: number;
      image?: string;
    }
  ];
  cartTotal: number;        // Total cart value
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  emailSent: boolean;       // Has email been sent?
  emailSentAt?: string;     // When email was sent
}
```

### Key Functions (`src/lib/firebase/abandoned-carts.ts`)

- `saveAbandonedCart()` - Save/update cart in Firestore
- `getAbandonedCart()` - Get cart by email
- `deleteAbandonedCart()` - Delete cart (on checkout/clear)
- `getAbandonedCartsForReminder()` - Get carts needing emails
- `markAbandonedCartEmailSent()` - Mark email as sent
- `updateAbandonedCartTimestamp()` - Update cart modification time

## Configuration

### Environment Variables (.env.local)

```env
# Resend API Key (from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional: Site URL for email links
NEXT_PUBLIC_SITE_URL=https://intitech-development.vercel.app

# Optional: Cron job security
CRON_SECRET=your-secret-key
```

### Vercel Cron Configuration (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/send-abandoned-cart-emails",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

**Schedule Format**: `0 */2 * * *` = Every 2 hours

## Email Triggers

### 1. Welcome Email
**Automatically sent when:**
- User signs up with email/password
- User signs in with Google for the first time

**Code Location**: `src/app/context/AuthContext.tsx` (lines 89-100, 155-166)

### 2. Order Confirmation Email
**Automatically sent when:**
- User completes checkout on `/checkout` page

**Code Location**: `src/components/Checkout/index.tsx` (lines 56-71)

### 3. Abandoned Cart Email
**Automatically sent by cron job:**
- Runs every 2 hours (Vercel Cron)
- Finds carts older than 2 hours
- Sends emails to users who haven't checked out

**Code Location**: `/api/cron/send-abandoned-cart-emails/route.ts`

## Testing

### Test Welcome Email
1. Go to `/signup`
2. Create account with email/password or Google
3. Check inbox for welcome email

### Test Order Confirmation Email
1. Sign in to your account
2. Add products to cart
3. Go to `/checkout`
4. Click "Process to Checkout"
5. Check inbox for order confirmation

### Test Abandoned Cart Email

**Manual Test:**
```bash
# Call the cron endpoint manually (add CRON_SECRET to .env.local first)
curl -X GET http://localhost:3000/api/cron/send-abandoned-cart-emails \
  -H "Authorization: Bearer your-cron-secret"
```

**Automatic Test:**
1. Sign in to your account
2. Add items to cart
3. Wait 2 hours (or adjust threshold in code for testing)
4. Cron job will automatically send email

### Development Testing

To test emails in development, you can use Resend's test mode or change the timeThreshold:

```typescript
// In src/app/api/cron/send-abandoned-cart-emails/route.ts
// Change from 2 hours to 1 minute for testing:
const abandonedCarts = await getAbandonedCartsForReminder(1/60); // 1 minute instead of 2 hours
```

## Customization

### Change Email Sender

Update the `from` field in each API route:

```typescript
// Current (using Resend test domain):
from: 'IntiTech <onboarding@resend.dev>'

// After adding verified domain:
from: 'IntiTech <noreply@yourdomain.com>'
```

### Add More Email Types

1. Create template in `src/emails/YourEmail.tsx`
2. Create API route in `src/app/api/send-your-email/route.ts`
3. Call the API where you want to trigger the email

### Customize Abandoned Cart Timing

Change the hour threshold in the cron job:

```typescript
// In /api/cron/send-abandoned-cart-emails/route.ts
const abandonedCarts = await getAbandonedCartsForReminder(4); // 4 hours instead of 2
```

## Deployment

### Vercel Deployment

Cron jobs work automatically on Vercel when you:
1. Have `vercel.json` in your project root
2. Deploy to Vercel
3. Cron jobs will run on schedule

### Environment Variables in Vercel

Make sure to add these in Vercel dashboard:
- `RESEND_API_KEY`
- `CRON_SECRET` (optional)
- `NEXT_PUBLIC_SITE_URL` (optional)

## Troubleshooting

### Emails not sending

1. **Check Resend API Key**: Verify `RESEND_API_KEY` in `.env.local`
2. **Check API Response**: Look at browser console/network tab for errors
3. **Check Resend Dashboard**: Visit [resend.com/emails](https://resend.com/emails) to see sent emails

### Abandoned cart emails not working

1. **Check Cron Job**: Visit [vercel.com/dashboard](https://vercel.com) > Your Project > Cron Jobs
2. **Check Firestore**: Verify `abandoned_carts` collection has documents
3. **Check Timing**: Ensure carts are older than 2 hours
4. **Check Email Sent Flag**: Make sure `emailSent: false` in Firestore

### Welcome emails not sending on signup

1. **Check Network Tab**: See if `/api/send-welcome-email` is called
2. **Check Console**: Look for errors in browser console
3. **Check AuthContext**: Verify the API call in `src/app/context/AuthContext.tsx`

## Production Checklist

- [ ] Add verified domain to Resend
- [ ] Update `from` email addresses in all API routes
- [ ] Set `CRON_SECRET` environment variable
- [ ] Test all email flows
- [ ] Monitor Resend dashboard for delivery issues
- [ ] Set up Firestore security rules for `abandoned_carts` collection
- [ ] Consider adding unsubscribe links to emails (legal requirement in some regions)

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email/docs/components/html)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
