"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, query, where, writeBatch } from "firebase/firestore";
import Image from "next/image";

interface Product {
  firestoreId: string;
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  showInPromo?: boolean;
  imgs?: { previews?: string[] };
  img?: string;
}

export default function ManagePromoBannersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(
        collection(db, "products"),
        where("isActive", "==", true)
      );
      const snapshot = await getDocs(q);
      const prods = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        id: doc.data().id,
        title: doc.data().title,
        price: doc.data().price,
        discountedPrice: doc.data().discountedPrice,
        showInPromo: doc.data().showInPromo || false,
        imgs: doc.data().imgs,
        img: doc.data().img,
      }));

      // Sort: promo products first, then by title
      prods.sort((a, b) => {
        if (a.showInPromo && !b.showInPromo) return -1;
        if (!a.showInPromo && b.showInPromo) return 1;
        return a.title.localeCompare(b.title);
      });

      setProducts(prods);

      // Initialize selected IDs
      const initialSelected = new Set(
        prods.filter(p => p.showInPromo).map(p => p.firestoreId)
      );
      setSelectedIds(initialSelected);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (firestoreId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(firestoreId)) {
        newSet.delete(firestoreId);
      } else {
        if (newSet.size >= 3) {
          alert("Solo puedes seleccionar 3 productos máximo");
          return prev;
        }
        newSet.add(firestoreId);
      }
      return newSet;
    });
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);

      products.forEach(product => {
        const productRef = doc(db, "products", product.firestoreId);
        const shouldBeInPromo = selectedIds.has(product.firestoreId);
        batch.update(productRef, { showInPromo: shouldBeInPromo });
      });

      await batch.commit();
      alert("¡Cambios guardados exitosamente!");

      // Refresh products
      await fetchProducts();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error al guardar. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  const discount = (product: Product) =>
    Math.round(((product.price - product.discountedPrice) / product.price) * 100);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Gestionar Banners Promocionales</h1>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Gestionar Banners Promocionales</h1>
      <p className="text-gray-600 mb-6">
        Selecciona hasta 3 productos para mostrar en los banners promocionales de la página principal.
      </p>

      {/* Selected Count */}
      <div className="mb-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
        <p className="text-lg font-bold">
          📊 Productos seleccionados: {selectedIds.size} / 3
        </p>
      </div>

      {/* Products List with Checkboxes */}
      <div className="space-y-4 mb-8">
        {products.map((product) => {
          const isSelected = selectedIds.has(product.firestoreId);

          return (
            <div
              key={product.firestoreId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                border: isSelected ? '3px solid #16a34a' : '2px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: isSelected ? '#f0fdf4' : 'white',
                cursor: 'pointer',
              }}
              onClick={() => toggleSelection(product.firestoreId)}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(product.firestoreId)}
                style={{
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />

              {/* Product Image */}
              <div style={{ width: '80px', height: '80px', position: 'relative', flexShrink: 0 }}>
                <Image
                  src={product.imgs?.previews?.[0] || product.img || "/images/placeholder.png"}
                  alt={product.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 600, marginBottom: '4px', fontSize: '16px' }}>
                  {product.title}
                </h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>
                    S/ {product.discountedPrice.toFixed(0)}
                  </span>
                  {discount(product) > 0 && (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      {discount(product)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Selection Badge */}
              {isSelected && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  ✓ SELECCIONADO
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div style={{ position: 'sticky', bottom: '20px', zIndex: 50 }}>
        <button
          onClick={saveChanges}
          disabled={saving}
          style={{
            width: '100%',
            padding: '24px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: saving ? '#9ca3af' : '#2563eb',
            border: 'none',
            borderRadius: '12px',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }}
        >
          {saving ? "💾 Guardando..." : "💾 GUARDAR CAMBIOS"}
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        border: '2px solid #fbbf24',
        borderRadius: '8px',
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>ℹ️ Instrucciones:</h3>
        <ul style={{ marginLeft: '24px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>Haz clic en cualquier producto para seleccionarlo/deseleccionarlo</li>
          <li>Puedes seleccionar hasta 3 productos máximo</li>
          <li>Los productos seleccionados tendrán un borde verde</li>
          <li>Haz clic en "GUARDAR CAMBIOS" al final para aplicar los cambios</li>
        </ul>
      </div>
    </div>
  );
}
