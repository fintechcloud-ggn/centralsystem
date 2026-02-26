import React, { useState, useEffect } from "react";
import Contest1 from "./Contest1";
import Contest2 from "./Contest2";
import Contest3 from "./Contest3";

function Carousel() {
  const slides = [
    {
      id: 1,
      component: Contest1,
    },
    {
      id: 2,
      component: Contest2,
    },
    {
      id: 3,
      component: Contest3,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">

      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => {
          const SlideComponent = slide.component;
          return (
            <div
              key={slide.id}
              className="w-full h-[100dvh] flex-shrink-0 relative"
            >
              <SlideComponent />
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 w-full flex justify-center space-x-3">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full cursor-pointer transition-all duration-300 ${
              currentIndex === index
                ? "bg-white scale-125"
                : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
