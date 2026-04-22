import React, { useEffect, useMemo, useState } from "react";
import Carousel from "./Carousel";
import BalloonBackground from "./ui/demo";
import { apiUrl } from "../lib/api";

const CARD_DURATION_MS = 30000;
const CAROUSEL_DURATION_MS = 90000;
const SLIDE_TRANSITION_MS = 700;

const getTodayParts = () => {
  const today = new Date();
  return {
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear()
  };
};

const isTodayBirthday = (employee, today) => {
  if (!employee.date_of_birth) return false;

  const dob = String(employee.date_of_birth).trim();
  if (dob.length !== 6) return false;

  const day = Number(dob.slice(0, 2));
  const month = Number(dob.slice(2, 4));

  return day === today.day && month === today.month;
};

const getDatePartsFromValue = (value) => {
  if (!value) return null;

  const dateValue = String(value).trim();
  const plainDateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (plainDateMatch) {
    return {
      year: Number(plainDateMatch[1]),
      month: Number(plainDateMatch[2]),
      day: Number(plainDateMatch[3])
    };
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
    day: parsedDate.getDate()
  };
};

const getAnniversaryYears = (employee, today) => {
  const joiningDate = getDatePartsFromValue(employee.doj);
  if (!joiningDate) return 0;

  if (joiningDate.day !== today.day || joiningDate.month !== today.month) {
    return 0;
  }

  return Math.max(0, today.year - joiningDate.year);
};

const getEmployeeImageSources = (user) =>
  [
    user.employee_code ? apiUrl(`/api/images/employee/${encodeURIComponent(user.employee_code)}`) : "",
    user.image_proxy_path ? apiUrl(user.image_proxy_path) : "",
    user.image_url,
    user.original_image_url
  ].filter(Boolean);

