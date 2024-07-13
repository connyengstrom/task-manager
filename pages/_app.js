import '../styles/globals.css';
import { AuthProvider } from "../context/authContext";
import Header from "../components/Header";
import useAutoLogout from "../hooks/useAutoLogout";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <useAutoLogout />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}

export default MyApp;
