import React from "react";

function Contest3() {
  const leaderboard = [
    { rank: 1, name: "Priya Sinha", tickets: 264, prizePoints: 15600, badge: "Lucky Streak" },
    { rank: 2, name: "Aditya Rao", tickets: 241, prizePoints: 14840, badge: "Rapid Spinner" },
    { rank: 3, name: "Mehak Jain", tickets: 223, prizePoints: 13910, badge: "Gold Collector" },
  ];

  return (
    <div className="w-full h-full bg-white p-2 md:p-4 overflow-hidden flex items-center justify-center">
      <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-[#4f0303] shadow-2xl">
        <div className="h-full grid grid-cols-2 gap-4 p-4 bg-[#5e0308]">
          <section className="relative rounded-2xl p-6 md:p-8 overflow-hidden bg-[radial-gradient(circle_at_bottom_right,_#f2bf21_0%,_#7e0a10_28%,_#62070b_58%,_#4f0307_100%)] border-2 border-[#8f141b]">
            <div className="absolute -left-12 top-8 w-56 h-56 rounded-full border-[14px] border-[#f5c034] bg-[conic-gradient(from_0deg,#ef1616_0_12%,#fff7e6_12%_24%,#ef1616_24%_36%,#fff7e6_36%_48%,#ef1616_48%_60%,#fff7e6_60%_72%,#ef1616_72%_84%,#fff7e6_84%_100%)] shadow-xl" />
            <div className="absolute -top-3 right-4 w-12 h-12 rounded-full bg-[#f5c034] opacity-90" />
            <div className="absolute bottom-8 right-10 w-7 h-7 rounded-full bg-[#f5c034] opacity-80" />
            <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full border-4 border-[#f5c034] opacity-70" />

            <div className="relative z-10 pl-36 pt-8">
              <h2 className="text-white text-5xl md:text-6xl font-black uppercase leading-none tracking-wide">
                Exciting Raffle
              </h2>
              <h1 className="mt-2 text-[#ffeb1c] text-7xl md:text-8xl font-black uppercase leading-none tracking-wide">
                Giveaway
              </h1>
              <p className="mt-3 text-[#f6d9b5] text-3xl md:text-4xl font-semibold uppercase">
                "Spin the luck, win big!"
              </p>
            </div>

            <div className="relative z-10 mt-10 px-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-full bg-[#f6f2e9] text-[#53150d] text-center py-2.5 text-3xl md:text-4xl font-bold">
                  20 June 2027
                </div>
                <div className="rounded-full bg-[#f6f2e9] text-[#53150d] text-center py-2.5 text-3xl md:text-4xl font-bold">
                  2:00 PM
                </div>
              </div>
              <div className="mt-3 rounded-full bg-[#ffe900] text-[#5a2b00] text-center py-2.5 text-3xl md:text-4xl font-extrabold">
                123 Anywhere St., Any City
              </div>
            </div>

            <div className="relative z-10 mt-20 text-center">
              <p className="text-white text-5xl md:text-6xl font-black uppercase tracking-wide">
                - Grand Prize -
              </p>
              <p className="text-[#ffeb1c] text-8xl md:text-9xl font-black leading-none mt-2">
                $1,234,56
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-[#f8f6fc] border-2 border-[#ded9eb] p-4 md:p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-[#351c55] text-3xl md:text-5xl font-black uppercase">Top 3</h3>
              <span className="px-3 py-1 rounded-full bg-[#5f3c95] text-white text-xs md:text-sm font-bold">
                Manual Data
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
                        <p className="text-[#221c2f] text-lg md:text-2xl font-bold">{item.name}</p>
                        <p className="text-[#6a5a82] text-xs md:text-sm">
                          Tickets: {item.tickets} | {item.badge}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#5f3c95] text-xl md:text-3xl font-black">{item.prizePoints}</p>
                      <p className="text-[#6a5a82] text-xs md:text-sm uppercase font-semibold">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <div className="rounded-xl bg-[#351c55] text-white px-4 py-3 flex items-center justify-between">
                <span className="text-sm md:text-base font-semibold">Next Update</span>
                <span className="text-[#f2d05e] text-sm md:text-base font-bold">10:00 PM</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Contest3;
