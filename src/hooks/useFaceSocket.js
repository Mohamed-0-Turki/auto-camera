import { useEffect, useRef, useState, useCallback } from "react";

export default function useFaceSocket(videoRef, isRunning) {
  const wsRef = useRef(null);
  const stopRef = useRef(false);

  const [faces, setFaces] = useState([]);

  // ---------------------------
  // CONNECT
  // ---------------------------

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/recognize");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setFaces(data.faces || []);
      } catch (e) {
        console.log(e);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    wsRef.current = ws;
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
  // CONTROLLED LOOP (IMPORTANT)
  // ---------------------------

  const startLoop = useCallback(async () => {
    stopRef.current = false;

    connect();

    while (!stopRef.current) {
      sendFrame();

      // ⏱ WAIT BETWEEN REQUESTS (CHANGE THIS)
      await new Promise(res => setTimeout(res, 3000)); 
      // ↑ 1 second delay (you can change it to 2000, 3000 etc)
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

    return () => {
      stopLoop();
    };
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

  return { faces };
}