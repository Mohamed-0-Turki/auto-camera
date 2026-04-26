import { useEffect, useRef, useState, useCallback } from "react";

export default function useFaceSocket(videoRef, isRunning) {
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const [faces, setFaces] = useState([]);

  // ---------------------------
  // CONNECT SOCKET
  // ---------------------------

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/recognize");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setFaces(data.faces || []);
      } catch (e) {
        console.log("WS parse error", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
    };
  }, []);

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

    const frame = canvas.toDataURL("image/jpeg", 0.6);

    wsRef.current.send(frame);
  }, [videoRef]);

  // ---------------------------
  // AUTO STREAMING LOOP
  // ---------------------------

  useEffect(() => {
    if (!isRunning) return;

    connect();

    intervalRef.current = setInterval(() => {
      sendFrame();
    }, 200); // 5 fps (adjust if needed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, connect, sendFrame]);

  // ---------------------------
  // CLEANUP
  // ---------------------------

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { faces };
}