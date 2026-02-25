
import React, { useEffect, useState } from "react";
import Carousel from "./Carousel";

function BirthdayCarousel() {
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const employees = [
    {
      id: 101,
      name: "Anjali Tomar",
      dob: "1998-02-24",
      image: "image1.png",
    },
    {
      id: 102,
      name: "Rahul Verma",
      dob: "1998-02-24",
      image: "image2.png",
    },
    {
      id: 103,
      name: "Ravi",
      dob: "1998-02-24",
      image: "image.png",
    },
  ];

  // Get Today's Birthdays
  useEffect(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const todayBirthdays = employees.filter((emp) => {
      const dob = new Date(emp.dob);
      return (
        dob.getMonth() === todayMonth &&
        dob.getDate() === todayDate
      );
    });

    setBirthdayUsers(todayBirthdays);
  }, []);

  //  Auto Slide
  useEffect(() => {
    if (birthdayUsers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) =>
          prev === birthdayUsers.length - 1 ? 0 : prev + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [birthdayUsers]);

  // No Birthday → Show Normal Carousel
  if (birthdayUsers.length === 0) {
    return <Carousel />;
  }

return (
  <div className="relative w-full h-screen overflow-hidden">

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
          className="w-full h-screen flex-shrink-0 flex items-center justify-center p-4"
        >
          {/* SAME DESIGN CARD */}
          <div className="relative w-full max-w-6xl bg-[#f7c8da] border-[12px] border-[#f48fb1] p-10 flex flex-col md:flex-row">

            {/* LEFT SIDE */}
            <div className="w-full md:w-1/2 md:pr-10">
              <h3 className="text-gray-500 tracking-widest text-sm mb-6">
                Fintech Cloud
              </h3>

              <h1 className="text-5xl text-pink-500 italic">
                Happy
              </h1>

              <h1 className="text-6xl font-extrabold text-purple-600 -mt-2">
                BIRTHDAY
              </h1>

              <div className="w-24 border-b-2 border-gray-400 my-6"></div>

              <h2 className="text-4xl italic text-gray-700 font-serif">
                {user.name}
              </h2>

              <p className="text-gray-600 mt-6 leading-8 text-lg">
                Happy Birthday! Wishing you a year filled with success,
                happiness, and growth.
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/2 flex items-center justify-center relative mt-10 md:mt-0">

              <div className="absolute w-[420px] h-[420px] rounded-full border-[6px] border-purple-500"></div>

              <img
                src={user.image}
                alt={user.name}
                className="w-[360px] h-[360px] rounded-full object-cover z-10"
              />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* DOTS */}
    <div className="absolute bottom-6 w-full flex justify-center gap-2">
      {birthdayUsers.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            currentIndex === index
              ? "bg-purple-600 scale-125"
              : "bg-gray-400"
          }`}
        />
      ))}
    </div>

  </div>
);
}

export default BirthdayCarousel;