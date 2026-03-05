import React, { useState, useEffect } from "react";
import Contest1 from "./Contest1";
import Contest2 from "./Contest2";
import Contest3 from "./Contest3";
import Contest4 from "./Contest4";

function Carousel() {
  const [contests, setContests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5001/api/contests")
      .then((res) => res.json())
      .then((data) => {
        //Do not show contest after end date
        const activeContests = data.filter(
          (contest) => new Date(contest.ends_on) >= new Date(),
        );

        setContests(activeContests);
      })
      .catch((err) => console.log(err));
  }, []);

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === contests.length - 1 ? 0 : prev + 1));
    }, 30000);

    return () => clearInterval(interval);
  }, [contests.length]);

  const getComponent = (design) => {
    if (design === "contest1") return Contest1;
    if (design === "contest2") return Contest2;
    if (design === "contest3") return Contest3;
    if (design === "contest4") return Contest4;
    return Contest1;
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {contests.map((contest) => {
          const SlideComponent = getComponent(contest.design_type);

          return (
            <div key={contest.id} className="w-full h-[100dvh] flex-shrink-0">
              <SlideComponent previewData={contest} />
            </div>
          );
        })}
      </div>

      {/* dots */}
      <div className="absolute bottom-6 w-full flex justify-center space-x-3">
        {contests.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? "bg-white scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
