import { useEffect, useRef } from "react";

function FaceAlerts({ faces = [] }) {
  const knownAudio = useRef(null);
  const unknownAudio = useRef(null);

  const lastKnown = useRef({});
  const lastUnknown = useRef({});

  useEffect(() => {
    knownAudio.current = new Audio("/known.mp3");
    unknownAudio.current = new Audio("/unknown.mp3");
  }, []);

  const playKnown = () => {
    knownAudio.current?.play().catch(() => {});
  };

  const playUnknown = () => {
    unknownAudio.current?.play().catch(() => {});
  };

  useEffect(() => {
    if (!faces.length) return;

    const now = Date.now();

    faces.forEach((face) => {
      const isUnknown = face.name === "Unknown";
      const id = face.name;

      const lastTime = isUnknown
        ? lastUnknown.current[id]
        : lastKnown.current[id];

      if (lastTime && now - lastTime < 5000) return;

      if (isUnknown) {
        playUnknown();
        lastUnknown.current[id] = now;
      } else {
        playKnown();
        lastKnown.current[id] = now;
      }
    });
  }, [faces]);

  return null;
}

export default FaceAlerts;