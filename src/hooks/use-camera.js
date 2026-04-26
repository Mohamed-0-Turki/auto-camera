import { useEffect, useRef, useCallback, useState } from "react";

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const retryRef = useRef(null);
  const timerRef = useRef(null);

  const secondsRef = useRef(0);

  const [timer, setTimer] = useState("00:00:00");
  const [isRunning, setIsRunning] = useState(false);

  // ---------------------------
  // Utils
  // ---------------------------

  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    secondsRef.current = 0;
    setTimer("00:00:00");
  }, []);

  const startTimer = useCallback(() => {
    // 🔥 prevent multiple intervals
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    secondsRef.current = 0;

    timerRef.current = setInterval(() => {
      secondsRef.current += 1;
      setTimer(formatTime(secondsRef.current));
    }, 1000);
  }, []);

  // ---------------------------
  // STOP STREAM
  // ---------------------------

  const stopStream = useCallback(() => {
    // stop camera
    if (streamRef.current instanceof MediaStream) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // stop timer FIRST (prevents ghost increment)
    stopTimer();

    setIsRunning(false);
  }, [stopTimer]);

  // ---------------------------
  // START CAMERA
  // ---------------------------

  const openCamera = useCallback(async () => {
    try {
      stopStream();

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === "videoinput");

      if (cameras.length === 0) return false;

      let stream = null;

      for (const cam of cameras) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cam.deviceId } },
            audio: false,
          });
          break;
        } catch (e) {
          console.log(e);
        }
      }

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        setIsRunning(true);
        startTimer();
      }

      return true;
    } catch (err) {
      console.error("Camera error:", err);
      return false;
    }
  }, [stopStream, startTimer]);

  // ---------------------------
  // RETRY (10s)
  // ---------------------------

  const startRetry = useCallback(() => {
    if (retryRef.current) return;

    retryRef.current = setInterval(async () => {
      const ok = await openCamera();

      if (ok && retryRef.current !== null) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }
    }, 10000);
  }, [openCamera]);

  // ---------------------------
  // LIFECYCLE
  // ---------------------------

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const ok = await openCamera();

      if (!ok && mounted) {
        startRetry();
      }
    };

    init();

    return () => {
      mounted = false;

      stopStream();

      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [openCamera, startRetry, stopStream]);

  // ---------------------------
  // API
  // ---------------------------

  return {
    videoRef,
    openCamera,
    stopStream,
    timer,
    isRunning,
  };
}