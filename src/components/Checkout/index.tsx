"use client";
import React, { useState } from "react";
import { encryptWithIzipayPublicKey } from "@/utils/izipay-encrypt";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { selectCartItems, selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { deleteAbandonedCart } from "@/lib/firebase/abandoned-carts";
import { deleteUserCart } from "@/lib/firebase/user-carts";
import { createOrder } from "@/lib/firebase/orders";
import { saveCheckoutAddress } from "@/lib/firebase/users";
import { ShippingAddress } from "@/types/order";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
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
  const [paymentMethod, setPaymentMethod] = useState("tupay");
  const [payerDocument, setPayerDocument] = useState("");
  const [documentType, setDocumentType] = useState("DNI");
  // ...existing code...
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

    // Validar documento para TuPay e Izipay

    if ((paymentMethod === "tupay" || paymentMethod === "izipay") && !payerDocument.trim()) {
      toast.error("Ingresa tu número de documento para pagar con " + (paymentMethod === "tupay" ? "TuPay" : "Izipay"));
      return;
    }
    // ...existing code...

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
        country: formData.get('countryName') as string || 'PE',
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
        paymentMethod: paymentMethod === 'tupay' ? 'TuPay' : 'Cash on Delivery',
        notes: formData.get('notes') as string || '',
      });

      // Delete abandoned cart record
      if (user.email) {
        await deleteAbandonedCart(user.email);
      }

      // Save address to user profile for future checkouts
      try {
        const nameParts = shippingAddress.fullName.trim().split(' ');
        await saveCheckoutAddress(user.uid, {
          firstName: formData.get('firstName') as string || nameParts[0] || '',
          lastName: formData.get('lastName') as string || nameParts.slice(1).join(' ') || '',
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          companyName: formData.get('companyName') as string || '',
          street: shippingAddress.address,
          streetTwo: formData.get('addressTwo') as string || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country || 'PE',
        });
      } catch (e) {
        console.error('Failed to save address:', e);
      }


      if (paymentMethod === 'tupay' || paymentMethod === 'izipay') {
        const nameParts = shippingAddress.fullName.trim().split(' ');
        const firstName = nameParts[0] || 'Cliente';
        const lastName = nameParts.slice(1).join(' ') || 'Cliente';

        if (paymentMethod === 'tupay') {
          // ...existing code...
          const paymentPayload = {
            orderId,
            amount: total.toFixed(2),
            currency: 'PEN',
            firstName,
            lastName,
            email: shippingAddress.email,
            documentType,
            phone: (() => { const c = (shippingAddress.phone || '').replace(/\D/g, '').replace(/^(0051|51)/, '').slice(0, 9); return c || undefined; })(),
          };
          const paymentRes = await fetch('/api/tupay/create-deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentPayload),
          });
          if (paymentMethod === 'tupay' || paymentMethod === 'izipay') {
            const nameParts = shippingAddress.fullName.trim().split(' ');
            const firstName = nameParts[0] || 'Cliente';
            const lastName = nameParts.slice(1).join(' ') || 'Cliente';

            if (paymentMethod === 'tupay') {
              // ...existing code...
              const paymentPayload = {
                orderId,
                amount: total.toFixed(2),
                currency: 'PEN',
                firstName,
                lastName,
                email: shippingAddress.email,
                documentType,
                phone: (() => { const c = (shippingAddress.phone || '').replace(/\D/g, '').replace(/^(0051|51)/, '').slice(0, 9); return c || undefined; })(),
              };
              const paymentRes = await fetch('/api/tupay/create-deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentPayload),
              });
              const paymentData = await paymentRes.json();
              if (!paymentRes.ok || !paymentData.redirect_url) {
                toast.error(paymentData.error || 'Error al iniciar el pago con TuPay. Intenta de nuevo.');
                setLoading(false);
                return;
              }
              dispatch(removeAllItemsFromCart());
              if (user?.uid) { try { await deleteUserCart(user.uid); } catch (_) {} }
              window.location.href = paymentData.redirect_url;
              return;
            }

            // Izipay: Link de pago
            try {
              const izipayLinkPayload = {
                orderId,
                amount: total.toFixed(2),
                currency: 'PEN',
                firstName,
                lastName,
                email: shippingAddress.email,
                documentType,
                document: payerDocument.trim(),
                phone: shippingAddress.phone,
                // Puedes agregar más campos si tu backend los requiere
              };
              const paymentRes = await fetch('/api/izipay/create-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(izipayLinkPayload),
              });
              const paymentData = await paymentRes.json();
              if (!paymentRes.ok || !paymentData.payment_url) {
                toast.error(paymentData.error || 'Error al iniciar el pago con Izipay. Intenta de nuevo.');
                setLoading(false);
                return;
              }
              dispatch(removeAllItemsFromCart());
              if (user?.uid) { try { await deleteUserCart(user.uid); } catch (_) {} }
              window.location.href = paymentData.payment_url;
              return;
            } catch (err) {
              toast.error('Error al procesar el pago con Izipay.');
              setLoading(false);
              return;
            }
        // ...existing code...
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
                {/* <!-- billing details --> */}
                <Billing />
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
                <PaymentMethod
                  selectedPayment={paymentMethod}
                  onPaymentChange={setPaymentMethod}
                  document={payerDocument}
                  onDocumentChange={setPayerDocument}
                  documentType={documentType}
                  onDocumentTypeChange={setDocumentType}
                />
                {/* ...campos de tarjeta eliminados para Izipay, ya no se muestran... */}

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0 || !user}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Procesando..."
                    : cartItems.length === 0
                    ? "Carrito Vacío"
                    : !user
                    ? "Iniciar Sesión para Pagar"
                    : paymentMethod === "tupay"
                    ? "Pagar con TuPay"
                    : "Confirmar Pedido"}
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
