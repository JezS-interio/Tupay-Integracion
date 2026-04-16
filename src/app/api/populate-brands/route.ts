import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function POST() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    let updatedCount = 0;
    const updatedProducts: string[] = [];

    for (const docSnap of snapshot.docs) {
      const product = docSnap.data();

      // Skip if brand already exists
      if (product.brand && product.brand !== "N/A") {
        continue;
      }

      // Extract brand from title
      if (product.title) {
        let brand = "";

        // Handle multi-word brands
        if (product.title.startsWith("Mr. Coffee")) {
          brand = "Mr. Coffee";
        } else if (product.title.startsWith("Black+Decker") || product.title.startsWith("Black & Decker")) {
          brand = "Black+Decker";
        } else {
          // For single-word brands, take the first word
          brand = product.title.split(" ")[0];
        }

        // Update the product with the extracted brand
        await updateDoc(doc(db, "products", docSnap.id), {
          brand: brand,
        });

        updatedProducts.push(`${product.title} → ${brand}`);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} products with brand information`,
      updatedProducts: updatedProducts,
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
