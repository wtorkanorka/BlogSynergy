import axios from "axios";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { IPost } from "../Types/types";

export const CreatePostContainer = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputCheckboxRef = useRef<HTMLInputElement>(null);

  type FormData = Omit<IPost, "views" | "id" | "comments">;

  const [form, setForm] = useState<FormData>({
    title: "",
    content: "",
    isPrivate: false,
    whitelist: [],
    publishedAt: new Date().toISOString(),
    tags: [],
    authorId:
      JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.session?.user
        ?.user_metadata?.sub ?? "",

    authorFirstName:
      JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.session?.user
        ?.user_metadata?.first_name ?? "",

    authorLastName:
      JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.session?.user
        ?.user_metadata?.last_name ?? "",
  });

  async function createPost() {
    try {
      setIsLoading(true);
      const data = await axios.post("/posts", { ...form });

      setIsLoading(false);
      if (data.status == 200) {
        location.reload();
      }
      return data;
    } catch (e: any) {
      setIsLoading(false);
    }
  }

  const handleTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(",").map((tag) => tag.trim());
    setForm((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", form);
    createPost();
  };

  return (
    <>
      <button
        className="hover:bg-white w-full flex-col font-bold items-baseline gap-5 p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)] active:shadow-[0_0_10px_rgba(127,127,127,0.5)] active:transition-[0.1s]"
        onClick={() => {
          setIsCreatingPost((prev) => !prev);
        }}
      >
        Написать пост
      </button>
      {isCreatingPost && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full hover:bg-white flex-col font-bold items-baseline gap-5 p-4 mb-[20px] rounded-lg bg-white/30 backdrop-blur-sm shadow-[0_0_10px_rgba(127,127,127,0.5)] hover:shadow-[5px_5px_10px_rgba(25,25,25,0.5)] active:shadow-[0_0_10px_rgba(127,127,127,0.5)] active:transition-[0.1s]"
        >
          {/* Автор (только для чтения) */}
          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author First Name
              </label>
              <input
                type="text"
                value={form.authorFirstName}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author Last Name
              </label>
              <input
                type="text"
                value={form.authorLastName}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
          </div> */}

          {/* Заголовок статьи */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Article Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Содержание статьи */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Теги */}
          <div className="flex items-center gap-[10px]">
            <div className="flex items-center gap-[10px]">
              <p className="text-right">
                Сделать
                <br /> приватным?
              </p>
              <input
                type="checkbox"
                name="isPrivate"
                checked={form.isPrivate}
                onChange={handleChange}
                className="w-[20px] h-[20px]"
                ref={inputCheckboxRef}
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                value={form.tags.join(", ")}
                onChange={handleTagsChange}
                className="w-[200px] p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="technology, science, art"
              />
              <p className="text-xs text-gray-500 mt-1 text-ellipsis truncate  max-w-[200px] ">
                Current tags: {form.tags.join(", ") || "none"}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Publish Article
            </button>
          </div>
        </form>
      )}
    </>
  );
};
