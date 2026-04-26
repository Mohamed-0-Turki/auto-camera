function Camera({ videoRef, className, children, ...props }) {

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow bg-black">

      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full ${className || ""}`}
        {...props}
      />

      {children}
    </div>
  );
}

export default Camera;