"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { selectCartItems, selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { deleteAbandonedCart } from "@/lib/firebase/abandoned-carts";
import { createOrder } from "@/lib/firebase/orders";
import { ShippingAddress } from "@/types/order";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";

const Pagar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectTotalPrice);
  const [loading, setLoading] = useState(false);
  const shippingFee = 15.0;
  const tax = cartTotal * 0.1; // 10% tax
  const total = cartTotal + shippingFee + tax;

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Por favor inicia sesión para completar tu pedido");
      router.push("/signin");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    setLoading(true);

    try {
      // Extract form data
      const formData = new FormData(e.target as HTMLFormElement);

      const shippingAddress: ShippingAddress = {
        fullName: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email') as string || user.email || '',
        phone: formData.get('phone') as string || '',
        address: formData.get('address') as string || '',
        city: formData.get('town') as string || '',
        state: formData.get('country') as string || '',
        zipCode: '',
        country: formData.get('countryName') as string || 'USA',
      };

      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        discountedPrice: item.discountedPrice,
        quantity: item.quantity,
        img: item.imgs?.previews?.[0] || item.imgs?.thumbnails?.[0],
      }));

      // Create order in Firestore
      const orderId = await createOrder({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email?.split('@')[0] || 'Customer',
        items: orderItems,
        subtotal: cartTotal,
        shipping: shippingFee,
        tax: tax,
        total: total,
        shippingAddress,
        orderStatus: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'Cash on Delivery', // Default for now
        notes: formData.get('notes') as string || '',
      });

      // Send order confirmation email
      const emailResponse = await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shippingAddress.email,
          userName: shippingAddress.fullName,
          orderNumber: orderId,
          orderDate: new Date().toLocaleDateString(),
          items: orderItems.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.discountedPrice,
            image: item.img,
          })),
          subtotal: cartTotal,
          shipping: shippingFee,
          total: total,
          shippingAddress,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send order confirmation email');
        // Don't block checkout if email fails
      }

      // Delete abandoned cart record
      if (user.email) {
        await deleteAbandonedCart(user.email);
      }

      // Clear cart
      dispatch(removeAllItemsFromCart());

      toast.success(`Order #${orderId} placed successfully! Check your email for confirmation.`);

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Pagar error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Pagar"} pages={["Pagar"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handlePagar}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing />

                {/* <!-- address box two --> */}
                <Shipping />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Notas Adicionales (opcional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notas sobre tu pedido, ej. instrucciones especiales para la entrega."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Tu Pedido
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Producto</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* Cart items from Redux */}
                    {cartItems.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-dark-5">Tu carrito está vacío</p>
                      </div>
                    ) : (
                      <>
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                            <div>
                              <p className="text-dark">
                                {item.title} {item.quantity > 1 && `x ${item.quantity}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-dark text-right">
                                ${(item.discountedPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Shipping Fee */}
                        <div className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">Costo de Envío</p>
                          </div>
                          <div>
                            <p className="text-dark text-right">${shippingFee.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Tax */}
                        <div className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">Impuesto (10%)</p>
                          </div>
                          <div>
                            <p className="text-dark text-right">${tax.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between pt-5">
                          <div>
                            <p className="font-medium text-lg text-dark">Total</p>
                          </div>
                          <div>
                            <p className="font-medium text-lg text-dark text-right">
                              ${total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0 || !user}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Procesando..." : cartItems.length === 0 ? "Carrito Vacío" : !user ? "Iniciar Sesión para Pagar" : "Proceder al Pago"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Pagar;
