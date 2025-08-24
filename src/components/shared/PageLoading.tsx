"use client";

import Lottie from "lottie-react";
import loadingAnimation from "@/components/lottieAnimations/loading-animation.json";

export default function PageLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </div>
  );
}
