import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", user.authToken); // Ensure authToken is saved
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setEmail("");
      setIsLoggedIn(false);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn, email }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
