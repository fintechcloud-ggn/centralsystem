import React from "react";
import { formatContestDate } from "./contestDateTime";

export default function Contest4({ previewData }) {
  return (
    <div className="flex min-h-full w-full items-center justify-center overflow-y-auto bg-[#111827] p-4 text-white">
      <div className="w-full max-w-5xl rounded-2xl border border-white/15 bg-white/10 p-5 text-center shadow-2xl backdrop-blur sm:rounded-[28px] md:p-10 2xl:max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#fbbf24]">
          Live Contest
        </p>
        <h1 className="mt-4 break-words text-3xl font-black uppercase tracking-wide sm:text-4xl md:text-7xl 2xl:text-8xl">
          {previewData?.title || "Contest"}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/75 md:text-xl">
          {previewData?.description ||
            "Participate, score points, and climb the leaderboard."}
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            ["1st", previewData?.first_place || "Winner 1", previewData?.first_points || 0],
            ["2nd", previewData?.second_place || "Winner 2", previewData?.second_points || 0],
            ["3rd", previewData?.third_place || "Winner 3", previewData?.third_points || 0],
          ].map(([rank, name, points]) => (
            <div key={rank} className="rounded-2xl bg-white/12 p-4">
              <p className="text-2xl font-black text-[#fbbf24]">{rank}</p>
              <p className="mt-2 text-lg font-bold">{name}</p>
              <p className="text-sm text-white/70">{points} points</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Ends {formatContestDate(previewData?.ends_on) || "Soon"}
        </p>
      </div>
    </div>
  );
}
