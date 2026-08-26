/*
 * Design reminder: Editorial Utility / دفتر التدريب التحريري.
 * Keep the app shell focused on the training journal; no generic centered auth or dashboard wrappers.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const appBasePath = import.meta.env.BASE_URL;

function Router() {
  const normalizedBasePath = appBasePath === "/" ? "/" : appBasePath.replace(/\/$/, "");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  if (currentPath === normalizedBasePath) return <Home />;

  return (
    <Switch>
      <Route path={appBasePath} component={Home} />
      {appBasePath !== "/" && <Route path="/" component={Home} />}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
