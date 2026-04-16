import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intitech | Soluciones Tecnológicas",
  description: "Intitech - Tu tienda de tecnología y soluciones innovadoras en Lima, Perú",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
