import { NextRequest, NextResponse } from 'next/server';
import { getAbandonedCartsForReminder, markAbandonedCartEmailSent } from '@/lib/firebase/abandoned-carts';

/**
 * Cron job endpoint to send abandoned cart emails
 *
 * This should be called periodically (e.g., every hour) by a cron service like:
 * - Vercel Cron (vercel.json configuration)
 * - GitHub Actions
 * - External cron service (cron-job.org, etc.)
 *
 * Security: Add authentication to prevent unauthorized calls
 * Example: Check for CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get abandoned carts older than 5 minutes that haven't been emailed
    // For testing: 5 minutes = 5/60 hours = 0.0833 hours
    // For production: change back to 2 (hours)
    const abandonedCarts = await getAbandonedCartsForReminder(5/60);

    console.log(`Found ${abandonedCarts.length} abandoned carts to email`);

    const results = await Promise.allSettled(
      abandonedCarts.map(async (cart) => {
        try {
          // Send abandoned cart email
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://intitech-development.vercel.app'}/api/send-abandoned-cart-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: cart.email,
                userName: cart.userName || 'there',
                items: cart.items,
                cartTotal: cart.cartTotal,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to send email to ${cart.email}`);
          }

          // Mark email as sent
          await markAbandonedCartEmailSent(cart.email);

          return { email: cart.email, status: 'success' };
        } catch (error: any) {
          console.error(`Error sending email to ${cart.email}:`, error);
          return { email: cart.email, status: 'failed', error: error.message };
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Abandoned cart emails processed',
      total: abandonedCarts.length,
      successful,
      failed,
      results: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { status: 'rejected', reason: r.reason }
      ),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process abandoned carts' },
      { status: 500 }
    );
  }
}
