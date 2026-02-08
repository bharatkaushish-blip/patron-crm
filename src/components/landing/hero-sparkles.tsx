"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export function HeroSparkles() {
  return (
    <div className="w-full absolute inset-0 h-full">
      <SparklesCore
        id="tsparticleslandingpage"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={80}
        className="w-full h-full"
        particleColor="#FFFFFF"
        speed={1}
      />
    </div>
  );
}
