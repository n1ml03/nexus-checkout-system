
import { useState, useEffect } from "react";

interface ScrollHandlerProps {
  onVisibilityChange: (isVisible: boolean) => void;
}

const ScrollHandler = ({ onVisibilityChange }: ScrollHandlerProps) => {
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Add scroll listener for all devices
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up or at the top
      if (currentScrollY <= 0) {
        onVisibilityChange(true);
      } else if (currentScrollY < lastScrollY - 10) {
        // Scrolling up (with a threshold)
        onVisibilityChange(true);
      } else if (currentScrollY > lastScrollY + 10) {
        // Scrolling down (with a threshold)
        onVisibilityChange(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, onVisibilityChange]);

  return null;
};

export default ScrollHandler;
