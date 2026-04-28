import React, { useEffect, useState } from "react";

const THOUGHTFUL_QUOTES = [
  "Small, steady steps often build the strongest futures.",
  "Kindness in ordinary moments leaves an extraordinary mark.",
  "Progress grows quietly when purpose meets patience.",
  "The best teams rise by helping each other move forward.",
  "A calm mind and a committed heart can change any day.",
  "Great work begins with sincerity and is sustained by discipline.",
  "Even on a quiet day, character continues to speak loudly.",
  "Meaningful success is built through consistency, humility, and care."
];

const DEFAULT_IMAGE = "/sachin mittal.jpeg";

const useDisplayedQuote = ({ quoteText, autoRotate }) => {
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

    return () => clearInterval(displayTimer);
  }, [autoRotate, quoteText]);

  return quoteText || THOUGHTFUL_QUOTES[quoteIndex];
};

function QuoteTemplateOne({ quoteText, imageSrc, autoRotate = true }) {
  const displayedQuote = useDisplayedQuote({ quoteText, autoRotate });
  const displayedImage = imageSrc || DEFAULT_IMAGE;

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

function QuoteTemplateTwo({ quoteText, imageSrc, autoRotate = true }) {
  const displayedQuote = useDisplayedQuote({ quoteText, autoRotate });
  const displayedImage = imageSrc || DEFAULT_IMAGE;

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[linear-gradient(130deg,#10253d_0%,#16395f_48%,#f1c27d_48%,#f6e9cb_100%)] px-4 py-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full border border-white/50" />
        <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
      </div>

      <div className="relative z-10 grid h-full w-full max-w-[1700px] items-center gap-5 rounded-[32px] border border-white/20 bg-[#0d1f33]/35 p-4 backdrop-blur-md md:grid-cols-[1.05fr_0.95fr] md:p-8 xl:p-10">
        <div className="order-2 flex min-h-0 flex-col justify-center text-center md:order-1 md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.6em] text-[#f8ddb0] sm:text-sm xl:text-base">
            Fintech Cloud
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[0.05em] text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem]">
            Daily
            <br />
            Reflection
          </h1>
          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-[#f1c27d] md:mx-0 xl:mt-7 xl:w-32" />
          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/10 px-5 py-6 shadow-[0_20px_60px_rgba(3,9,19,0.2)]">
            <p className="text-xl font-medium leading-[1.5] tracking-[0.01em] text-[#fff6e9] sm:text-2xl md:text-[2rem] lg:text-[2.35rem]">
              "{displayedQuote}"
            </p>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#d8c6a7] sm:text-sm">
            Pause. Reflect. Move forward.
          </p>
        </div>

        <div className="order-1 flex h-[38dvh] items-center justify-center md:order-2 md:h-full">
          <div className="relative h-full w-full max-w-[640px] overflow-hidden rounded-[34px] border border-white/35 bg-white/15 shadow-[0_24px_60px_rgba(6,17,29,0.32)]">
            <img
              src={displayedImage}
              alt="Quote portrait"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#081220]/80 to-transparent px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f8ddb0]">
                Thought For Today
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteTemplateThree({ quoteText, imageSrc, autoRotate = true }) {
  const displayedQuote = useDisplayedQuote({ quoteText, autoRotate });
  const displayedImage = imageSrc || DEFAULT_IMAGE;

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#f2eee5] px-4 py-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(182,146,92,0.2),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(90,72,54,0.12),transparent_28%)]" />
      <div className="relative z-10 grid h-full w-full max-w-[1700px] items-center gap-5 rounded-[30px] border border-[#d8d0c0] bg-[#fffdf8] p-4 shadow-[0_28px_80px_rgba(69,51,31,0.12)] md:grid-cols-[0.9fr_1.1fr] md:p-7 xl:p-10">
        <div className="flex min-h-0 flex-col justify-center rounded-[28px] bg-[#2c2520] p-4 text-white sm:p-5 md:h-full xl:p-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-[#d5b98b] sm:text-sm">
            Fintech Cloud
          </p>
          <div className="flex-1 overflow-hidden rounded-[24px] border border-white/10 bg-[#171311]">
            <img
              src={displayedImage}
              alt="Quote portrait"
              className="h-full min-h-[34dvh] w-full object-cover object-center md:min-h-0"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-center rounded-[28px] border border-[#e9dfd1] bg-[#fffaf1] p-5 text-center shadow-[inset_0_0_0_1px_rgba(201,182,154,0.24)] sm:p-6 md:h-full md:text-left xl:p-10">
          <div className="mx-auto md:mx-0">
            <p className="text-xs font-semibold uppercase tracking-[0.55em] text-[#a17945] sm:text-sm">
              Thought For Today
            </p>
            <div className="mt-5 h-1 w-20 rounded-full bg-[#c09c63] md:w-24" />
          </div>

          <div className="my-8 flex min-h-[10rem] items-center md:min-h-[14rem] xl:min-h-[18rem]">
            <p className="w-full text-2xl font-medium leading-[1.45] text-[#3f3428] sm:text-3xl md:text-[2.2rem] lg:text-[2.7rem] xl:text-[3.4rem]">
              "{displayedQuote}"
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8d7a61] sm:text-sm">
            Quiet thoughts. Clear direction.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuoteTemplateFour({ quoteText, imageSrc, autoRotate = true }) {
  const displayedQuote = useDisplayedQuote({ quoteText, autoRotate });
  const displayedImage = imageSrc || DEFAULT_IMAGE;

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#efe7d8_0%,#f8f3ea_48%,#ddd2c0_100%)] px-4 py-4">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-[6%] top-[10%] h-56 w-56 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute bottom-[8%] right-[10%] h-64 w-64 rounded-full bg-[#c3a06a]/30 blur-3xl" />
      </div>

      <div className="relative z-10 grid h-full w-full max-w-[1720px] gap-5 rounded-[34px] border border-white/50 bg-white/55 p-4 shadow-[0_30px_80px_rgba(79,59,28,0.15)] backdrop-blur-md md:grid-cols-[1.08fr_0.92fr] md:p-7 xl:p-10">
        <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#f4ecdf] shadow-[0_18px_50px_rgba(69,51,31,0.16)]">
          <img
            src={displayedImage}
            alt="Quote portrait"
            className="h-full min-h-[38dvh] w-full object-cover object-center"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2d2117]/80 via-[#2d2117]/25 to-transparent px-6 py-6 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#f0d8b1] sm:text-base">
              Fintech Cloud
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-center rounded-[30px] border border-[#eadfce] bg-[#fff9f1] px-5 py-6 text-center shadow-[inset_0_0_0_1px_rgba(212,194,167,0.32)] sm:px-7 md:px-8 xl:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.5em] text-[#9c7444] sm:text-base">
            Reflection Board
          </p>
          <h1 className="mt-5 text-4xl font-black uppercase leading-[0.92] tracking-[0.06em] text-[#2f2417] sm:text-5xl md:text-6xl xl:text-[5rem]">
            Thought
            <br />
            For Growth
          </h1>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#c29a5d] sm:w-28" />
          <div className="mx-auto mt-8 flex min-h-[11rem] w-full max-w-[18ch] items-center justify-center md:max-w-[20ch] xl:min-h-[14rem]">
            <p className="text-2xl font-medium leading-[1.45] tracking-[0.02em] text-[#554534] sm:text-3xl md:text-[2.2rem] xl:text-[2.8rem]">
              "{displayedQuote}"
            </p>
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.34em] text-[#8b7860] sm:text-sm">
            Everyday clarity builds lasting momentum.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuoteTemplateFive({ quoteText, imageSrc, autoRotate = true }) {
  const displayedQuote = useDisplayedQuote({ quoteText, autoRotate });
  const displayedImage = imageSrc || DEFAULT_IMAGE;

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#121a26] px-4 py-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(65,115,181,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(218,177,106,0.28),transparent_30%)]" />

      <div className="relative z-10 grid h-full w-full max-w-[1740px] gap-5 rounded-[34px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-md md:grid-cols-[0.88fr_1.12fr] md:p-7 xl:p-10">
        <div className="flex min-h-0 flex-col justify-between rounded-[30px] border border-white/10 bg-[#0f141d] p-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#d4b27a] sm:text-sm">
              Fintech Cloud
            </p>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-[0.05em] text-white sm:text-5xl md:text-6xl xl:text-[4.9rem]">
              Insight
              <br />
              Frame
            </h1>
          </div>

          <p className="mt-6 max-w-[22ch] text-sm font-medium leading-7 text-[#d6dbe4] sm:text-base md:text-lg">
            Thoughtful words paired with a strong visual focus for quiet display moments.
          </p>
        </div>

        <div className="grid min-h-0 gap-5 md:grid-rows-[1fr_auto]">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#1b2533] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
            <img
              src={displayedImage}
              alt="Quote portrait"
              className="h-full min-h-[38dvh] w-full object-cover object-center"
            />
          </div>

          <div className="rounded-[28px] border border-[#d4b27a]/30 bg-[#f8f1e5] px-5 py-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#9a7442] sm:text-sm">
              Thought For Today
            </p>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#c59a5b]" />
            <p className="mx-auto mt-6 max-w-[32ch] text-2xl font-medium leading-[1.5] text-[#352a20] sm:text-3xl md:text-[2.15rem] xl:text-[2.65rem]">
              "{displayedQuote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const QUOTE_TEMPLATE_OPTIONS = [
  { value: "template1", label: "Template One" },
  { value: "template2", label: "Template Two" },
  { value: "template3", label: "Template Three" },
  { value: "template4", label: "Template Four" },
  { value: "template5", label: "Template Five" }
];

export const getQuoteTemplateComponent = (templateKey) => {
  if (templateKey === "template2") return QuoteTemplateTwo;
  if (templateKey === "template3") return QuoteTemplateThree;
  if (templateKey === "template4") return QuoteTemplateFour;
  if (templateKey === "template5") return QuoteTemplateFive;
  return QuoteTemplateOne;
};

export default function QuoteTemplateRenderer(props) {
  const TemplateComponent = getQuoteTemplateComponent(props.templateKey);
  return <TemplateComponent {...props} />;
}
