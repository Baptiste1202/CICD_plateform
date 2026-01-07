import { ReactNode, createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { UserInterface } from "@/interfaces/User";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AuthContextType {
  authUser: UserInterface | null;
  setAuthUser: React.Dispatch<React.SetStateAction<UserInterface | null>>;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
  loading: true,
  logout: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const isSyncing = useRef(false);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("accessToken");
      setAuthUser(null);
      isSyncing.current = false;
      window.location.href = "/login";
    } catch (error) {
      console.error("Erreur logout:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem("accessToken");
        setAuthUser(null);
        setLoading(false);
        isSyncing.current = false;
        return;
      }

      if (isSyncing.current) return;

      if (authUser && localStorage.getItem("accessToken")) {
        setLoading(false);
        return;
      }

      try {
        isSyncing.current = true;
        setLoading(true);

        const idToken = await firebaseUser.getIdToken();
        const response = await axios.post(
            "http://localhost:5001/api/auth/google-sync",
            {},
            { headers: { Authorization: `Bearer ${idToken}` } }
        );

        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          setAuthUser(response.data.user);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          await logout();
        }
      } finally {
        isSyncing.current = false;
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [t]);

  return (
      <AuthContext.Provider value={{ authUser, setAuthUser, loading, logout }}>
        {children}
      </AuthContext.Provider>
  );
};