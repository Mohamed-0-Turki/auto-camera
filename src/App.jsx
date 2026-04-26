import { useEffect, useRef } from "react";

function App() {
  const videoRef = useRef(null);

  const openCamera = async () => {
    try {
      // stop previous stream
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach(track => track.stop());
      }

      // get all cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === "videoinput");

      // try each camera until one works
      for (const cam of cameras) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cam.deviceId } },
            audio: false, // no mic
          });

          videoRef.current.srcObject = stream;
          break;
        } catch (e) {
          console.log(e);
          continue;
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  useEffect(() => {
    openCamera();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Auto Camera
      </h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-lg rounded-xl shadow"
      />
    </div>
  );
}

export default App;