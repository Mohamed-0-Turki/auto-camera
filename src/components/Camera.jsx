import { Camera as CameraIcon, Square } from "lucide-react";

function Camera({ camera, className, ...props }) {

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow bg-black">

      {/* VIDEO */}
      <video
        ref={camera?.videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full ${className || ""}`}
        {...props}
      />

      {/* TIMER */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {camera?.timer}
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 px-4 py-2 rounded-lg backdrop-blur cursor-pointer">

        {/* START */}
        {!camera?.isRunning && (
          <button
            onClick={camera?.openCamera}
            className="text-white hover:text-green-400 transition cursor-pointer"
          >
            <CameraIcon size={26} />
          </button>
        )}

        {/* STOP */}
        {camera?.isRunning && (
          <button
            onClick={camera?.stopStream}
            className="text-white hover:text-red-500 transition cursor-pointer"
          >
            <Square size={26} />
          </button>
        )}

      </div>

    </div>
  );
}

export default Camera;