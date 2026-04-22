import React from "react";
import { formatContestDate, formatContestTime } from "./contestDateTime";

function Contest3({ previewData }) {
  const contestDate = formatContestDate(previewData?.ends_on);
  const contestTime = formatContestTime(previewData?.ends_on);
  const leaderboard = [
    {
      rank: 1,
      name: previewData?.first_place || "Winner 1",
      tickets: previewData?.first_entries || 0,
      prizePoints: previewData?.first_points || 0,
      badge: "Top Player",
    },
    {
      rank: 2,
      name: previewData?.second_place || "Winner 2",
      tickets: previewData?.second_entries || 0,
      prizePoints: previewData?.second_points || 0,
      badge: "Runner Up",
    },
    {
      rank: 3,
      name: previewData?.third_place || "Winner 3",
      tickets: previewData?.third_entries || 0,
      prizePoints: previewData?.third_points || 0,
      badge: "Runner Up",
    },
  ];

  return (
    <div className="flex min-h-full w-full items-center justify-center overflow-y-auto bg-white p-2 md:p-4 xl:overflow-hidden">
      <div className="min-h-full w-full rounded-2xl border-4 border-[#4f0303] shadow-2xl xl:h-full xl:overflow-hidden">
        <div className="grid min-h-full grid-cols-1 gap-4 bg-[#5e0308] p-3 sm:p-4 xl:h-full xl:grid-cols-2">
          <section className="relative overflow-hidden rounded-2xl border-2 border-[#8f141b] bg-[radial-gradient(circle_at_bottom_right,_#f2bf21_0%,_#7e0a10_28%,_#62070b_58%,_#4f0307_100%)] p-4 sm:p-6 md:p-8">
            <div className="absolute -left-16 top-6 h-44 w-44 rounded-full border-[12px] border-[#f5c034] bg-[conic-gradient(from_0deg,#ef1616_0_12%,#fff7e6_12%_24%,#ef1616_24%_36%,#fff7e6_36%_48%,#ef1616_48%_60%,#fff7e6_60%_72%,#ef1616_72%_84%,#fff7e6_84%_100%)] shadow-xl sm:-left-12 sm:top-8 sm:h-56 sm:w-56 sm:border-[14px]" />
            <div className="absolute -top-3 right-4 w-12 h-12 rounded-full bg-[#f5c034] opacity-90" />
            <div className="absolute bottom-8 right-10 w-7 h-7 rounded-full bg-[#f5c034] opacity-80" />
            <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full border-4 border-[#f5c034] opacity-70" />
            <div className="relative z-10 pl-20 pt-6 sm:pl-36 sm:pt-8">
              <h2 className="text-3xl font-black uppercase leading-none tracking-wide text-white sm:text-4xl md:text-5xl">
                {previewData?.title || "Contest"}
              </h2>
              <h1 className="mt-2 text-[#ffeb1c] text-2xl md:text-2xl font-black uppercase leading-none tracking-wide">
               Compete. Create. Conquer.
              </h1>
               {/* <h1 className="mt-2 text-[#ffeb1c] text-2xl md:text-2xl font-black uppercase leading-none tracking-wide">
               Compete. Create. Conquer.
              </h1> */}
              <p className="mt-3 text-xl font-semibold uppercase text-[#f6d9b5] sm:text-2xl md:text-3xl">
                {previewData?.description || "Join the Challenge & Show Your Talent!"}
              </p>
            </div>

            <div className="relative z-10 mt-8 px-0 sm:px-4 md:mt-10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-full bg-[#f6f2e9] py-2.5 text-center text-2xl font-bold text-[#53150d] md:text-4xl">
                  {contestDate || "20/06/2027"}
                </div>
                {contestTime ? (
                  <div className="rounded-full bg-[#fff4bf] text-[#5a2b00] text-center py-2 text-xl md:text-2xl font-bold">
                    {contestTime}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 rounded-full bg-[#ffe900] text-[#5a2b00] text-center py-2.5 text-3xl md:text-4xl font-extrabold">
               Enter the Contest & Win Amazing Prizes!
              </div>
            </div>

            <div className="relative z-10 mt-12 text-center md:mt-20">
              <p className="text-3xl font-black uppercase tracking-wide text-white sm:text-5xl md:text-6xl">
                - Grand Prize -
              </p>
              <p className="mt-2 break-words text-5xl font-black leading-none text-[#ffeb1c] sm:text-7xl md:text-9xl">
                {previewData?.prize || "$0"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-[#f8f6fc] border-2 border-[#ded9eb] p-4 md:p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-[#351c55] text-3xl md:text-5xl font-black uppercase">
                Top 3
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#5f3c95] text-white text-xs md:text-sm font-bold">
                Live Contest
              </span>
            </div>

            <div className="mt-5 space-y-3 md:space-y-4">
              {leaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`rounded-xl border p-3 md:p-4 ${
                    item.rank === 1
                      ? "bg-[#fff5d6] border-[#f0c65d]"
                      : "bg-white border-[#e3deef]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-2xl font-black ${
                          item.rank === 1
                            ? "bg-[#f0c65d] text-[#40310b]"
                            : item.rank === 2
                              ? "bg-[#a1a7b8] text-white"
                              : "bg-[#c78c63] text-white"
                        }`}
                      >
                        {item.rank}
                      </div>
                      <div>
                        <p className="text-[#221c2f] text-lg md:text-2xl font-bold">
                          {item.name}
                        </p>
                        <p className="text-[#6a5a82] text-xs md:text-sm">
                          Tickets: {item.tickets} | {item.badge}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#5f3c95] text-xl md:text-3xl font-black">
                        {item.prizePoints}
                      </p>
                      <p className="text-[#6a5a82] text-xs md:text-sm uppercase font-semibold">
                        points
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <div className="rounded-xl bg-[#351c55] text-white px-4 py-3 flex items-center justify-between">
                <span className="text-sm md:text-base font-semibold">
                  Next Update
                </span>
                <span className="text-[#f2d05e] text-sm md:text-base font-bold">
                  10:00 PM
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Contest3;
