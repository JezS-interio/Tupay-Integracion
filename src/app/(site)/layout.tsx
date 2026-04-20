"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { AuthProvider } from "../context/AuthContext";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import AbandonedCartTracker from "@/components/Common/AbandonedCartTracker";
import AuthCartSync from "@/components/Common/AuthCartSync";
import WishlistSync from "@/components/Common/WishlistSync";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <ReduxProvider>
              <AuthProvider>
                <CartModalProvider>
                  <ModalProvider>
                    <PreviewSliderProvider>
                    <AbandonedCartTracker />
                    <AuthCartSync />
                    <WishlistSync />
                    <Toaster
                      position="top-right"
                      containerStyle={{
                        top: '100px',
                        zIndex: 99999,
                      }}
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#fff',
                          color: '#1C274C',
                          padding: '16px',
                          borderRadius: '8px',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                        success: {
                          iconTheme: {
                            primary: '#22AD5C',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                    <Header />
                    {children}

                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                    <Footer />
                    </PreviewSliderProvider>
                  </ModalProvider>
                </CartModalProvider>
              </AuthProvider>
            </ReduxProvider>
            <ScrollToTop />
          </>
        )}
      </body>
    </html>
  );
}
