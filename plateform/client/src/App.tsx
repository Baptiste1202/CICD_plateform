import { Router } from "./router/routes";
import { useAuthContext } from "./contexts/authContext";
import { Loading } from "./components/customs/loading";
import { useAxiosInterceptor } from "./hooks/useAxiosInterceptors";
import { SocketProvider } from "./contexts/socketContext";
import "./styles/index.css";

function App() {
  const { loading, authUser } = useAuthContext();
  useAxiosInterceptor();

  if (loading) return <Loading />;

  return (
      <>
        {authUser ? (
            <SocketProvider>
              <Router />
            </SocketProvider>
        ) : (
            <Router />
        )}
      </>
  );
}

export default App;