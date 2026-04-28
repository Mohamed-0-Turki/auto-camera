import { useEffect, useRef, useState, useCallback } from "react";

export default function useEnrollSocket(videoRef, studentName, isRunning) {
  const wsRef = useRef(null);
  const stopRef = useRef(false);

  const [status, setStatus] = useState("idle");
  const [framesCollected, setFramesCollected] = useState(0);
  const [framesRequired, setFramesRequired] = useState(15);
  const [message, setMessage] = useState("");

  // ---------------------------
  // CONNECT
  // ---------------------------
  const connect = useCallback(() => {
    if (!studentName) return;
    if (wsRef.current) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/enroll/${encodeURIComponent(studentName)}`
    );

    ws.onopen = () => {
      console.log("Enroll WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setStatus(data.status);
        setFramesCollected(data.frames_collected ?? 0);
        setFramesRequired(data.frames_required ?? 15);
        setMessage(data.message ?? "");

        // stop automatically when finished
        if (data.status === "success") {
          stopRef.current = true;
        }
      } catch (e) {
        console.log(e);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [studentName]);

  // ---------------------------
  // SEND FRAME
  // ---------------------------
  const sendFrame = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frame = canvas.toDataURL("image/jpeg", 0.7);

    wsRef.current.send(frame);
  }, [videoRef]);

  // ---------------------------
  // LOOP
  // ---------------------------
  const startLoop = useCallback(async () => {
    stopRef.current = false;

    connect();

    while (!stopRef.current) {
      sendFrame();

      // enrollment should be faster than recognition
      await new Promise((res) => setTimeout(res, 2000));
    }
  }, [connect, sendFrame]);

  const stopLoop = useCallback(() => {
    stopRef.current = true;
  }, []);

  // ---------------------------
  // EFFECT
  // ---------------------------
  useEffect(() => {
    if (!isRunning) {
      stopLoop();
      return;
    }

    startLoop();

    return () => stopLoop();
  }, [isRunning, startLoop, stopLoop]);

  // ---------------------------
  // CLEANUP
  // ---------------------------
  useEffect(() => {
    return () => {
      stopRef.current = true;
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    status,
    framesCollected,
    framesRequired,
    message,
    progress: Math.round((framesCollected / framesRequired) * 100),
  };
}