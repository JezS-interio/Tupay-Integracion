import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function GET() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const products: any[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      products.push({
        docId: docSnap.id,
        id: data.id,
        title: data.title,
        category: data.category,
        brand: data.brand,
        imageUrl: data.imgs?.previews?.[0] || data.img || "/images/placeholder.png",
        price: data.price,
        discountedPrice: data.discountedPrice,
        description: data.description,
      });
    }

    // Sort by ID for consistent ordering
    products.sort((a, b) => a.id - b.id);

    return NextResponse.json({
      success: true,
      products: products,
      total: products.length,
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

export async function POST(request: Request) {
  try {
    const { docId, updates } = await request.json();

    if (!docId || !updates) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing docId or updates",
        },
        { status: 400 }
      );
    }

    await updateDoc(doc(db, "products", docId), updates);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
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
