import React, { useState, useEffect } from "react";
import Contest1 from "./Contest1";

function Carousel() {
  const slides = [
    {
      id: 1,
      // image: "https://picsum.photos/id/1018/1600/900",
      title: "Welcome",
    },
    {
      id: 2,
      image: "https://picsum.photos/id/1015/1600/900",
      title: "Discover",
    },
    {
      id: 3,
      image: "https://picsum.photos/id/1019/1600/900",
      title: "Enjoy",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full h-screen flex-shrink-0 relative"
          >
            {slide.id === 1 ? (
              <Contest1 />
            ) : (
              <>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />

                {/* Optional Overlay Text */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h1 className="text-white text-3xl md:text-6xl font-bold">
                    {slide.title}
                  </h1>
                </div>
              </>
            )}
          </div>
        ))}
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
