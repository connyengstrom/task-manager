import { useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext";

const useAutoLogout = () => {
  const { logout } = useAuth();
  const logoutTime = 15 * 60 * 1000; // log out after 15 minutes

  const resetTimer = useCallback(() => {
    clearTimeout(window.inactivityTimer);
    window.inactivityTimer = setTimeout(logout, logoutTime);
  }, [logout, logoutTime]);

  useEffect(() => {
    window.inactivityTimer = setTimeout(logout, logoutTime);
    
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    return () => {
      clearTimeout(window.inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return null;
};

export default useAutoLogout;