function EmployeeImage({ user, className, fallbackClassName }) {
  const imageSources = useMemo(() => getEmployeeImageSources(user), [user]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [user?.id, user?.employee_code, user?.image_s3_key, user?.image_url, user?.original_image_url]);

  if (sourceIndex >= imageSources.length) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${fallbackClassName}`}>
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#c8a15a] text-5xl font-bold text-white shadow-lg md:h-48 md:w-48 md:text-6xl">
          {user.employee_name?.trim()?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSources[sourceIndex]}
      alt={user.employee_name}
      className={className}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

function BirthdayCard({ user }) {
  return (
    <div className="relative h-full w-full overflow-y-auto md:overflow-hidden">
      <BalloonBackground className="absolute inset-0 opacity-60" />
      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col border border-white/20 bg-[#ececec]/92 px-3 py-3 backdrop-blur-[2px] sm:px-5 md:h-full md:px-6 md:py-4">
        <div className="absolute left-3 top-3 hidden h-6 w-6 rounded-full border-2 border-[#cfcfcf] sm:block" />
        <div className="absolute right-3 top-24 hidden h-0 w-0 border-l-[10px] border-l-transparent border-t-[16px] border-t-[#cfcfcf] border-r-[10px] border-r-transparent sm:block" />

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 md:gap-4">
          <div className="flex min-h-0 w-full flex-1 flex-col gap-3 md:gap-4 md:flex-row md:items-stretch">
            <div className="w-full shrink-0 md:flex md:w-[42%] md:flex-col md:justify-center md:pr-6 lg:w-[38%]">
              <h3 className="text-xl font-extrabold uppercase leading-tight tracking-wide text-[#c8a15a] sm:text-2xl md:text-3xl">
                Fintech Cloud
              </h3>
              <p className="-mt-1 text-3xl font-black uppercase text-[#1b1d22] sm:text-4xl md:text-5xl">
                Team
              </p>

              <h2
                className="mt-3 text-5xl leading-none text-[#1e2228] sm:text-6xl md:mt-5 md:text-7xl lg:text-8xl"
                style={{ fontFamily: "cursive" }}
              >
                happy
              </h2>
              <h1 className="-mt-2 text-4xl font-black uppercase tracking-wide text-[#c8a15a] sm:text-5xl md:text-6xl lg:text-7xl">
                birthday
              </h1>

              <p className="mt-3 text-4xl leading-none text-[#c8a15a] sm:text-5xl md:mt-5 md:text-6xl">
                "
              </p>
              <p className="-mt-3 text-base font-bold leading-6 text-[#54575e] sm:text-lg sm:leading-7 md:text-2xl md:leading-9">
                Wishing you a beautiful day
                <br />
                with good health and
                <br />
                happiness forever.
              </p>
            </div>

            <div className="relative flex min-h-0 w-full flex-1 flex-col items-stretch justify-center md:w-[58%] lg:w-[62%]">
              <div className="mx-auto h-[34dvh] min-h-[220px] w-full flex-1 border-4 border-[#f6f6f6] p-0 sm:min-h-[280px] md:h-full md:min-h-0 md:max-w-[92%] lg:max-w-[88%]">
                <EmployeeImage
                  user={user}
                  className="h-full w-full object-cover"
                  fallbackClassName="bg-gray-100"
                />
              </div>

              <div className="mt-2 w-full bg-[#c8a15a] px-4 py-2 text-center md:absolute md:-bottom-6 md:-right-4 md:mt-0 md:w-auto md:min-w-[360px] md:px-9 md:py-4 lg:-right-16 lg:min-w-[380px]">
                <h2 className="break-words text-lg font-black uppercase leading-tight text-[#1f232b] sm:text-xl md:text-3xl md:leading-none">
                  {user.employee_name}
                </h2>
                <p className="mt-1 text-xs font-bold uppercase text-[#f6f6f6] md:text-base">
                  Team Member
                </p>
              </div>
            </div>
          </div>

          <FooterStrip />
        </div>
      </div>
    </div>
  );
}

function AnniversaryCard({ user }) {
  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-[#650044] md:overflow-hidden md:bg-white">
      <div className="absolute inset-y-0 left-0 w-full bg-[#650044] md:w-[73%]" />
      <div className="absolute inset-y-0 right-0 hidden w-[27%] bg-white md:block" />
      <div className="absolute inset-y-0 left-[71%] hidden w-5 bg-[#b19435] md:block 2xl:w-7" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col gap-6 px-5 py-7 sm:px-8 sm:py-10 md:h-full md:flex-row md:items-center md:gap-[clamp(1.5rem,3vw,4rem)] md:px-[clamp(3rem,5vw,7rem)] md:py-[clamp(2rem,4vh,5rem)] min-[1800px]:gap-[5vw] min-[1800px]:px-[8vw]">
        <div className="flex min-h-0 flex-1 flex-col justify-center text-center md:w-[52%] md:text-left">
          <h1
            className="text-[clamp(2.35rem,10vw,4.5rem)] font-bold leading-[1.08] text-[#e0c74e] md:text-[clamp(3.75rem,5vw,7.5rem)]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Happy
            <br />
            Work Anniversary
          </h1>

          <h2
            className="mt-[clamp(1.25rem,4vw,2.5rem)] break-words text-[clamp(2rem,8vw,4rem)] font-bold leading-tight text-white md:text-[clamp(3rem,4vw,6rem)]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Dear {user.employee_name}
          </h2>

          <p className="mx-auto mt-[clamp(1rem,3vw,2rem)] max-w-2xl text-[clamp(1rem,4vw,1.35rem)] font-medium leading-relaxed text-white/90 md:mx-0 md:max-w-[58rem] md:text-[clamp(1.25rem,1.6vw,2.15rem)]">
            Thank you for being such a valuable member of our team.
            <br />
            Wishing you the best for continued success!
          </p>

          {user.anniversaryYears > 0 && (
            <p className="mt-[clamp(1rem,3vw,1.75rem)] text-[clamp(0.78rem,2.6vw,1rem)] font-semibold uppercase tracking-[0.18em] text-[#e0c74e] sm:tracking-[0.24em] md:text-[clamp(1rem,1vw,1.45rem)]">
              {user.anniversaryYears} Year{user.anniversaryYears === 1 ? "" : "s"} With Us
            </p>
          )}
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center py-3 md:w-[48%] md:py-0">
          <DecorativeBranches />
          <div className="absolute left-0 top-1/2 hidden h-[clamp(23rem,38vw,48rem)] w-[clamp(23rem,38vw,48rem)] -translate-x-[clamp(4rem,8vw,10rem)] -translate-y-1/2 rounded-full border-4 border-[#b19435] md:block min-[1800px]:border-[6px]" />
          <div className="absolute left-0 top-1/2 hidden h-[clamp(21rem,36vw,45rem)] w-[clamp(21rem,36vw,45rem)] -translate-x-[clamp(5rem,9vw,12rem)] -translate-y-1/2 rounded-full border border-[#e0c74e]/70 md:block min-[1800px]:border-2" />
          <div className="absolute left-4 top-1/2 hidden -translate-x-[clamp(5rem,9vw,12rem)] -translate-y-1/2 grid-cols-8 gap-2 md:grid min-[1800px]:gap-3">
            {Array.from({ length: 120 }).map((_, index) => (
              <span
                key={`gold-dot-${index}`}
                className="h-1 w-1 rounded-full bg-[#e0c74e] min-[1800px]:h-1.5 min-[1800px]:w-1.5"
              />
            ))}
          </div>

          <div className="relative z-10 h-[clamp(15rem,72vw,24rem)] w-[clamp(15rem,72vw,24rem)] overflow-hidden rounded-[50%] border-4 border-[#b19435] bg-[#f2bed0] shadow-2xl md:h-[clamp(24rem,34vw,46rem)] md:w-[clamp(24rem,34vw,46rem)] min-[1800px]:border-[7px]">
            <EmployeeImage
              user={user}
              className="h-full w-full object-cover"
              fallbackClassName="bg-[#f2bed0]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DecorativeBranches() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      <div className="absolute right-0 top-6 h-48 w-24 rotate-12 border-r-4 border-[#650044]" />
      <div className="absolute right-9 top-16 h-16 w-5 rotate-45 rounded-full bg-[#9b7a18]" />
      <div className="absolute right-16 top-28 h-16 w-5 rotate-[28deg] rounded-full bg-[#650044]" />
      <div className="absolute right-5 top-36 h-16 w-5 rotate-45 rounded-full bg-[#9b7a18]" />
      <div className="absolute bottom-16 right-4 h-48 w-24 -rotate-12 border-r-4 border-[#650044]" />
      <div className="absolute bottom-32 right-14 h-16 w-5 -rotate-45 rounded-full bg-[#9b7a18]" />
      <div className="absolute bottom-24 right-24 h-16 w-5 -rotate-[28deg] rounded-full bg-[#650044]" />
      <div className="absolute bottom-48 right-8 h-16 w-5 -rotate-45 rounded-full bg-[#9b7a18]" />
    </div>
  );
}

function FooterStrip() {
  return (
    <div className="relative shrink-0 pb-6 pt-2 text-center md:pb-2">
      <div className="absolute bottom-0 left-0 hidden grid-cols-4 gap-2 md:grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={`left-dot-${i}`} className="h-1 w-1 rounded-full bg-[#6d6f75]" />
        ))}
      </div>
      <div className="absolute bottom-0 right-0 hidden grid-cols-4 gap-2 md:grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={`right-dot-${i}`} className="h-1 w-1 rounded-full bg-[#6d6f75]" />
        ))}
      </div>
      <div className="mx-auto mb-3 h-2 w-44 rounded-full bg-[#c8a15a] md:w-52" />
      <p className="break-words text-[10px] font-semibold text-[#1f232b] sm:text-xs md:text-sm">
        Email: info@fintechcloud.in / Web: https://fintechcloud.in/
      </p>
      <p className="mt-1 break-words text-[10px] font-semibold text-[#1f232b] sm:text-xs md:text-sm">
        Phone: +91 1234567896 / 34567892345
      </p>
    </div>
  );
}

function CelebrationCards({ mode = "auto" }) {
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [anniversaryUsers, setAnniversaryUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(apiUrl("/api/employees"));
        const data = await res.json();
        const today = getTodayParts();

        const todayBirthdays = data.filter((employee) => isTodayBirthday(employee, today));
        const todayAnniversaries = data
          .map((employee) => ({
            ...employee,
            anniversaryYears: getAnniversaryYears(employee, today)
          }))
          .filter((employee) => employee.anniversaryYears > 0)
          .sort((first, second) => Number(first.id || 0) - Number(second.id || 0));

        setBirthdayUsers(todayBirthdays);
        setAnniversaryUsers(todayAnniversaries);
        setIsTransitionEnabled(false);
        setCurrentIndex(0);
        if (mode === "birthday") {
          setPhase(todayBirthdays.length > 0 ? "birthday" : "carousel");
        } else if (mode === "anniversary") {
          setPhase(todayAnniversaries.length > 0 ? "anniversary" : "carousel");
        } else {
          setPhase(todayBirthdays.length > 0 ? "birthday" : todayAnniversaries.length > 0 ? "anniversary" : "carousel");
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsTransitionEnabled(true));
        });
      } catch (error) {
        console.error("Error fetching employees:", error);
        setPhase("carousel");
      }
    };

    fetchEmployees();
  }, [mode]);

  const activeUsers = useMemo(
    () => (phase === "birthday" ? birthdayUsers : phase === "anniversary" ? anniversaryUsers : []),
    [anniversaryUsers, birthdayUsers, phase]
  );
  const displayedUsers = activeUsers.length > 1 ? [...activeUsers, activeUsers[0]] : activeUsers;
  const activeDotIndex = activeUsers.length > 0 ? currentIndex % activeUsers.length : 0;

  useEffect(() => {
    if (activeUsers.length === 0 || phase === "carousel") {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < activeUsers.length - 1) {
          return prev + 1;
        }

        if (mode === "auto" && phase === "birthday" && anniversaryUsers.length > 0) {
          setIsTransitionEnabled(false);
          setPhase("anniversary");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setIsTransitionEnabled(true));
          });
          return 0;
        }

        if (mode !== "auto") {
          return activeUsers.length;
        }

        setPhase("carousel");
        return 0;
      });
    }, CARD_DURATION_MS);

    return () => clearInterval(interval);
  }, [activeUsers.length, anniversaryUsers.length, mode, phase]);

  useEffect(() => {
    if (mode === "auto" || activeUsers.length <= 1 || currentIndex !== activeUsers.length) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setIsTransitionEnabled(false);
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitionEnabled(true));
      });
    }, SLIDE_TRANSITION_MS);

    return () => clearTimeout(timeout);
  }, [activeUsers.length, currentIndex, mode]);

  useEffect(() => {
    if (phase !== "carousel" || (birthdayUsers.length === 0 && anniversaryUsers.length === 0)) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setCurrentIndex(0);
      if (mode === "birthday") {
        setPhase("birthday");
      } else if (mode === "anniversary") {
        setPhase("anniversary");
      } else {
        setPhase(birthdayUsers.length > 0 ? "birthday" : "anniversary");
      }
    }, CAROUSEL_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [anniversaryUsers.length, birthdayUsers.length, mode, phase]);

  if (phase === "loading") {
    return <div className="h-[100dvh] min-h-[100dvh] w-full bg-[#ececec]" />;
  }

  if (phase === "carousel" || activeUsers.length === 0) {
    return <Carousel />;
  }

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#ececec]">
      <div
        className={`relative z-10 flex h-full ${
          isTransitionEnabled ? "transition-transform duration-700 ease-in-out" : ""
        }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayedUsers.map((user, index) => (
          <div key={`${phase}-${user.id}-${index}`} className="h-full w-full flex-shrink-0">
            {phase === "birthday" ? <BirthdayCard user={user} /> : <AnniversaryCard user={user} />}
          </div>
        ))}
      </div>

      {activeUsers.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-20 flex w-full justify-center gap-2">
          {activeUsers.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to ${phase} card ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                activeDotIndex === index ? "scale-125 bg-[#c8a15a]" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AnniversaryPage() {
  return <CelebrationCards mode="anniversary" />;
}

export default CelebrationCards;
