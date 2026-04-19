import React from "react";
import { formatContestDate, formatContestTime } from "./contestDateTime";

function Contest2({ previewData }) {
  const contestDate = formatContestDate(previewData?.ends_on);
  const contestTime = formatContestTime(previewData?.ends_on);
  const leaders = [
    {
      rank: 1,
      name: previewData?.first_place || "Winner 1",
      points: previewData?.first_points || 0,
      uploads: previewData?.first_entries || 0,
      badge: "Winner",
    },
    {
      rank: 2,
      name: previewData?.second_place || "Winner 2",
      points: previewData?.second_points || 0,
      uploads: previewData?.second_entries || 0,
      badge: "Runner Up",
    },
    {
      rank: 3,
      name: previewData?.third_place || "Winner 3",
      points: previewData?.third_points || 0,
      uploads: previewData?.third_entries || 0,
      badge: "Runner Up",
    },
  ];

  return (
    <div className="w-full h-full bg-white p-2 md:p-4 overflow-hidden flex items-center justify-center">
      <div className="w-full h-full rounded-2xl bg-[#efe5d7] border-4 border-[#d9d0c4] shadow-2xl overflow-hidden">
        <div className="h-full grid grid-cols-2 gap-4 p-4 md:p-5">
          <section className="relative rounded-2xl bg-[#f8f5ef] border-2 border-[#e8dfd2] px-4 md:px-8 py-5 md:py-7 flex flex-col">
            <div className="absolute -top-2 left-8 w-20 h-3 bg-[#efe5d7] rotate-[-3deg]" />
            <div className="absolute -top-2 right-8 w-20 h-3 bg-[#efe5d7] rotate-[3deg]" />

            <div className="mx-auto text-center">
              <h2 className="text-[#f2643a] text-4xl md:text-6xl font-black uppercase tracking-wide leading-none">
                {previewData?.title || "Photography"}
              </h2>
              <h1 className="mt-1 text-black text-5xl md:text-7xl font-black uppercase leading-none">
                Contest
              </h1>
            </div>

            <p className="mt-8 text-center text-[#f2643a] text-2xl md:text-4xl font-extrabold leading-tight">
              {previewData?.description ||
                "Join the Challenge & Show Your Talent!"}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
              <div className="md:col-span-2">
                <p className="text-[#8f7fbe] text-xl md:text-3xl font-extrabold leading-tight">
                  Join the contest
                  <br />
                  submit your best entry
                  <br />
                  and become the winner!
                </p>
                <div className="mt-3 w-full h-[2px] bg-[#d9cc67]" />
                <p className="mt-3 text-[#4f4a44] text-sm md:text-lg">
                  Visit reallygreatsite.com to learn more about this contest.
                </p>
              </div>

              <div className="mx-auto w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#2f2531] text-white flex flex-col items-center justify-center rotate-[-8deg] border-4 border-[#f8f5ef] shadow-lg">
                <span className="text-[10px] md:text-xs uppercase font-semibold tracking-wide">
                  Submit before
                </span>
                <span className="text-xl md:text-2xl font-black leading-tight text-center px-2">
                  {contestDate || "15/06/2027"}
                </span>
                <span className="mt-1 text-xs md:text-sm font-semibold uppercase tracking-wide">
                  {contestTime || "6:30 PM"}
                </span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t-2 border-[#ded4c6] flex items-center justify-between text-[#221f1d]">
              <div className="font-black uppercase text-sm md:text-base">
                Talent
                <br />
                Showcase
              </div>
              <div className="text-xs md:text-sm font-semibold text-right">
                +123-123-1234| www.FintechCloud.com
                <br />
                Register now and join the contest.
              </div>
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
              {leaders.map((item) => (
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
                          Uploads: {item.uploads} | {item.badge}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#5f3c95] text-xl md:text-3xl font-black">
                        {item.points}
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
                  09:00 PM
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Contest2;
