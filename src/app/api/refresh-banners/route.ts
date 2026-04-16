import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, deleteDoc, addDoc, doc, query, where, limit, serverTimestamp } from "firebase/firestore";

export async function POST() {
  try {
    // Step 1: Delete all existing banners
    const bannersRef = collection(db, "banners");
    const bannersSnapshot = await getDocs(bannersRef);

    for (const bannerDoc of bannersSnapshot.docs) {
      await deleteDoc(doc(db, "banners", bannerDoc.id));
    }

    // Step 2: Get 3 featured products (with updated data)
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      limit(3)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "No featured products found",
      });
    }

    const banners = [];
    let order = 1;

    for (const productDoc of snapshot.docs) {
      const product = productDoc.data();
      const imageUrl = product.imgs?.previews?.[0] || product.img || "/images/placeholder.png";
      const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

      const bannerData = {
        title: product.title, // This will now have the updated title!
        subtitle: `${discount}% OFF - Limited Time`,
        description: product.description, // This will have the updated description!
        imageUrl: imageUrl,
        buttonText: "Shop Now",
        buttonLink: `/shop-details?id=${product.id}`,
        badge: "HOT DEAL",
        order: order,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "banners"), bannerData);
      banners.push({ title: bannerData.title, order });
      order++;
    }

    return NextResponse.json({
      success: true,
      message: `Refreshed ${banners.length} banners with latest product data`,
      banners: banners,
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
