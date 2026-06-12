import AppRouter from "./router";
import { Header } from "./components/layout";
import { NotificationProvider } from "./hooks/useNotification";
import NotificationCenter from "./components/common/NotificationCenter";
import { AuthProvider } from "./store";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="app-shell">
          <Header />
          <AppRouter />
          <NotificationCenter />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
