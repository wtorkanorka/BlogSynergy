import { useEffect, useState } from "react";

import "./App.css";
import axios from "axios";
import { CreatePostContainer } from "./components/CreatePostContainer";

import { PostContainer } from "./components/PostContainer";
import { useNavigate } from "react-router-dom";
import { LogOutContainer } from "./components/LogOutContainer";
import type { IPost } from "./Types/types";
import { SortingContainer } from "./components/SortingContainer";

function App() {
  const [data, setData] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(true);
  const userId = JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data
    ?.user?.id;

  const navigate = useNavigate();

  async function getPosts() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/posts?range=100${
          !isGlobalSearch ? `&nonGlobal=true&userId=${userId}` : ""
        }`
      );
      const data = response.data;

      setData(data);
      setIsLoading(false);

      return data;
    } catch (e: any) {
      e.response.statusText === "Unauthorized" && navigate("/login");
      if (e.error) setIsLoading(false);
    }
  }

  useEffect(() => {
    getPosts();
  }, [isGlobalSearch]);
  return (
    <div className="flex justify-between gap-[20px] max-md:flex-wrap-reverse">
      <div className="flex w-full flex-col gap-[10px] ">
        {!isLoading && data.length === 0 && <p>Нет постов, увы</p>}
        {!isLoading &&
          data.length !== 0 &&
          data.map((post: IPost) => {
            return (
              <PostContainer
                post={post}
                key={post.id}
                authorData={{
                  userId: post.authorId,
                  firstName: post.authorFirstName,
                  lastName: post.authorLastName,
                }}
                comments={post.comments}
              />
            );
          })}
      </div>
      <div className="flex flex-col gap-[10px] sticky max-md:relative top-0 w-full max-w-[380px] max-md:max-w-full">
        <p>
          {JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.session
            ?.user?.user_metadata?.first_name ?? ""}{" "}
          {JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.session
            ?.user?.user_metadata?.last_name ?? ""}
        </p>
        <LogOutContainer />
        <CreatePostContainer />
        <div className="flex gap-[10px] items-center justify-between w-full">
          {isGlobalSearch && <p>Глобальный поиск</p>}
          {!isGlobalSearch && <p>Поиск на основе подписок</p>}
          <input
            type="checkbox"
            name="globalSearch"
            className="w-[20px] h-[20px]"
            checked={isGlobalSearch}
            onChange={(e) => {
              setIsGlobalSearch(e.target.checked);
            }}
          />
        </div>
        <SortingContainer data={data} setData={setData} />
      </div>
    </div>
  );
}

export default App;
