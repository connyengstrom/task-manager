import Link from "next/link";
import { useAuth } from "../context/authContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Task Manager</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/">
                <a className="text-blue-500 hover:underline">Tasks</a>
              </Link>
            </li>
            {user ? (
              <li>
                <button
                  onClick={logout}
                  className="text-blue-500 hover:underline"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login">
                    <a className="text-blue-500 hover:underline">Login</a>
                  </Link>
                </li>
                <li>
                  <Link href="/signup">
                    <a className="text-blue-500 hover:underline">Sign Up</a>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
