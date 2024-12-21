import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/auth/signup", { username, password });
      alert("Signup successful, please login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
          Create an Account
        </h2>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 
                        placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 
                        placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 
                     text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 
                     focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-800 transition-all"
          >
            Signup
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?
            <Link
              to="/login"
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                       font-medium underline ml-1"
            >
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
