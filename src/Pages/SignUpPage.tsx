import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);
  // const [dataSignUp, setDataSignUp] = useState<null | any>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await axios.post("/register", {
        email,
        password,
        firstName,
        lastName,
      });
      return data;
      // setDataSignUp(data);
    } catch (err: any) {
      setError(err?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-2">Sign up today!</h2>
        <p>
          Already have an account? <Link to="/">Sign in</Link>
        </p>

        {/* Добавленные поля для имени и фамилии */}
        <div className="flex flex-col py-4">
          <input
            onChange={(e) => setFirstName(e.target.value)}
            className="p-3 mt-2"
            type="text"
            name="firstName"
            placeholder="First Name"
            required
          />
        </div>
        <div className="flex flex-col py-4">
          <input
            onChange={(e) => setLastName(e.target.value)}
            className="p-3 mt-2"
            type="text"
            name="lastName"
            placeholder="Last Name"
            required
          />
        </div>

        <div className="flex flex-col py-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 mt-2"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
        </div>
        <div className="flex flex-col py-4">
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 mt-2"
            type="password"
            name="password"
            placeholder="Password"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-4 p-3 ${
            loading ? "bg-gray-400" : "bg-blue-500 text-white"
          }`}
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
      </form>
    </div>
  );
};
