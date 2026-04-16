import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function POST() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    let fixed = false;
    let productName = "";

    for (const docSnap of snapshot.docs) {
      const product = docSnap.data();

      // Find products with "Mixer" in title that have description about baking/dough
      if (
        product.title?.includes("Mixer") &&
        (product.description?.includes("mixing dough") ||
         product.description?.includes("baking"))
      ) {
        // This is the bread maker!
        const brand = product.title.split(" ")[0]; // e.g., "Cuisinart"

        await updateDoc(doc(db, "products", docSnap.id), {
          title: `${brand} Automatic Bread Maker`,
          description: `The ${brand} automatic bread maker makes fresh homemade bread effortless. Features programmable settings, multiple loaf sizes, and crust color options. Perfect for baking bread, dough, jam, and more with one-touch convenience.`,
        });

        productName = product.title;
        fixed = true;
        break;
      }
    }

    if (fixed) {
      return NextResponse.json({
        success: true,
        message: `Fixed: ${productName} → Bread Maker`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No matching product found",
      });
    }
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
