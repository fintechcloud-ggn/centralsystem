import React, { useEffect, useState } from "react";
import NoEventsPage from "./NoEventsPage";
import QuoteTemplateRenderer from "./QuoteTemplates";
import { apiUrl } from "../lib/api";

const QUOTE_SLIDE_DURATION_MS = 30000;

function QuoteCarousel() {
  const [quotes, setQuotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(apiUrl("/api/quotes"))
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load quotes");
        }

        return data;
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          setQuotes([]);
          return;
        }

        setQuotes(data);
        setCurrentIndex(0);
      })
      .catch((error) => {
        console.error("Error fetching quotes:", error);
        setQuotes([]);
      });
  }, []);

  useEffect(() => {
    if (quotes.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
    }, QUOTE_SLIDE_DURATION_MS);

    return () => clearInterval(interval);
  }, [quotes.length]);

  if (quotes.length === 0) {
    return <NoEventsPage />;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="h-[100dvh] w-full flex-shrink-0 overflow-hidden"
          >
            <QuoteTemplateRenderer
              templateKey={quote.template_key || "template1"}
              quoteText={quote.quote_text}
              imageSrc={quote.image_url}
              autoRotate={false}
            />
          </div>
        ))}
      </div>

      {quotes.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {quotes.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                currentIndex === index ? "bg-[#b9985b] scale-125" : "bg-[#8b7a63]/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default QuoteCarousel;
