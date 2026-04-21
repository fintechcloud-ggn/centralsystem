import React, { useEffect, useState } from "react";
import Carousel from "./Carousel";
import BalloonBackground from "./ui/demo";
import { apiUrl } from "../lib/api";

function BirthdayCarousel() {
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("birthday");
  const CAROUSEL_DURATION_MS = 90000;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(apiUrl("/api/employees"));
        const data = await res.json();

        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1; 

        const todayBirthdays = data.filter((emp) => {
          if (!emp.date_of_birth) return false;

          const dob = emp.date_of_birth.trim();

          if (dob.length !== 6) return false;

          const day = Number(dob.slice(0, 2));
          const month = Number(dob.slice(2, 4));

          return day === todayDay && month === todayMonth;
        });

        setBirthdayUsers(todayBirthdays);
        setCurrentIndex(0);
        setPhase("birthday");
    
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
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
    }, 30000);

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
    <div className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#ececec]">
      <BalloonBackground className="absolute inset-0 opacity-60" />
      {/* SLIDES CONTAINER */}
      <div
        className="relative z-10 flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {birthdayUsers.map((user) => (
          <div
            key={user.id}
            className="h-full w-full flex-shrink-0 overflow-y-auto md:overflow-hidden"
          >
            <div className="relative flex min-h-[100dvh] w-full flex-col border border-white/20 bg-[#ececec]/92 px-3 py-3 backdrop-blur-[2px] sm:px-5 md:h-full md:px-6 md:py-4">
              <div className="absolute left-3 top-3 hidden h-6 w-6 rounded-full border-2 border-[#cfcfcf] sm:block" />
              <div className="absolute right-3 top-24 hidden h-0 w-0 border-l-[10px] border-l-transparent border-t-[16px] border-t-[#cfcfcf] border-r-[10px] border-r-transparent sm:block" />

              <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 md:gap-4">
                <div className="flex min-h-0 w-full flex-1 flex-col gap-3 md:gap-4 md:flex-row md:items-stretch">
                  {/* LEFT SIDE */}
                  <div className="w-full shrink-0 md:flex md:w-[42%] md:flex-col md:justify-center md:pr-6 lg:w-[38%]">
                    <h3 className="text-[#c8a15a] text-xl font-extrabold leading-tight tracking-wide uppercase sm:text-2xl md:text-3xl">
                      Fintech Cloud
                    </h3>
                    <p className="text-[#1b1d22] text-3xl font-black uppercase -mt-1 sm:text-4xl md:text-5xl">
                      Team
                    </p>

                    <h2
                      className="text-[#1e2228] text-5xl mt-3 leading-none sm:text-6xl md:mt-5 md:text-7xl lg:text-8xl"
                      style={{ fontFamily: "cursive" }}
                    >
                      happy
                    </h2>
                    <h1 className="text-[#c8a15a] text-4xl font-black tracking-wide uppercase -mt-2 sm:text-5xl md:text-6xl lg:text-7xl">
                      birthday
                    </h1>

                    <p className="text-[#c8a15a] text-4xl leading-none mt-3 sm:text-5xl md:mt-5 md:text-6xl">
                      "
                    </p>
                    <p className="text-[#54575e] text-base font-bold leading-6 -mt-3 sm:text-lg sm:leading-7 md:text-2xl md:leading-9">
                      Wishing you a beautiful day
                      <br />
                      with good health and
                      <br />
                      happiness forever.
                    </p>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="relative flex min-h-0 w-full flex-1 flex-col items-stretch justify-center md:w-[58%] lg:w-[62%]">
                    <div className="mx-auto h-[34dvh] min-h-[220px] w-full flex-1 border-4 border-[#f6f6f6] p-0 sm:min-h-[280px] md:h-full md:min-h-0 md:max-w-[92%] lg:max-w-[88%]">
                      {user.image_url ? (
                        <img
                          src={user.image_url}
                          alt={user.employee_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          {/* Circle Avatar */}
                          <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-[#c8a15a] flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-lg">
                            {user.employee_name
                              ?.trim()
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 w-full bg-[#c8a15a] px-4 py-2 text-center md:absolute md:-bottom-6 md:-right-4 md:mt-0 md:w-auto md:min-w-[360px] md:px-9 md:py-4 lg:-right-16 lg:min-w-[380px]">
                      <h2 className="break-words text-[#1f232b] text-lg font-black uppercase leading-tight sm:text-xl md:text-3xl md:leading-none">
                        {user.employee_name}
                      </h2>
                      <p className="text-[#f6f6f6] text-xs font-bold uppercase mt-1 md:text-base">
                        Team Member
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative shrink-0 pt-2 pb-6 text-center md:pb-2">
                  <div className="hidden md:grid absolute left-0 bottom-0 grid-cols-4 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={`left-dot-${i}`}
                        className="h-1 w-1 rounded-full bg-[#6d6f75]"
                      />
                    ))}
                  </div>
                  <div className="hidden md:grid absolute right-0 bottom-0 grid-cols-4 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={`right-dot-${i}`}
                        className="h-1 w-1 rounded-full bg-[#6d6f75]"
                      />
                    ))}
                  </div>
                  <div className="mx-auto h-2 w-44 md:w-52 bg-[#c8a15a] rounded-full mb-3" />
                  <p className="break-words text-[#1f232b] font-semibold text-[10px] sm:text-xs md:text-sm">
                    Email: info@fintechcloud.com / Web: www.fintechcloud.com
                  </p>
                  <p className="break-words text-[#1f232b] font-semibold text-[10px] sm:text-xs md:text-sm mt-1">
                    Phone: +91 1234567896 / 34567892345
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
              currentIndex === index ? "bg-[#c8a15a] scale-125" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default BirthdayCarousel;
