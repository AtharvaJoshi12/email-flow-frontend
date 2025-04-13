"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading,setIsLoading] = useState(false)
  const router = useRouter();
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setMessage("");
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("https://email-flow-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Login successful");
        setIsLoading(false);
        router.push("/dashboard");
      } else {
        setMessage(data.error || "Login failed");
        setIsLoading(false);
      }
    } catch (err) {
      setMessage("Something went wrong");
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(
        "https://email-flow-backend.onrender.com/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Signup successful");
        setIsLoading(false);
        router.push("/dashboard");
      } else {
        setMessage(data.error || "Signup failed");
        setIsLoading(false);
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to FlowBuilder</h1>
      <div className="flex gap-4">
        <button
          onClick={() => {
            resetForm();
            setShowLogin(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={() => {
            resetForm();
            setShowSignup(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          Signup
        </button>

        <Link href="/dashboard">
          <button className="bg-yellow-500 text-gray-800 px-4 py-2 rounded hover:bg-yellow-600 cursor-pointer">
            Dashboard
          </button>
        </Link>
      </div>

      {(showLogin || showSignup) && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">
              {showLogin ? "Login" : "Signup"}
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <button
              onClick={showLogin ? handleLogin : handleSignup}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-2 cursor-pointer"
            >
              { isLoading?"Loading..." : showLogin ? "Login" : "Signup"}
            </button>
            <p className="text-sm text-center text-gray-700">{message}</p>
            <button
              onClick={() => {
                setShowLogin(false);
                setShowSignup(false);
              }}
              className="w-full mt-3 text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
