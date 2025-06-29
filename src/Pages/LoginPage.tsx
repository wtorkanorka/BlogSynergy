import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLogin, setDataLogin] = useState<null | any>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = await axios.post("/login", {
        email,
        password,
      }); // Call context function

      setDataLogin(data);
    } catch (err: any) {
      setError(err?.response?.data?.error); // Catch unexpected errors
    } finally {
      setLoading(false); // End loading state
    }
  };
  useEffect(() => {
    localStorage.setItem("yourMeta", JSON.stringify(dataLogin));
    if (dataLogin?.data?.session?.access_token) {
      navigate("/"); // Navigate to dashboard on success
    }
  }, [dataLogin]);
  return (
    <>
      <form onSubmit={handleLogin} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-2">Sign in today!</h2>
        <div className="flex flex-col py-4">
          {/* <label htmlFor="Email">Email</label> */}
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 mt-2"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col py-4">
          {/* <label htmlFor="Password">Password</label> */}
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 mt-2"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 hover:bg-whiteflex-col font-bold items-baseline gap-5 p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)] active:shadow-[0_0_10px_rgba(127,127,127,0.5)] active:transition-[0.1s]"
        >
          Sign in
        </button>
        <Link
          to="/register"
          className="w-full hover:bg-white flex-col font-bold items-baseline gap-5 p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)] active:shadow-[0_0_10px_rgba(127,127,127,0.5)] active:transition-[0.1s]"
        >
          Dont have an Account? Register
        </Link>
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
      </form>
    </>
  );
};
