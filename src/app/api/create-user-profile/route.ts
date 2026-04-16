import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile, userProfileExists } from '@/lib/firebase/users';
import { CreateUserProfileData } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const data: CreateUserProfileData = await request.json();

    if (!data.uid || !data.email) {
      return NextResponse.json(
        { error: 'UID and email are required' },
        { status: 400 }
      );
    }

    // Check if user profile already exists
    const exists = await userProfileExists(data.uid);

    if (exists) {
      return NextResponse.json(
        { message: 'User profile already exists', isNewUser: false },
        { status: 200 }
      );
    }

    // Create new user profile
    const userProfile = await createUserProfile(data);

    return NextResponse.json(
      { userProfile, isNewUser: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user profile' },
      { status: 500 }
    );
  }
}
