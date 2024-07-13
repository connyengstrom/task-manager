import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const user = await response.json();
        login(user);
        setMessage("Login successful. Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("Error logging in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-lg rounded w-80">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-gray-50 text-gray-900 border-gray-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-gray-50 text-gray-900 border-gray-300"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {loading ? <span className="loader"></span> : "Login"}
        </button>
        {message && <p className="mt-4 text-center text-gray-900">{message}</p>}
      </form>
    </div>
  );
};

export default Login;
