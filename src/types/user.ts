export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;

  // Shipping information
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    street: string;
    streetTwo?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // Billing information
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // User preferences
  emailVerified: boolean;
  emailNotifications?: boolean;
  orderNotifications?: boolean;

  // Admin access
  isAdmin?: boolean;

  // Order history (just IDs, actual orders stored separately)
  orderIds?: string[];
}

export interface CreateUserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
}
