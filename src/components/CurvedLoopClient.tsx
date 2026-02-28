"use client";

import CurvedLoop from "./CurvedLoop";

export function CurvedLoopClient() {
  return (
    <CurvedLoop
      marqueeText="PROOF-OF-ACTION · SHA-256 HASHING · BASE SEPOLIA · IMMUTABLE RECEIPTS · AI AGENT AUDIT · ON-CHAIN ANCHORING · "
      speed={0.7}
      direction="right"
      interactive={false}
      className="curved-loop-text"
      viewBox="-100 -300 1700 400"
      pathD="M-100,80 C200,-100 400,-250 800,-280 C1200,-310 1400,-200 1600,-280"
    />
  );
}
