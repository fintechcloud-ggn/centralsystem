
import React, { useEffect, useState } from "react";
import Carousel from "./Carousel";

const EMPLOYEES = [
  {
    id: 101,
    name: "Kushal Madhogaria",
    dob: "1998-02-26",
    image: "image4.png",
  },
  {
    id: 102,
    name: "Rahul Verma",
    dob: "1998-02-25",
    image: "image2.png",
  },
  {
    id: 103,
    name: "Ravi",
    dob: "1998-02-26",
    image: "image3.png",
  },
];

function BirthdayCarousel() {
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("birthday");
  const CAROUSEL_DURATION_MS = 180000;

  // Get Today's Birthdays
  useEffect(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const todayBirthdays = EMPLOYEES.filter((emp) => {
      const dob = new Date(emp.dob);
      return (
        dob.getMonth() === todayMonth &&
        dob.getDate() === todayDate
      );
    });

    setBirthdayUsers(todayBirthdays);
    setCurrentIndex(0);
    setPhase("birthday");
  }, []);

  // Birthday card auto-slide
  useEffect(() => {
    if (birthdayUsers.length === 0 || phase !== "birthday") {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= birthdayUsers.length - 1) {
          setPhase("carousel");
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [birthdayUsers, phase]);

  // Show main carousel for fixed duration, then return to birthday cards
  useEffect(() => {
    if (birthdayUsers.length === 0 || phase !== "carousel") {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setCurrentIndex(0);
      setPhase("birthday");
    }, CAROUSEL_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [birthdayUsers, phase, CAROUSEL_DURATION_MS]);

  // No Birthday -> Show Normal Carousel
  if (birthdayUsers.length === 0 || phase === "carousel") {
    return <Carousel />;
  }

return (
  <div className="relative w-full h-screen overflow-hidden bg-[#ececec]">
    {/* SLIDES CONTAINER */}
    <div
      className="flex h-full transition-transform duration-700 ease-in-out"
      style={{
        transform: `translateX(-${currentIndex * 100}%)`,
      }}
    >
      {birthdayUsers.map((user) => (
        <div
          key={user.id}
          className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 md:p-3"
        >
          <div className="relative w-full max-w-6xl h-[94vh] bg-[#ececec] border border-[#d7d7d7] px-3 py-3 md:px-6 md:py-4">
            <div className="absolute left-3 top-3 h-6 w-6 rounded-full border-2 border-[#cfcfcf]" />
            <div className="absolute right-3 top-24 h-0 w-0 border-l-[10px] border-l-transparent border-t-[16px] border-t-[#cfcfcf] border-r-[10px] border-r-transparent" />

            <div className="flex h-full flex-col justify-between gap-3 md:gap-4">
              <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center">
              {/* LEFT SIDE */}
              <div className="w-full md:w-5/12 md:pr-8">
                <h3 className="text-[#c8a15a] text-xl md:text-2xl font-extrabold leading-tight tracking-wide uppercase">
                  Fintech Cloud
                </h3>
                <p className="text-[#1b1d22] text-2xl md:text-4xl font-black uppercase -mt-1">
                  Team
                </p>

                <h2
                  className="text-[#1e2228] text-4xl md:text-6xl mt-2 md:mt-4 leading-none"
                  style={{ fontFamily: "cursive" }}
                >
                  happy
                </h2>
                <h1 className="text-[#c8a15a] text-3xl md:text-5xl font-black tracking-wide uppercase -mt-2">
                  birthday
                </h1>

                <p className="text-[#c8a15a] text-4xl md:text-5xl leading-none mt-2 md:mt-4">"</p>
                <p className="text-[#54575e] text-sm md:text-lg font-bold leading-5 md:leading-7 -mt-3">
                  Wishing you a beautiful day
                  <br />
                  with good health and
                  <br />
                  happiness forever.
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div className="w-full md:w-7/12 flex items-center justify-center relative">
                <div className="w-full max-w-[300px] md:max-w-[340px] border-4 border-[#f6f6f6] p-0">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-[190px] md:h-[280px] object-cover"
                  />
                </div>

                <div className="absolute -bottom-6 right-0 md:-right-4 bg-[#c8a15a] px-4 md:px-7 py-2 md:py-3 text-center min-w-[200px] md:min-w-[230px]">
                  <h2 className="text-[#1f232b] text-xl md:text-3xl font-black uppercase leading-none">
                    {user.name}
                  </h2>
                  <p className="text-[#f6f6f6] text-xs md:text-base font-bold uppercase mt-1">
                    Team Member
                  </p>
                </div>
              </div>
              </div>

              <div className="pt-2 pb-2 text-center relative">
              <div className="hidden md:grid absolute left-0 bottom-0 grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={`left-dot-${i}`} className="h-1 w-1 rounded-full bg-[#6d6f75]" />
                ))}
              </div>
              <div className="hidden md:grid absolute right-0 bottom-0 grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={`right-dot-${i}`} className="h-1 w-1 rounded-full bg-[#6d6f75]" />
                ))}
              </div>
              <div className="mx-auto h-2 w-44 md:w-52 bg-[#c8a15a] rounded-full mb-3" />
              <p className="text-[#1f232b] font-semibold text-[10px] md:text-sm">
                Email: info@fintechcloud.com / Web: www.fintechcloud.com
              </p>
              <p className="text-[#1f232b] font-semibold text-[10px] md:text-sm mt-1">
                Phone: +91 1234567896 /  34567892345
              </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* DOTS */}
    <div className="absolute bottom-2 left-0 right-0 z-10 w-full flex justify-center gap-2">
      {birthdayUsers.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            currentIndex === index
              ? "bg-[#c8a15a] scale-125"
              : "bg-gray-500"
          }`}
        />
      ))}
    </div>
  </div>
);
}

export default BirthdayCarousel;
