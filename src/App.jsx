import Camera from "./components/Camera";
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

  console.log(faces[0]?.name);

  return (
    <div className="5">
      <h1 className="text-2xl font-bold mb-4">
        Auto Camera
      </h1>

      <Camera
        camera={{
          videoRef,
          openCamera,
          stopStream,
          timer,
          isRunning,
        }}
      />
    </div>
  );
}

export default App;