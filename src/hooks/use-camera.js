import { useEffect, useRef, useCallback } from "react";

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current instanceof MediaStream) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const openCamera = useCallback(async () => {
    try {
      stopStream();

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === "videoinput");

      let stream = null;

      // try each camera
      for (const cam of cameras) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cam.deviceId } },
            audio: false,
          });
          break;
        } catch (e) {
          console.log("Camera failed:", e);
        }
      }

      // fallback if all cameras fail
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  }, [stopStream]);

  useEffect(() => {
    openCamera();

    return () => {
      stopStream();
    };
  }, [openCamera, stopStream]);

  return { videoRef, openCamera, stopStream };
}