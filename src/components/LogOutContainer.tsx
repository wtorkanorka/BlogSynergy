import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const LogOutContainer = () => {
  const [logoutData, setLogoutData] = useState<any>(null);

  const navigate = useNavigate();
  async function logout() {
    try {
      const data = await axios.post("/logout");

      setLogoutData(data);
      console.log(data, "LOGOUT DATA");
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    if (logoutData?.data?.message == "Logged out successfully") {
      navigate("/login");
    }
  }, [logoutData]);
  return (
    <button
      className="hover:bg-white w-full flex-col font-bold items-baseline gap-5 p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)] active:shadow-[0_0_10px_rgba(127,127,127,0.5)] active:transition-[0.1s]"
      onClick={() => logout()}
    >
      Выйти из аккаунта?
    </button>
  );
};
