import { NextResponse } from "next/server";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST() {
  try {
    const productsRef = collection(db, "products");

    // First, remove best seller flag from all products
    const allProductsQuery = query(productsRef, where("isBestSeller", "==", true));
    const allBestSellers = await getDocs(allProductsQuery);

    for (const docSnap of allBestSellers.docs) {
      await updateDoc(doc(db, "products", docSnap.id), {
        isBestSeller: false,
      });
    }

    // Get all active products
    const activeQuery = query(productsRef, where("isActive", "==", true));
    const snapshot = await getDocs(activeQuery);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "No active products found" },
        { status: 404 }
      );
    }

    // Get first 5 products and mark them as best sellers
    const products = snapshot.docs.slice(0, 5);
    const bestSellers: any[] = [];

    for (const docSnap of products) {
      await updateDoc(doc(db, "products", docSnap.id), {
        isBestSeller: true,
      });

      const data = docSnap.data();
      bestSellers.push({
        id: data.id,
        title: data.title,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully set ${bestSellers.length} products as best sellers`,
      bestSellers,
    });
  } catch (error: any) {
    console.error("Error setting best sellers:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
