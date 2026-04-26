import Camera from "./components/Camera";
import Controllers from "./components/Controllers";
import FaceAlerts from "./components/FaceAlerts";
import FaceOverlay from "./components/FaceOverlay";
import Timer from "./components/Timer";
import useCamera from "./hooks/use-camera";
import useFaceSocket from "./hooks/useFaceSocket";

function App() {
  const {
    videoRef,
    openCamera,
    stopStream,
    timer,
    isRunning,
  } = useCamera();

  const { faces } = useFaceSocket(videoRef, isRunning);

  // [
  //   {
  //       "name": "Unknown",
  //       "confidence": 0.39,
  //       "bbox": [
  //           512,
  //           159,
  //           950,
  //           725
  //       ]
  //   }
  // ]

  return (
    <div className="5">
      <h1 className="text-2xl font-bold mb-4">
        Auto Camera
      </h1>

      <Camera videoRef={videoRef}>
        <Timer timer={timer} />
        <FaceOverlay videoRef={videoRef} faces={faces} />
        <FaceAlerts faces={faces} />
        <Controllers isRunning={isRunning} openCamera={openCamera} stopStream={stopStream} />
      </Camera>
    </div>
  );
}

export default App;