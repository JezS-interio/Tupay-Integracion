"use client";
import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function FormSection({ title, children }: Props) {
  return (
    <section className="bg-white shadow-sm rounded-md p-6 mb-6">
      <h3 className="inline-block bg-gray-800 text-white text-xs px-3 py-1 rounded-full mb-4">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
