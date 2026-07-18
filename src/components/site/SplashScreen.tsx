import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLoading } from "@/lib/LoadingProvider";

export function SplashScreen() {
  const { showSplash, setShowSplash } = useLoading();
  const [isExiting, setIsExiting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Only run this logic if we actually need to show the splash
    if (!showSplash) return;

    let isMounted = true;
    const MIN_DURATION = 2500;
    const startTime = Date.now();

    const checkReady = async () => {
      // Ensure fonts are loaded
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      // Calculate how much longer we need to wait to hit MIN_DURATION
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DURATION - elapsed);

      setTimeout(() => {
        if (isMounted) {
          setIsExiting(true);
          // Wait for the exit animation to complete (duration ~800ms)
          setTimeout(() => {
            if (isMounted) {
              setShowSplash(false);
            }
          }, 800);
        }
      }, remainingTime);
    };

    checkReady();

    return () => {
      isMounted = false;
    };
  }, [showSplash, setShowSplash]);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#F7F2E9" }}
        >
          {/* Logo Container */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Logo Text */}
            <div
              className="font-display flex items-center"
              style={{ fontWeight: 800, letterSpacing: "0.08em", fontSize: "2rem" }}
            >
              <span style={{ color: "#111111" }}>URBAN</span>
              <span style={{ color: "rgb(119,146,113)" }}>FIX</span>
            </div>

            {/* Loading Indicator */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div
                className="relative overflow-hidden"
                style={{
                  width: "140px",
                  height: "3px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(119,146,113,0.18)",
                }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 h-full"
                  style={{
                    width: "100%",
                    backgroundColor: "rgb(119,146,113)",
                    borderRadius: "999px",
                  }}
                  initial={shouldReduceMotion ? { opacity: 0.5 } : { x: "-100%" }}
                  animate={shouldReduceMotion ? { opacity: [0.5, 1, 0.5] } : { x: ["-100%", "100%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Status Text */}
              <span
                style={{
                  color: "#666666",
                  fontSize: "14px",
                  letterSpacing: "0.05em",
                }}
              >
                Preparing your experience
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
