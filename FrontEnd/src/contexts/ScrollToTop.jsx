import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Retrieves the current pathname from the URL
  const { pathname } = useLocation();

  // Scrolls the window to the top whenever the pathname changes
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top of the page
  }, [pathname]); // Runs every time the pathname changes

  // Returns null as this component does not render anything
  return null; // No need to render anything
};

export default ScrollToTop;
