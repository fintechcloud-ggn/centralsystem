import React from "react";

function Contest1() {
  const steps = [
    {
      id: 1,
      title: "FOLLOW",
      text: "Follow our page to stay updated with every contest announcement.",
      icon: "U+",
    },
    {
      id: 2,
      title: "LIKE & COMMENT",
      text: "Like this post and drop your comment to confirm your entry.",
      icon: "L+C",
    },
    {
      id: 3,
      title: "SHARE",
      text: "Share this contest with friends to boost your winning chance.",
      icon: "OUT",
    },
  ];

  const leaderboard = [
    {
      position: 1,
      name: "Aarohi Singh",
      points: 9850,
      entries: 142,
      streak: "12 days",
    },
    {
      position: 2,
      name: "Rahul Verma",
      points: 9540,
      entries: 138,
      streak: "9 days",
    },
    {
      position: 3,
      name: "Sneha Kapoor",
      points: 9280,
      entries: 131,
      streak: "8 days",
    },
  ];

  return (
    <div className="w-full h-full bg-[#f6f6f8] flex items-center justify-center overflow-hidden p-2 md:p-4">
      <div className="relative w-full h-full rounded-2xl shadow-2xl bg-[#efeff1] border border-[#d9d9de] overflow-hidden flex flex-col">
        <div className="absolute -top-20 left-0 right-0 h-52 bg-[#5f0689] rotate-[-8deg] origin-left" />
        <div className="absolute top-28 -left-10 right-0 h-24 bg-white/90 rotate-[-7deg]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9),_rgba(220,220,225,0.75)_60%,_rgba(210,210,216,0.9))]" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-[#f2bb2f]" />

        <div className="relative z-10 h-full px-3 md:px-6 py-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6">
          <section className="w-full md:w-1/2 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-[1px] p-3 md:p-5 flex flex-col">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="relative inline-flex flex-col items-center">
                <div className="w-28 h-20 bg-[#ef2028] rounded-t-md border-b-4 border-[#b8030e] relative">
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 w-6 h-full bg-[#ffcc2f]" />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-8 border-8 border-[#ffcc2f] border-b-0 rounded-t-full" />
                </div>

                <div className="-mt-3 rotate-[-8deg] bg-[#62008d] text-white px-6 md:px-10 py-2 md:py-3 rounded-[28px] shadow-lg">
                  <h1 className="text-3xl md:text-4xl font-black tracking-wide italic uppercase">
                    Giveaway
                  </h1>
                </div>

                <div className="-mt-2 rotate-[-8deg] bg-[#f2bb2f] px-4 md:px-6 py-1.5 rounded-xl shadow">
                  <p className="text-black text-sm md:text-lg font-semibold italic uppercase">
                    Follow The Steps Below
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 md:mt-4 flex-1">
              {steps.map((step) => (
                <div key={step.id} className="relative text-center">
                  <div className="relative mx-auto w-20 md:w-24 h-16 md:h-20 rounded-[20px] bg-[#62008d] border-4 border-[#f4f4f7] flex items-center justify-center text-white shadow-lg">
                    <span className="text-xl md:text-2xl font-bold">{step.icon}</span>
                    <span className="absolute -top-4 -right-4 w-10 md:w-12 h-10 md:h-12 rounded-full bg-[#f41e2f] text-white font-black text-xl md:text-2xl flex items-center justify-center border-4 border-white">
                      {step.id}
                    </span>
                  </div>

                  <div className="mx-auto mt-2 max-w-xs bg-[#62008d] rounded-[14px] py-1 md:py-1.5 px-2 md:px-3 shadow">
                    <p className="text-white text-base md:text-lg font-extrabold italic uppercase">
                      {step.title}
                    </p>
                  </div>
                  <p className="mt-2 text-[#2b2b31] text-[11px] md:text-sm leading-4 md:leading-5 font-medium max-w-xs mx-auto">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 md:mt-4">
              <div className="mx-auto max-w-3xl rounded-3xl bg-[#62008d] border-4 border-[#f0f0f4] shadow-[8px_8px_0_rgba(0,0,0,0.15)] p-3 md:p-4 text-center">
                <p className="text-white uppercase tracking-wide font-extrabold text-lg md:text-3xl leading-tight">
                  You Have Until <span className="text-[#f2bb2f]">30 September</span>
                  <br />
                  Good Luck!
                </p>
                <p className="mt-1.5 text-[#dbd7e8] text-[11px] md:text-sm">
                  Don&apos;t miss your chance to win. Join now and complete all steps.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full md:w-1/2 rounded-2xl border border-[#d6d2e3] bg-[#f8f6fc]/95 p-4 md:p-6 flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[#2f1048] text-2xl md:text-4xl font-black uppercase tracking-wide">
                Live Rank
              </h2>
              <span className="rounded-full bg-[#62008d] text-white px-3 py-1 text-xs md:text-sm font-semibold">
                Manual Data
              </span>
            </div>
            <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              {leaderboard.map((player) => (
                <div
                  key={player.position}
                  className={`rounded-2xl border p-3 md:p-4 shadow-sm ${
                    player.position === 1
                      ? "bg-[#fff2cc] border-[#f2bb2f]"
                      : "bg-white border-[#ded9eb]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl ${
                          player.position === 1
                            ? "bg-[#f2bb2f] text-[#4a3400]"
                            : player.position === 2
                            ? "bg-[#9397a6]"
                            : "bg-[#c97a43]"
                        }`}
                      >
                        {player.position}
                      </div>
                      <div>
                        <p className="text-[#1f1a2b] text-lg md:text-2xl font-bold">
                          {player.name}
                        </p>
                        <p className="text-[#645577] text-xs md:text-sm">
                          Entries: {player.entries} | Streak: {player.streak}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#62008d] text-xl md:text-3xl font-black">
                        {player.points}
                      </p>
                      <p className="text-[#645577] text-xs md:text-sm font-semibold uppercase">
                        points
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <div className="rounded-xl bg-[#2f1048] text-white px-4 py-3 flex items-center justify-between">
                <span className="font-semibold text-sm md:text-base">Next Rank Refresh</span>
                <span className="text-[#f2bb2f] font-bold text-sm md:text-base">08:00 PM</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Contest1;
