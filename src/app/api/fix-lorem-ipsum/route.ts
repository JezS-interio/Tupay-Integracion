import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function POST() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    let fixedCount = 0;
    const fixedProducts: string[] = [];

    for (const docSnap of snapshot.docs) {
      const product = docSnap.data();
      let needsUpdate = false;
      const updates: any = {};

      // Check if title contains Lorem or generic placeholder
      if (
        product.title?.includes("Lorem") ||
        product.title?.includes("Ipsum") ||
        product.title?.includes("Product") === product.title
      ) {
        // Generate a proper title based on category
        const category = product.category || "Product";
        const brand = product.brand || "Generic";
        const id = product.id || Math.floor(Math.random() * 10000);

        if (category.includes("Smartphone") || category.includes("Phone")) {
          updates.title = `${brand} Smartphone ${id}`;
        } else if (category.includes("Kitchen")) {
          updates.title = `${brand} Kitchen Appliance ${id}`;
        } else if (category.includes("Home")) {
          updates.title = `${brand} Home Appliance ${id}`;
        } else {
          updates.title = `${brand} ${category} ${id}`;
        }

        needsUpdate = true;
      }

      // Check if description contains Lorem Ipsum
      if (
        product.description?.includes("Lorem") ||
        product.description?.includes("Ipsum") ||
        !product.description ||
        product.description.trim() === ""
      ) {
        // Generate a proper description based on category
        const title = updates.title || product.title;
        const brand = product.brand || "this";
        const category = product.category || "product";

        if (category.includes("Smartphone") || category.includes("Phone")) {
          updates.description = `The ${title} offers cutting-edge technology and premium features. Experience powerful performance, stunning display quality, and advanced camera capabilities. Perfect for staying connected and productive on the go.`;
        } else if (category.includes("Coffee")) {
          updates.description = `The ${title} brings barista-quality coffee to your home. Features programmable brewing, multiple cup sizes, and consistent temperature control. Enjoy delicious coffee with one-touch convenience.`;
        } else if (category.includes("Toaster")) {
          updates.description = `The ${title} ensures perfectly toasted bread every time. Features adjustable browning settings, extra-wide slots, and quick heating elements. Makes breakfast preparation fast and easy.`;
        } else if (category.includes("Blender")) {
          updates.description = `The ${title} delivers powerful blending for smoothies, soups, and more. Features multiple speed settings, durable blades, and easy-clean design. Perfect for healthy meal preparation.`;
        } else if (category.includes("Microwave")) {
          updates.description = `The ${title} provides quick and efficient cooking. Features multiple power levels, preset cooking modes, and spacious interior. Makes meal preparation fast and convenient.`;
        } else if (category.includes("Vacuum")) {
          updates.description = `The ${title} offers powerful suction and efficient cleaning. Features advanced filtration, multiple attachments, and easy maneuverability. Keeps your home spotlessly clean.`;
        } else if (category.includes("Air Fryer")) {
          updates.description = `The ${title} creates crispy, delicious food with little to no oil. Features precise temperature control, large capacity, and easy cleanup. Enjoy healthier versions of your favorite fried foods.`;
        } else if (category.includes("Bread")) {
          updates.description = `The ${title} makes fresh homemade bread effortless. Features programmable settings, multiple loaf sizes, and crust color options. Perfect for baking bread, dough, jam, and more.`;
        } else if (category.includes("Kitchen") || category.includes("Home")) {
          updates.description = `The ${title} combines quality craftsmanship with modern convenience. ${brand} brings reliable performance and user-friendly features to enhance your daily routine. Built to last with premium materials.`;
        } else {
          updates.description = `The ${title} offers premium quality and reliable performance. Features innovative design, durable construction, and user-friendly operation. Perfect for everyday use.`;
        }

        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(doc(db, "products", docSnap.id), updates);
        fixedProducts.push(updates.title || product.title);
        fixedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} products with Lorem Ipsum content`,
      fixedProducts: fixedProducts,
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
