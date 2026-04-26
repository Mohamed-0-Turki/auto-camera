import { useEffect, useRef } from "react";

function FaceOverlay({ videoRef, faces = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");

    const draw = () => {
      const width = video.clientWidth;
      const height = video.clientHeight;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      if (!video.videoWidth || !video.videoHeight) return;

      const scaleX = width / video.videoWidth;
      const scaleY = height / video.videoHeight;

      faces.forEach((face) => {
        const [x1, y1, x2, y2] = face.bbox;

        const fx = x1 * scaleX;
        const fy = y1 * scaleY;
        const fw = (x2 - x1) * scaleX;
        const fh = (y2 - y1) * scaleY;

        const isUnknown = face.name === "Unknown";

        ctx.strokeStyle = isUnknown ? "red" : "lime";
        ctx.lineWidth = 3;

        ctx.strokeRect(fx, fy, fw, fh);

        ctx.fillStyle = isUnknown ? "red" : "lime";
        ctx.font = "14px Arial";
        ctx.fillText(
          `${face.name} (${(face.confidence * 100).toFixed(0)}%)`,
          fx,
          fy - 5
        );
      });
    };

    draw();
  }, [faces, videoRef]);

  return (
    <canvas className="absolute top-0 left-0 w-full h-full pointer-events-none" ref={canvasRef} />
  );
}

export default FaceOverlay;