import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import Landing from "./screens/Landing";
import Create from "./component/create/Create";
import Vote from "./screens/Vote";
import Recents from "./screens/Recents";
import Saved from "./screens/Saved";
import PollResults from "./screens/PollResults";
import { CatalogProvider } from "./contexts/CatalogContext";
import { PollsProvider } from "./contexts/PollsContext";
import { SavedProvider } from "./contexts/SavedContext";
import { UserProvider } from "./contexts/UserContext";
import { ensureSeedsLoaded } from "./data/seed-loader";

function useHashRoute() {
  const [route, setRoute] = useState<string>(
    () => location.hash.replace("#", "") || "/"
  );
  useEffect(() => {
    const handler = () => setRoute(location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (path: string) => {
    location.hash = path;
  };
  return { route, navigate };
}

export function App() {
  const { route, navigate } = useHashRoute();

  useEffect(() => {
    ensureSeedsLoaded();
  }, []);

  const Screen = () => {
    if (route.startsWith("/poll-results/")) {
      const pollId = route.split("/poll-results/")[1];
      return <PollResults pollId={pollId} navigate={navigate} />;
    }
    
    switch (route) {
      case "/create":
        return <Create navigate={navigate} />;
      case "/vote":
        return <Vote navigate={navigate} />;
      case "/recents":
        return <Recents navigate={navigate} />;
      case "/saved":
        return <Saved navigate={navigate} />;
      case "/":
      default:
        return <Landing navigate={navigate} />;
    }
  };

  return (
    <UserProvider>
      <CatalogProvider>
        <PollsProvider>
          <SavedProvider>
            <div className={`min-h-screen bg-white ${route !== "/vote" ? "pb-20" : ""}`}>
              <Screen />
              {route !== "/vote" && <BottomNav route={route} navigate={navigate} />}
            </div>
          </SavedProvider>
        </PollsProvider>
      </CatalogProvider>
    </UserProvider>
  );
}
