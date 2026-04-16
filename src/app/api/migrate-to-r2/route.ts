import { NextResponse } from 'next/server';
import { migrateProductImagesToR2 } from '@/scripts/migrateImagesToR2';

export async function POST() {
  try {
    const results = await migrateProductImagesToR2();

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results,
    });
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to migrate product images to R2',
    endpoint: '/api/migrate-to-r2',
    method: 'POST',
  });
}
