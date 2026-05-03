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
  const [enrollStarted, setEnrollStarted] = useState(false);

  const {
    videoRef,
    openCamera,
    stopStream,
    timer,
    isRunning,
  } = useCamera();

  // 🔹 Only allow recognition from global start
  const handleStart = () => {
    if (tab === "recognize") {
      openCamera();
    }
  };

  // 🔹 Handle tab switching safely
  const handleTabChange = (value) => {
    setTab(value);
    setEnrollStarted(false);
    stopStream();
  };

  const { faces } = useFaceSocket(
    videoRef,
    isRunning && tab === "recognize"
  );

  const enroll = useEnrollSocket(
    videoRef,
    studentName,
    isRunning && tab === "enroll" && enrollStarted
  );

  const isEnrollDisabled = !studentName.trim();

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
              onClick={() => handleTabChange("recognize")}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                tab === "recognize"
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Recognition
            </button>

            <button
              onClick={() => handleTabChange("enroll")}
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

        {/* Enroll Section */}
        {tab === "enroll" && (
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <label className="text-sm text-gray-600 block">
              Student Name
            </label>

            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name..."
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <button
              onClick={() => {
                if (!studentName.trim()) return;

                setEnrollStarted(true);
                openCamera();
              }}
              className="w-full bg-emerald-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              disabled={isEnrollDisabled}
            >
              Start Enrollment
            </button>

            {isEnrollDisabled && (
              <p className="text-xs text-red-500">
                Student name is required
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
            {tab === "enroll" && isRunning && enrollStarted && (
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

            {/* Controllers (disabled in enroll) */}
            <Controllers
              isRunning={isRunning}
              openCamera={handleStart}
              stopStream={stopStream}
              disabled={tab === "enroll"}
            />
          </Camera>
        </div>
      </div>
    </div>
  );
}

export default App;