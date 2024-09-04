"use client"

import { useAnimate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// NOTE: Change this date to whatever date you want to countdown to :)
const COUNTDOWN_FROM = "2025-08-09";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const ShiftingCountdown = () => {
  const [isBirthday, setIsBirthday] = useState(false);
  const [countdownDate, setCountdownDate] = useState(new Date(COUNTDOWN_FROM));

  useEffect(() => {
    // Check if today is August 9th in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is GMT+5:30
    const istTime = now.getTime() + istOffset;
    const istDate = new Date(istTime);

    if (istDate.getMonth() === 7 && istDate.getDate() === 9) {
      setIsBirthday(true);
      // Reset the countdown date to next year
      setCountdownDate(new Date(istDate.getFullYear() + 1, 7, 9));
    } else {
      setIsBirthday(false);
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-4">
      <div className="mx-auto flex w-full max-w-5xl items-center bg-white">
        {isBirthday ? (
          <div className="flex h-24 w-full items-center justify-center font-mono text-4xl text-green-500 md:h-36 md:text-6xl lg:text-7xl xl:text-8xl">
            Happy Birthday!
          </div>
        ) : (
          <>
            <CountdownItem unit="Day" text="days" countdownDate={countdownDate} />
            <CountdownItem unit="Hour" text="hours" countdownDate={countdownDate} />
            <CountdownItem unit="Minute" text="minutes" countdownDate={countdownDate} />
            <CountdownItem unit="Second" text="seconds" countdownDate={countdownDate} />
          </>
        )}
      </div>
    </div>
  );
};

const CountdownItem = ({ unit, text, countdownDate }) => {
  const { ref, time } = useTimer(unit, countdownDate);

  return (
    <div className="flex h-24 w-1/4 flex-col items-center justify-center gap-1 border-r-[1px] border-slate-200 font-mono md:h-36 md:gap-2">
      <div className="relative w-full overflow-hidden text-center">
        <span
          ref={ref}
          className="block text-2xl font-medium text-black md:text-4xl lg:text-6xl xl:text-7xl"
        >
          {time}
        </span>
      </div>
      <span className="text-xs font-light text-slate-500 md:text-sm lg:text-base">
        {text}
      </span>
    </div>
  );
};

export default ShiftingCountdown;

// NOTE: Framer motion exit animations can be a bit buggy when repeating
// keys and tabbing between windows. Instead of using them, we've opted here
// to build our own custom hook for handling the entrance and exit animations
const useTimer = (unit, countdownDate) => {
  const [ref, animate] = useAnimate();

  const intervalRef = useRef(null);
  const timeRef = useRef(0);

  const [time, setTime] = useState(0);

  useEffect(() => {
    intervalRef.current = setInterval(handleCountdown, 1000);

    return () => clearInterval(intervalRef.current || undefined);
  }, [countdownDate]);

  const handleCountdown = async () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is GMT+5:30
    const istTime = now.getTime() + istOffset;
    const istDate = new Date(istTime);

    const distance = +countdownDate - +istDate;

    let newTime = 0;

    if (unit === "Day") {
      newTime = Math.floor(distance / DAY);
    } else if (unit === "Hour") {
      newTime = Math.floor((distance % DAY) / HOUR);
    } else if (unit === "Minute") {
      newTime = Math.floor((distance % HOUR) / MINUTE);
    } else if (unit === "Second") {
      newTime = Math.floor((distance % MINUTE) / SECOND);
    }

    if (newTime !== timeRef.current) {
      // Exit animation
      await animate(
        ref.current,
        { y: ["0%", "-50%"], opacity: [1, 0] },
        { duration: 0.35 }
      );

      timeRef.current = newTime;
      setTime(newTime);

      // Enter animation
      await animate(
        ref.current,
        { y: ["50%", "0%"], opacity: [0, 1] },
        { duration: 0.35 }
      );
    }
  };

  return { ref, time };
};