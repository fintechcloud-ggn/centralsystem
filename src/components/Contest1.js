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

  return (
    <div className="w-full h-screen bg-[#f6f6f8] flex items-center justify-center p-3 md:p-6 overflow-hidden">
      <div className="relative w-full h-full max-w-6xl max-h-screen rounded-2xl shadow-2xl bg-[#efeff1] border border-[#d9d9de] overflow-hidden flex flex-col">
        <div className="absolute -top-20 left-0 right-0 h-52 bg-[#5f0689] rotate-[-8deg] origin-left" />
        <div className="absolute top-28 -left-10 right-0 h-24 bg-white/90 rotate-[-7deg]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9),_rgba(220,220,225,0.75)_60%,_rgba(210,210,216,0.9))]" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-[#f2bb2f]" />

        <div className="relative z-10 px-3 md:px-8 py-6 md:py-8 flex-1 flex flex-col">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative inline-flex flex-col items-center">
              <div className="w-28 h-20 bg-[#ef2028] rounded-t-md border-b-4 border-[#b8030e] relative">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-6 h-full bg-[#ffcc2f]" />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-8 border-8 border-[#ffcc2f] border-b-0 rounded-t-full" />
              </div>

              <div className="-mt-3 rotate-[-8deg] bg-[#62008d] text-white px-6 md:px-14 py-2.5 md:py-4 rounded-[28px] shadow-lg">
                <h1 className="text-3xl md:text-6xl font-black tracking-wide italic uppercase">
                  Giveaway
                </h1>
              </div>

              <div className="-mt-2 rotate-[-8deg] bg-[#f2bb2f] px-4 md:px-8 py-1.5 md:py-2 rounded-xl shadow">
                <p className="text-black text-sm md:text-2xl font-semibold italic uppercase">
                  Follow The Steps Below
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-4 md:mt-8 flex-1">
            {steps.map((step) => (
              <div key={step.id} className="relative text-center">
                <div className="relative mx-auto w-24 md:w-28 h-20 md:h-24 rounded-[22px] bg-[#62008d] border-4 border-[#f4f4f7] text-4xl flex items-center justify-center text-white shadow-lg">
                  <span className="text-2xl md:text-3xl font-bold">{step.icon}</span>
                  <span className="absolute -top-4 -right-4 w-12 md:w-14 h-12 md:h-14 rounded-full bg-[#f41e2f] text-white font-black text-2xl md:text-3xl flex items-center justify-center border-4 border-white">
                    {step.id}
                  </span>
                </div>

                <div className="mx-auto mt-3 max-w-xs bg-[#62008d] rounded-[14px] py-1.5 md:py-2 px-3 md:px-4 shadow">
                  <p className="text-white text-xl md:text-2xl font-extrabold italic uppercase">
                    {step.title}
                  </p>
                </div>
                <p className="mt-2 text-[#2b2b31] text-xs md:text-base leading-5 font-medium max-w-xs mx-auto">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 md:mt-8 pb-1">
            <div className="mx-auto max-w-3xl rounded-3xl bg-[#62008d] border-4 border-[#f0f0f4] shadow-[8px_8px_0_rgba(0,0,0,0.15)] p-5 md:p-8 text-center">
              <p className="text-white uppercase tracking-wide font-extrabold text-xl md:text-5xl leading-tight">
                You Have Until <span className="text-[#f2bb2f]">30 September</span>
                <br />
                Good Luck!
              </p>
              <p className="mt-2 text-[#dbd7e8] text-xs md:text-xl">
                Don&apos;t miss your chance to win. Join now and complete all steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contest1;
