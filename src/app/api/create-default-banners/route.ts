import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, addDoc, query, where, limit, serverTimestamp } from "firebase/firestore";

export async function POST() {
  try {
    // Get 3 featured products to create banners from
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      limit(3)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "No featured products found to create banners",
      });
    }

    const banners = [];
    let order = 1;

    for (const doc of snapshot.docs) {
      const product = doc.data();
      const imageUrl = product.imgs?.previews?.[0] || product.img || "/images/placeholder.png";
      const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

      const bannerData = {
        title: product.title,
        subtitle: discount > 0 ? `${discount}% OFF - Limited Time` : "Premium Quality Product",
        description: product.description || "Amazing deal on this premium product!",
        imageUrl: imageUrl,
        buttonText: "Shop Now",
        buttonLink: `/shop-details?id=${product.id}`,
        badge: discount > 0 ? "HOT DEAL" : "FEATURED",
        order: order,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "banners"), bannerData);
      banners.push(bannerData);
      order++;
    }

    return NextResponse.json({
      success: true,
      message: `Created ${banners.length} banners from featured products`,
      banners: banners.map((b, i) => ({
        title: b.title,
        order: i + 1,
      })),
    });
  } catch (error: any) {
    console.error("Error creating banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
