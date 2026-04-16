import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Envío Gratis",
    description: "Para pedidos sobre S/ 2000",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Devoluciones 1 & 1",
    description: "Cancelación después de 1 día",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "100% Pagos Seguros",
    description: "Garantizamos pagos seguros",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "Soporte 24/7",
    description: "En cualquier lugar y momento",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mt-10">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-4" key={key}>
            <Image src={item.img} alt="icons" width={40} height={41} />

            <div>
              <h3 className="font-medium text-lg text-dark whitespace-nowrap">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
