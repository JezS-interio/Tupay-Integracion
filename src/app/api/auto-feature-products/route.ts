import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, query, where, limit } from "firebase/firestore";

export async function POST() {
  try {
    // Get random active products
    const q = query(
      collection(db, "products"),
      where("isActive", "==", true),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const products: any[] = [];

    snapshot.forEach((doc) => {
      products.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No products found",
      });
    }

    // Shuffle and pick 8 random products
    const shuffled = products.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, Math.min(8, products.length));

    // Mark them as featured
    const updates = [];
    for (const product of selectedProducts) {
      updates.push(
        updateDoc(doc(db, "products", product.docId), {
          featured: true,
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Successfully featured ${selectedProducts.length} products`,
      products: selectedProducts.map(p => ({
        id: p.id,
        title: p.title,
        price: p.discountedPrice,
      })),
    });
  } catch (error: any) {
    console.error("Error featuring products:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
