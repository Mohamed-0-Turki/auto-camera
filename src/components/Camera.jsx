import useCamera from "../hooks/use-camera";

function Camera({ className, ...props }) {
  const { videoRef } = useCamera();

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`w-full max-w-lg rounded-xl shadow ${className || ""}`}
      {...props}
    />
  );
}

export default Camera;