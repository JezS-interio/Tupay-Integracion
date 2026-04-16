'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FirestoreProduct } from '@/types/product';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function EditProductsPage() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [brand, setBrand] = useState('');
  const [docId, setDocId] = useState('');

  // Load all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);

        const allProducts = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data(),
        })) as (FirestoreProduct & { docId: string })[];

        setProducts(allProducts);

        if (allProducts.length > 0) {
          const firstProduct = allProducts[0];
          setTitle(firstProduct.title || '');
          setDescription(firstProduct.description || '');
          setPrice(firstProduct.price || 0);
          setDiscountedPrice(firstProduct.discountedPrice || 0);
          setBrand(firstProduct.brand || '');
          setDocId(firstProduct.docId);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Update form when current product changes
  useEffect(() => {
    if (products.length > 0 && currentIndex < products.length) {
      const currentProduct = products[currentIndex] as FirestoreProduct & { docId: string };
      setTitle(currentProduct.title || '');
      setDescription(currentProduct.description || '');
      setPrice(currentProduct.price || 0);
      setDiscountedPrice(currentProduct.discountedPrice || 0);
      setBrand(currentProduct.brand || '');
      setDocId(currentProduct.docId);
    }
  }, [currentIndex, products]);

  const handleSave = async () => {
    if (!docId) {
      toast.error('No product ID');
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'products', docId);
      await updateDoc(docRef, {
        title,
        description,
        price,
        discountedPrice,
        brand,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      const updatedProducts = [...products];
      updatedProducts[currentIndex] = {
        ...updatedProducts[currentIndex],
        title,
        description,
        price,
        discountedPrice,
        brand,
      };
      setProducts(updatedProducts);

      toast.success('✓ Producto actualizado');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSave();
    if (currentIndex < products.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No hay productos para editar</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex] as FirestoreProduct & { docId: string };
  const imageUrl = currentProduct.imgs?.previews?.[0] || currentProduct.img || '/images/placeholder.png';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark mb-2">Editar Productos</h2>
        <p className="text-gray-600">Edita títulos y descripciones uno por uno</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Progreso</p>
            <p className="text-2xl font-bold text-dark">
              {currentIndex + 1} de {products.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Categoría</p>
            <p className="text-lg font-medium text-dark">{currentProduct.category}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Product Editor */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Imagen del Producto</h3>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={currentProduct.title}
                width={300}
                height={300}
                className="object-contain"
              />
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>ID:</strong> {currentProduct.id}</p>
              <p><strong>SKU:</strong> {currentProduct.sku}</p>
              <p><strong>Categoría:</strong> {currentProduct.category}</p>
              <p><strong>Stock:</strong> {currentProduct.stock || 0}</p>
            </div>
          </div>

          {/* Edit Form */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Editar Información</h3>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Título del Producto
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                  placeholder="Ingresa el título del producto"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {title.length} caracteres
                </p>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                  placeholder="Ingresa la marca del producto"
                />
              </div>

              {/* Price and Discounted Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Precio Original ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Precio con Descuento ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Discount Percentage Display */}
              {price > 0 && discountedPrice > 0 && discountedPrice < price && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Descuento:</strong> {(((price - discountedPrice) / price) * 100).toFixed(0)}% de ahorro
                    (${(price - discountedPrice).toFixed(2)} menos)
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent resize-none"
                  placeholder="Ingresa la descripción del producto"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {description.length} caracteres
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>

                <button
                  onClick={handleSaveAndNext}
                  disabled={saving || currentIndex === products.length - 1}
                  className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving ? 'Guardando...' : '💾 Guardar y Siguiente →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-dark rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              ← Anterior
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">Producto {currentIndex + 1} de {products.length}</p>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === products.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-dark rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Consejo:</strong> Usa los botones de navegación para moverte entre productos.
          Presiona "Guardar y Siguiente" para avanzar automáticamente después de guardar.
        </p>
      </div>
    </div>
  );
}
