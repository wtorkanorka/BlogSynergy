import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { IPost } from "../Types/types";

export const SortingContainer = ({
  data,
  setData,
}: {
  data: IPost[];
  setData: React.Dispatch<React.SetStateAction<IPost[]>>;
}) => {
  const [listOfTags, setListOfTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;

    const tags = data.flatMap((item) =>
      Array.isArray(item.tags)
        ? item.tags.filter((tag) => typeof tag === "string")
        : []
    );

    setListOfTags([...new Set(tags)].sort());
  }, [data]);

  const availableTags = useMemo(
    () => listOfTags.filter((tag) => !selectedTags.includes(tag)),
    [listOfTags, selectedTags]
  );

  const sortPosts = useCallback((posts: IPost[], tags: string[]) => {
    if (!tags.length) return posts;

    return [...posts].sort((a, b) => {
      const aMatches = a.tags?.filter((tag) => tags.includes(tag)).length || 0;
      const bMatches = b.tags?.filter((tag) => tags.includes(tag)).length || 0;
      return bMatches - aMatches;
    });
  }, []);

  useEffect(() => {
    const sorted = sortPosts(data, selectedTags);
    if (JSON.stringify(sorted) !== JSON.stringify(data)) {
      setData(sorted);
    }
  }, [data, selectedTags, setData, sortPosts]);

  const handleTagSelect = useCallback(
    (tag: string) => setSelectedTags((prev) => [...prev, tag]),
    []
  );

  const handleTagRemove = useCallback(
    (tag: string) => setSelectedTags((prev) => prev.filter((t) => t !== tag)),
    []
  );

  return (
    <div>
      <div className="mb-4">
        <p className="font-bold mb-2">Выбранные теги:</p>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagRemove(tag)}
              className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              {tag} ×
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-bold mb-2">Доступные теги:</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
