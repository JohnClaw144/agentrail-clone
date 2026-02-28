"use client";

import { useRef, useEffect } from "react";
import "./ImageTrail.css";
import { gsap } from "gsap";

function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

function getMouseDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function FootstepsTrail({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const imgs = [...container.querySelectorAll(".content__img")] as HTMLElement[];
    const rects = imgs.map((el) => el.getBoundingClientRect());

    let imgPosition = 0;
    let zIndexVal = 1;
    const threshold = 80;
    const mousePos = { x: 0, y: 0 };
    const lastMousePos = { x: 0, y: 0 };
    const cacheMousePos = { x: 0, y: 0 };

    function handleMove(e: MouseEvent | TouchEvent) {
      const rect = container!.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      mousePos.x = clientX - rect.left;
      mousePos.y = clientY - rect.top;
    }

    function showNext() {
      zIndexVal++;
      imgPosition = imgPosition < imgs.length - 1 ? imgPosition + 1 : 0;
      const el = imgs[imgPosition];
      const r = rects[imgPosition];

      gsap.killTweensOf(el);
      gsap
        .timeline()
        .fromTo(
          el,
          {
            opacity: 0.5,
            scale: 1,
            zIndex: zIndexVal,
            x: cacheMousePos.x - r.width / 2,
            y: cacheMousePos.y - r.height / 2,
          },
          {
            duration: 0.4,
            ease: "power1",
            opacity: 0.35,
            x: mousePos.x - r.width / 2,
            y: mousePos.y - r.height / 2,
          },
          0
        )
        .to(
          el,
          {
            duration: 0.6,
            ease: "power3",
            opacity: 0,
            scale: 0.3,
          },
          0.4
        );
    }

    let frame = 0;
    let initialized = false;

    function initRender(e: MouseEvent | TouchEvent) {
      if (initialized) return;
      initialized = true;
      handleMove(e);
      cacheMousePos.x = mousePos.x;
      cacheMousePos.y = mousePos.y;
      render();
      container!.removeEventListener("mousemove", initRender as EventListener);
    }

    function render() {
      const distance = getMouseDistance(mousePos, lastMousePos);
      cacheMousePos.x = lerp(cacheMousePos.x, mousePos.x, 0.1);
      cacheMousePos.y = lerp(cacheMousePos.y, mousePos.y, 0.1);

      if (distance > threshold) {
        showNext();
        lastMousePos.x = mousePos.x;
        lastMousePos.y = mousePos.y;
      }
      frame = requestAnimationFrame(render);
    }

    container.addEventListener("mousemove", handleMove as EventListener);
    container.addEventListener("mousemove", initRender as EventListener);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("mousemove", handleMove as EventListener);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ cursor: "default" }}>
      {/* Hidden pool of footstep images for the trail */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div className="content__img" key={i}>
          <div
            className="content__img-inner"
            style={{ backgroundImage: "url(/footsteps.png)" }}
          />
        </div>
      ))}
      {children}
    </div>
  );
}
