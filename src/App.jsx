import { useState } from "react";

import Camera from "./components/Camera";
import Controllers from "./components/Controllers";
import FaceAlerts from "./components/FaceAlerts";
import FaceOverlay from "./components/FaceOverlay";
import Timer from "./components/Timer";

import useCamera from "./hooks/use-camera";
import useFaceSocket from "./hooks/useFaceSocket";
import useEnrollSocket from "./hooks/useEnrollSocket";

function App() {
  const [tab, setTab] = useState();
  const [studentName, setStudentName] = useState("");

  const {
    videoRef,
    openCamera,
    stopStream,
    timer,
    isRunning,
  } = useCamera();

  // prevent start without name
  const handleStart = () => {
    if (tab === "enroll" && !studentName.trim()) {
      return;
    }

    openCamera();
  };

  const { faces } = useFaceSocket(
    videoRef,
    isRunning && tab === "recognize"
  );

  const enroll = useEnrollSocket(
    videoRef,
    studentName,
    isRunning && tab === "enroll"
  );

  const isEnrollDisabled =
    tab === "enroll" && !studentName.trim();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="w-full flex flex-col gap-5 items-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Face Recognition System
            </h1>
            <p className="text-gray-500">
              Real-time face recognition & enrollment
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white p-1 rounded-xl shadow-sm w-fit flex">
            <button
              onClick={() => setTab("recognize")}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                tab === "recognize"
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Recognition
            </button>

            <button
              onClick={() => setTab("enroll")}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                tab === "enroll"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Enrollment
            </button>
          </div>
        </div>

        {/* Enroll Input */}
        {tab === "enroll" && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <label className="text-sm text-gray-600 block mb-1">
              Student Name
            </label>

            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name..."
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            {isEnrollDisabled && (
              <p className="text-xs text-red-500 mt-2">
                Student name is required to start enrollment
              </p>
            )}
          </div>
        )}

        {/* Camera */}
        <div className="bg-white p-3 rounded-2xl shadow-lg">
          <Camera videoRef={videoRef}>
            <Timer timer={timer} />

            {/* Recognition */}
            {tab === "recognize" && (
              <>
                <FaceOverlay videoRef={videoRef} faces={faces} />
                <FaceAlerts faces={faces} />
              </>
            )}

            {/* Enrollment UI */}
            {tab === "enroll" && isRunning && (
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white p-4 rounded-xl shadow-xl w-64">
                
                <div className="text-sm opacity-80">
                  Enrollment Progress
                </div>

                <div className="text-lg font-semibold mt-1">
                  {enroll.framesCollected} / {enroll.framesRequired}
                </div>

                {/* Progress */}
                <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${enroll.progress}%` }}
                  />
                </div>

                {/* Status */}
                <div className="mt-3 text-xs text-white/80 capitalize">
                  {enroll.status}
                </div>

                {/* Message */}
                <div className="text-xs mt-1 text-white/70">
                  {enroll.message}
                </div>
              </div>
            )}

            <Controllers
              isRunning={isRunning}
              openCamera={handleStart}
              stopStream={stopStream}
              disabled={isEnrollDisabled}
            />
          </Camera>
        </div>
      </div>
    </div>
  );
}

export default App;