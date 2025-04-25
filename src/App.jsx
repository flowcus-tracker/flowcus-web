import React, { useState, useEffect } from "react";
import "./App.css"; // Import the CSS file

export default function App() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedTimer, setSelectedTimer] = useState("25-5"); // Default Pomodoro timer
  const [isFocus, setIsFocus] = useState(true); // Track whether it's focus or break time

  // Timer durations (focus time and break time)
  const timerOptions = {
    "25-5": { focus: 25 * 60, break: 5 * 60 },
    "50-10": { focus: 50 * 60, break: 10 * 60 },
    "60-10": { focus: 60 * 60, break: 10 * 60 },
  };

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((s) => s - 1); // Decrement the timer
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (selectedTimer) {
      setSeconds(timerOptions[selectedTimer].focus);
      setIsFocus(true); // Set focus time initially
    }
  }, [selectedTimer]);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date().toLocaleTimeString());
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setEndTime(new Date().toLocaleTimeString());
    setSeconds(0);
    setIsFocus(true); // Reset to focus time when stopped
  };

  const handleTimerSelection = (timerKey) => {
    setSelectedTimer(timerKey);
    setSeconds(timerOptions[timerKey].focus);
    setIsFocus(true); // Set focus time initially
    setIsRunning(false); // Reset the timer when a new timer is selected
  };

  // Handle transition between focus and break
  useEffect(() => {
    if (seconds <= 0) {
      if (isFocus) {
        // Transition to break time after focus time ends
        setIsFocus(false);
        setSeconds(timerOptions[selectedTimer].break);
      } else {
        // Reset to focus time after break ends
        setIsFocus(true);
        setSeconds(timerOptions[selectedTimer].focus);
      }
    }
  }, [seconds, isFocus, selectedTimer]);

  const progressBarWidth = (seconds / (isFocus ? timerOptions[selectedTimer].focus : timerOptions[selectedTimer].break)) * 100;

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="header">
        <div className="header-item">Timer</div>
        <div className="header-item">Tasks</div>
        <div className="header-item">Calendar</div>
        <div className="header-item">Leaderboard</div>
        <div className="header-item">Report</div>
      </header>

        <h1 className="title">Welcome to Flow State Tracker</h1>
      <div className="content-box">
        <h2 className="session">Session 1</h2>

        <div className="timer">{formatTime(seconds)} - {isFocus ? "Focus" : "Break"}</div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressBarWidth}%` }}></div>
        </div>

        <div className="timer-options">
          <button
            className={`timer-btn ${selectedTimer === "25-5" ? "selected" : ""}`}
            onClick={() => handleTimerSelection("25-5")}
          >
            25m Focus / 5m Break
          </button>
          <button
            className={`timer-btn ${selectedTimer === "50-10" ? "selected" : ""}`}
            onClick={() => handleTimerSelection("50-10")}
          >
            50m Focus / 10m Break
          </button>
          <button
            className={`timer-btn ${selectedTimer === "60-10" ? "selected" : ""}`}
            onClick={() => handleTimerSelection("60-10")}
          >
            60m Focus / 10m Break
          </button>
        </div>

        <div className="controls">
          <button onClick={handleStart} className="btn start-btn">Start</button>
          <button onClick={handlePause} className="btn pause-btn">Pause</button>
          <button onClick={handleStop} className="btn stop-btn">Stop</button>
        </div>

        <div className="time-info">
          <p>Start Time: {startTime || "--:--:--"}</p>
          <p>End Time: {endTime || "--:--:--"}</p>
        </div>

        <h3 className="tasks">Priority Tasks</h3>
      </div>
    </div>
  );
}
