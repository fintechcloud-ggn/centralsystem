import React, { useState, useEffect } from "react";
import Contest1 from "./Contest1";
import Contest2 from "./Contest2";
import Contest3 from "./Contest3";
import Contest4 from "./Contest4";
import QuoteCarousel from "./QuoteCarousel";
import { apiUrl } from "../lib/api";

const CONTEST_SLIDE_DURATION_MS = 30000;

function Carousel({ showFallback = false, onCycleComplete }) {
  const [contests, setContests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(apiUrl("/api/contests"))
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load contests");
        }
        return data;
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          setContests([]);
          return;
        }

        //Do not show contest after end date
        const activeContests = data.filter(
          (contest) => new Date(contest.ends_on) >= new Date(),
        );

        setContests(activeContests);
      })
      .catch((err) => {
        console.error("Error fetching contests:", err);
        setContests([]);
      });
  }, []);

  // auto slide
  useEffect(() => {
    if (contests.length === 0) {
      return undefined;
    }

    if (contests.length === 1) {
      if (!onCycleComplete) {
        return undefined;
      }

      const timeout = setTimeout(() => {
        onCycleComplete();
      }, CONTEST_SLIDE_DURATION_MS);

      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === contests.length - 1) {
          onCycleComplete?.();
          return 0;
        }

        return prev + 1;
      });
    }, CONTEST_SLIDE_DURATION_MS);

    return () => clearInterval(interval);
  }, [contests.length, onCycleComplete]);

  const getComponent = (design) => {
    if (design === "contest1") return Contest1;
    if (design === "contest2") return Contest2;
    if (design === "contest3") return Contest3;
    if (design === "contest4") return Contest4;
    return Contest1;
  };

  if (contests.length === 0) {
    if (showFallback) {
      return <QuoteCarousel />;
    }

    return <div className="h-[100dvh] w-full bg-[#f6f6f8]" />;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {contests.map((contest) => {
          const SlideComponent = getComponent(contest.design_type);

          return (
            <div key={contest.id} className="h-[100dvh] w-full flex-shrink-0 overflow-y-auto xl:overflow-hidden">
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
