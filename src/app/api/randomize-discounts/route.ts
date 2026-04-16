import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function POST() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    let updatedCount = 0;
    let noDiscountCount = 0;
    const updatedProducts: string[] = [];

    for (const docSnap of snapshot.docs) {
      const product = docSnap.data();

      // Randomly decide if this product should have a discount (50% chance)
      const shouldHaveDiscount = Math.random() < 0.5;

      if (!shouldHaveDiscount) {
        // Remove discount by setting discountedPrice equal to price
        await updateDoc(doc(db, "products", docSnap.id), {
          discountedPrice: product.price,
        });

        updatedProducts.push(`${product.title} - No discount (Price: $${product.price})`);
        noDiscountCount++;
      } else {
        // Keep existing discount
        updatedProducts.push(`${product.title} - Has discount ($${product.discountedPrice} from $${product.price})`);
      }

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} products. ${noDiscountCount} products now have no discount, ${updatedCount - noDiscountCount} products have discounts.`,
      updatedProducts: updatedProducts,
      stats: {
        total: updatedCount,
        noDiscount: noDiscountCount,
        withDiscount: updatedCount - noDiscountCount,
      },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
