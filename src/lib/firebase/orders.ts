import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  limit as firestoreLimit,
  Timestamp,
} from 'firebase/firestore';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';

const ordersCollection = collection(db, 'orders');

/**
 * Create a new order
 */
export async function createOrder(order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Generate order ID (timestamp-based)
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const orderData: Order = {
      ...order,
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(ordersCollection, orderId), orderData);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await getDoc(doc(ordersCollection, orderId));

    if (!orderDoc.exists()) {
      return null;
    }

    return orderDoc.data() as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Get all orders (with optional filters)
 */
export async function getAllOrders(filters?: {
  status?: OrderStatus;
  userId?: string;
  limit?: number;
}): Promise<Order[]> {
  try {
    let q = query(ordersCollection, orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(q, where('orderStatus', '==', filters.status));
    }

    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

    if (filters?.limit) {
      q = query(q, firestoreLimit(filters.limit));
    }

    const snapshot = await getDocs(q);
    const orders: Order[] = [];

    snapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get orders by user ID
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  return getAllOrders({ userId });
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const orderRef = doc(ordersCollection, orderId);

    await updateDoc(orderRef, {
      orderStatus: status,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<boolean> {
  try {
    const orderRef = doc(ordersCollection, orderId);

    await updateDoc(orderRef, {
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
}

/**
 * Add notes to an order
 */
export async function addOrderNotes(orderId: string, notes: string): Promise<boolean> {
  try {
    const orderRef = doc(ordersCollection, orderId);

    await updateDoc(orderRef, {
      notes,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error updating order notes:', error);
    return false;
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}> {
  try {
    const orders = await getAllOrders();

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
      processingOrders: orders.filter(o => o.orderStatus === 'processing').length,
      shippedOrders: orders.filter(o => o.orderStatus === 'shipped').length,
      deliveredOrders: orders.filter(o => o.orderStatus === 'delivered').length,
      cancelledOrders: orders.filter(o => o.orderStatus === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: 0,
    };

    stats.averageOrderValue = stats.totalOrders > 0
      ? stats.totalRevenue / orders.filter(o => o.paymentStatus === 'paid').length
      : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
}
