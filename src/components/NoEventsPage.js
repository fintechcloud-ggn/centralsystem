import React, { useEffect, useState } from "react";

const THOUGHTFUL_QUOTES = [
  "Small, steady steps often build the strongest futures.",
  "Kindness in ordinary moments leaves an extraordinary mark.",
  "Progress grows quietly when purpose meets patience.",
  "The best teams rise by helping each other move forward.",
  "A calm mind and a committed heart can change any day.",
  "Great work begins with sincerity and is sustained by discipline.",
  "Even on a quiet day, character continues to speak loudly.",
  "Meaningful success is built through consistency, humility, and care.",
];

function NoEventsPage({
  quoteText,
  imageSrc,
  autoRotate = true
}) {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * THOUGHTFUL_QUOTES.length)
  );

  useEffect(() => {
    if (!autoRotate || quoteText) {
      return undefined;
    }

    const displayTimer = setInterval(() => {
      setQuoteIndex((currentIndex) => {
        if (THOUGHTFUL_QUOTES.length <= 1) {
          return currentIndex;
        }

        let nextIndex = currentIndex;

        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * THOUGHTFUL_QUOTES.length);
        }

        return nextIndex;
      });
    }, 10000);

    return () => {
      clearInterval(displayTimer);
    };
  }, [autoRotate, quoteText]);

  const displayedQuote = quoteText || THOUGHTFUL_QUOTES[quoteIndex];
  const displayedImage = imageSrc || "/sachin mittal.jpeg";

  return (
    <div className="relative flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f3ea,_#e6ded0_45%,_#d4cab9_100%)]">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[8%] top-[10%] h-32 w-32 rounded-full bg-white blur-3xl sm:h-40 sm:w-40 lg:h-56 lg:w-56" />
        <div className="absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full bg-[#b9985b] blur-3xl sm:h-52 sm:w-52 lg:h-72 lg:w-72" />
      </div>

      <div className="relative z-10 grid h-full w-full items-center gap-4 overflow-hidden border border-white/40 bg-white/45 px-4 py-4 shadow-[0_30px_90px_rgba(49,37,18,0.12)] backdrop-blur-md sm:gap-5 sm:px-5 sm:py-5 md:grid-cols-[minmax(280px,42vw)_1fr] md:items-stretch md:px-8 lg:grid-cols-[minmax(320px,38vw)_1fr] lg:gap-10 lg:px-10 lg:py-6 xl:px-14">
        <div className="mx-auto flex h-[42dvh] w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/70 bg-[#ece7de] shadow-[0_18px_50px_rgba(82,59,28,0.18)] sm:h-[46dvh] md:h-[calc(100dvh-3rem)] md:max-h-[88dvh] md:max-w-none">
          <img
            src={displayedImage}
            alt="Portrait"
            className="h-full min-h-[320px] w-full object-cover object-center"
          />
        </div>

        <div className="flex min-h-0 flex-col justify-center px-1 text-center md:px-4 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#8f6f3e] sm:text-base lg:text-lg">
            Fintech Cloud
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase leading-[0.92] tracking-[0.06em] text-[#2f2417] sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.6rem]">
            Thought Of The Day
          </h1>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#b9985b] sm:mt-6 sm:w-24 md:w-28 lg:mt-8 lg:w-32" />
          <div className="mx-auto mt-5 flex min-h-[9rem] w-full max-w-[46ch] items-center justify-center px-3 sm:min-h-[10rem] sm:max-w-[50ch] md:min-h-[11.5rem] md:max-w-[56ch] lg:mt-8 lg:min-h-[13rem] lg:max-w-[62ch]">
            <p
              className="text-center text-lg font-medium tracking-[0.02em] text-[#4f4130] sm:text-2xl md:text-[1.8rem] lg:text-[2.1rem] xl:text-[2.4rem]"
              style={{ lineHeight: 1.35 }}
            >
              "{displayedQuote}"
            </p>
          </div>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#8b7a63] sm:text-sm md:mt-8 lg:text-base">
            A quiet day, a meaningful reminder
          </p>
        </div>
      </div>
    </div>
  );
}

export default NoEventsPage;
