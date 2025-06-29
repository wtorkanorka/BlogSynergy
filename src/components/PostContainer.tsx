import axios from "axios";

import { useEffect, useState, type ChangeEvent } from "react";
import type { IPost } from "../Types/types";

export const PostContainer = ({
  post,
  authorData,
}: {
  post: IPost;
  authorData: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  comments: {
    id: string;
    userId: string;
    authorFirstName: string;
    authorLastName: string;
    content: string;
    createdAt: string;
  }[];
}) => {
  const [updatedPost, setIsUpadatedPost] = useState<IPost>(post);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState<string>(updatedPost.title || "");
  const [postContent, setPostContent] = useState<string>(updatedPost.content);
  const [postIsPrivate, setPostIsPrivate] = useState<boolean>(
    updatedPost.isPrivate
  );
  const [postTags, setPostTags] = useState<string[]>(updatedPost.tags);
  const [newTag, setNewTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState<null | boolean>(null);
  // const [listOfSubscription, setListOfSubscription] = useState<null | any[]>(
  //   null
  // );
  const [commentForPost, setCommentForPost] = useState<string>("");

  const yourId =
    JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.session?.user
      ?.user_metadata?.sub ?? "";
  const yourMetaData =
    JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.user ?? "";

  const form = {
    title: postTitle,
    content: postContent,
    isPrivate: postIsPrivate,
    tags: postTags,
  };

  async function editPost() {
    try {
      const data = await axios.put(`/posts/${updatedPost.id}`, form);

      if (data.status == 200) {
        setIsUpadatedPost(data.data);
        setIsEditing(false);
      }
      return data;
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.error);
      console.log(e);
    }
  }

  async function deletePost(id: string) {
    try {
      const data = await axios.delete(`/posts/${id}`);
      if (data.status == 200) {
        location.reload();
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  function toggleSubscribe() {
    isSubscribed ? unSubscribeOnUser() : subscribeOnUser();
  }

  async function subscribeOnUser() {
    try {
      const data = await axios.post(`/subscriptions`, {
        subscriber: {
          userId: yourMetaData.id || "",
          firstName: yourMetaData.user_metadata.first_name || "",
          lastName: yourMetaData.user_metadata.last_name || "",
        },
        owner: {
          userId: authorData.userId,
          firstName: authorData.firstName,
          lastName: authorData.lastName,
        },
      });

      getUsersSubscription();

      return data;
    } catch (e: any) {
      e?.response?.data?.error == "Already subscribed" && setIsSubscribed(true);
      console.log(e);
    }
  }
  async function unSubscribeOnUser() {
    try {
      const data = await axios.delete(`/subscriptions`, {
        data: {
          subscriber: {
            userId: yourMetaData.id || "",
            firstName: yourMetaData.user_metadata.first_name || "",
            lastName: yourMetaData.user_metadata.last_name || "",
          },
          owner: {
            userId: authorData.userId,
            firstName: authorData.firstName,
            lastName: authorData.lastName,
          },
        },
      });
      getUsersSubscription();

      return data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async function getUsersSubscription() {
    try {
      const data: any = await axios.get(`/subscriptions/${authorData.userId}`);

      if (data.data.message) {
        setIsSubscribed(false);
      }
      const isSubscribed =
        data && data.data[0] && data.data[0].subscribers
          ? data.data[0].subscribers.find((elem: any) => {
              return elem.userId === yourMetaData.id;
            })
          : false;
      if (isSubscribed) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
      // console.log("AAAAAAAAAAAAA", isSubscribed);
      // setListOfSubscription(data);

      return data;
    } catch (e) {
      console.log(e);
      throw e; // Пробрасываем ошибку для обработки выше
    }
  }

  useEffect(() => {
    getUsersSubscription();
  }, []);

  async function sendComment() {
    try {
      const data: any = await axios.post(`/posts/comments/${updatedPost.id}`, {
        // id: uuidv4(),
        postId: updatedPost.id,
        userId: yourMetaData.id || "",
        firstName: yourMetaData.user_metadata.first_name || "",
        lastName: yourMetaData.user_metadata.last_name || "",
        content: commentForPost,
      });
      if (data.status === 200) {
        setCommentForPost("");
        setIsUpadatedPost(data.data.updatedPost);
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  const showContent =
    updatedPost.authorId === yourMetaData.id || // Я автор поста
    updatedPost.isPrivate === false || // Пост публичный
    (updatedPost.isPrivate === true && isSubscribed); // Пост приватный, но я подписан

  return (
    <div className="flex w-full gap-[10px] hover:bg-white flex-col items-baseline p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)]">
      <div className="flex gap-[5px] w-full items-center">
        <div className="flex justify-between w-full gap-[10px]">
          <p className="font-bold">
            {updatedPost.authorFirstName ? updatedPost.authorFirstName : ""}{" "}
            {updatedPost.authorLastName ? updatedPost.authorLastName : ""}
          </p>
          {isSubscribed !== null && (
            <button
              onClick={() => {
                toggleSubscribe();
              }}
              className={`${updatedPost.authorId == yourId && "hidden"}`}
            >
              {isSubscribed ? "Отписаться" : "Подписаться"}
            </button>
          )}
          <p>{new Date(updatedPost.publishedAt).toLocaleDateString()}</p>
          <button
            className={`${updatedPost.authorId !== yourId && "hidden"}`}
            onClick={() => {
              setIsEditing((prev) => !prev);
            }}
          >
            Редактировать
          </button>
        </div>
      </div>
      {showContent && (
        <div className="flex flex-col gap-[5px] items-baseline">
          {!isEditing && (
            <h2 className="font-bold text-[30px] break-all leading-[20px]">
              {updatedPost.title}
            </h2>
          )}
          {!isEditing && (
            <p className="text-[25px] break-all leading-[20px]">
              {updatedPost.content}
            </p>
          )}
          {!isEditing && (
            <div className="flex w-full flex-wrap gap-[10px]">
              {updatedPost.tags.map((tag: string, index: number) => {
                return (
                  <p
                    className="p-[1px] max-w-[100px] truncate  border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    key={index}
                  >
                    {tag}11111111111111111
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!showContent && (
        <div className="flex flex-col gap-[5px] items-baseline">
          {!isEditing && (
            <h2 className="font-bold text-[30px] break-all leading-[20px]">
              Подпишитесь на пользователя чтобы увидеть контент
            </h2>
          )}
        </div>
      )}

      {isEditing && (
        <div>
          <p>Название</p>
          <input
            type="text"
            placeholder={postTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPostTitle(e.currentTarget.value || "");
            }}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p>Контент</p>
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPostContent(e.currentTarget.value || "");
            }}
            placeholder={postContent}
            type="text"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex items-center gap-[10px] my-[10px]">
            <p className="text-right">Сделать приватным?</p>
            <input
              type="checkbox"
              name="isPrivate"
              checked={postIsPrivate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPostIsPrivate(e.target.checked);
              }}
              className="w-[20px] h-[20px]"
            />
          </div>
          <div className="hover:bg-white w-full flex flex-wrap items-baseline gap-[10px] p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)] active:shadow-[0_0_10px_rgba(127,127,127,0.5)] active:transition-[0.1s]">
            {postTags &&
              postTags.map((arrayTag: string, index: number) => {
                return (
                  <button
                    key={index}
                    title="Удалить"
                    onClick={() => {
                      setPostTags(
                        postTags.filter((tag: string) => arrayTag !== tag)
                      );
                    }}
                  >
                    {arrayTag}
                  </button>
                );
              })}
            <form
              onSubmit={(e: ChangeEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (newTag === "") return;
                setPostTags([...postTags, newTag]);
                setNewTag("");
              }}
              className="flex gap-[10px] items-center"
            >
              <input
                type="text"
                value={newTag}
                className="bg-white w-[90px] rounded-[5px] shadow-[3px_3px_10px_rgba(10,10,10,0.5)]"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setNewTag(e.currentTarget.value);
                }}
              />
              <button type="submit">Добавить</button>
            </form>
          </div>
          {errorMessage !== "" && <p>{errorMessage}</p>}
          <div className="flex gap-[10px] justify-between">
            <button
              className="flex hover:bg-white flex-col items-baseline p-2 mb-[20px] rounded-lg text-white font-bold hover:text-[rgb(83,255,92)] bg-[rgb(83,255,92)] backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)]"
              onClick={() => {
                editPost();
              }}
            >
              Сохранить
            </button>
            <button
              className={`${
                updatedPost.authorId !== yourId && "hidden"
              } flex hover:bg-white flex-col items-baseline p-2 mb-[20px] rounded-lg text-white font-bold hover:text-[rgb(255,93,93)] bg-[rgb(255,93,93)] backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)]`}
              onClick={() => {
                deletePost(post.id);
              }}
            >
              Удалить Пост
            </button>
          </div>
        </div>
      )}
      {updatedPost.comments !== null && (
        <div>
          {updatedPost.comments.map((comment: any) => {
            return (
              <div
                key={comment.id}
                className="mt-[10px] flex flex-col  items-baseline w-full hover:bg-white  p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)]"
              >
                <div className="flex justify-between items-center gap-[10px]">
                  <p>
                    {comment.authorFirstName} {comment.authorLastName}
                  </p>
                  <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (commentForPost == "") return;
          sendComment();
        }}
      >
        <input
          type="text"
          value={commentForPost}
          placeholder="Написать комментарий"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setCommentForPost(e.target.value);
          }}
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};
