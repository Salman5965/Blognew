import { useState, useCallback, useRef, useEffect } from "react";
import { LOCAL_STORAGE_KEYS, DEBOUNCE_DELAY } from "@/utils/constant";
import { slugify } from "@/utils/slugify";
import { useDebouncedCallback } from "./useDebounce";

const INITIAL_STATE = {
  title: "",
  content: "",
  excerpt: "",
  coverImage: "",
  category: "", // Added category field
  tags: [],
  isPublished: false,
  visibility: "public", // Added visibility field
};

export function useBlogEditor({ initialBlog, autoSave = true, onSave } = {}) {
  const [title, setTitleState] = useState(
    initialBlog?.title || INITIAL_STATE.title,
  );
  const [content, setContentState] = useState(
    initialBlog?.content || INITIAL_STATE.content,
  );
  const [excerpt, setExcerptState] = useState(
    initialBlog?.excerpt || INITIAL_STATE.excerpt,
  );
  const [coverImage, setCoverImageState] = useState(
    initialBlog?.coverImage || INITIAL_STATE.coverImage,
  );
  const [category, setCategoryState] = useState(
    initialBlog?.category || INITIAL_STATE.category,
  ); // Added category state
  const [tags, setTagsState] = useState(
    initialBlog?.tags || INITIAL_STATE.tags,
  );
  const [isPublished, setIsPublishedState] = useState(
    initialBlog?.isPublished || INITIAL_STATE.isPublished,
  );
  const [visibility, setVisibilityState] = useState(
    initialBlog?.visibility || INITIAL_STATE.visibility,
  );

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const initialStateRef = useRef({
    title: initialBlog?.title || "",
    content: initialBlog?.content || "",
    excerpt: initialBlog?.excerpt || "",
    coverImage: initialBlog?.coverImage || "",
    category: initialBlog?.category || "", // Added to initial state ref
    tags: initialBlog?.tags || [],
    visibility: initialBlog?.visibility || "public",
    isPublished: initialBlog?.isPublished || false,
  });

  const [debouncedSave] = useDebouncedCallback(() => {
    if (autoSave && isDirty && !isPublished) {
      saveDraft();
    }
  }, DEBOUNCE_DELAY.AUTO_SAVE);

  const setTitle = useCallback(
    (newTitle) => {
      setTitleState(newTitle);
      setIsDirty(true);
      debouncedSave();
    },
    [debouncedSave],
  );

  const setContent = useCallback(
    (newContent) => {
      setContentState(newContent);
      setIsDirty(true);
      debouncedSave();
    },
    [debouncedSave],
  );

  const setExcerpt = useCallback(
    (newExcerpt) => {
      setExcerptState(newExcerpt);
      setIsDirty(true);
      debouncedSave();
    },
    [debouncedSave],
  );

  const setCoverImage = useCallback(
    (url) => {
      setCoverImageState(url);
      setIsDirty(true);
      debouncedSave();
    },
    [debouncedSave],
  );

  // Added setCategory function
  const setCategory = useCallback(
    (newCategory) => {
      console.log("Hook setCategory called with:", newCategory);
      setCategoryState(newCategory);
      setIsDirty(true);
      debouncedSave();
    },
    [debouncedSave],
  );

  const setTags = useCallback(
    (newTags) => {
      setTagsState(newTags);
      setIsDirty(true);
      debouncedSave();
    },
    [debouncedSave],
  );

  const setIsPublished = useCallback((published) => {
    setIsPublishedState(published);
    setIsDirty(true);
  }, []);

  const setVisibility = useCallback((newVisibility) => {
    setVisibilityState(newVisibility);
    setIsDirty(true);
  }, []);

  const addTag = useCallback(
    (tag) => {
      const trimmedTag = tag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
    },
    [tags, setTags],
  );

  const removeTag = useCallback(
    (tag) => {
      setTags(tags.filter((t) => t !== tag));
    },
    [tags, setTags],
  );

  const generateExcerpt = useCallback(() => {
    if (!content) return;

    const plainText = content.replace(/<[^>]*>/g, "");
    const words = plainText.split(" ").slice(0, 25).join(" ");
    const truncated =
      words.length > 150 ? words.substring(0, 150) + "..." : words;

    setExcerpt(truncated);
  }, [content]);

  const generateSlug = useCallback(() => {
    return slugify(title);
  }, [title]);

  const saveDraft = useCallback(() => {
    const draftData = {
      title,
      content,
      excerpt,
      coverImage,
      category, // Added category to draft data
      tags,
      isPublished: false,
      visibility,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.DRAFT_BLOG,
      JSON.stringify(draftData),
    );
    setLastSaved(new Date());
  }, [title, content, excerpt, coverImage, category, tags]);

  const loadDraft = useCallback(() => {
    const draftData = localStorage.getItem(LOCAL_STORAGE_KEYS.DRAFT_BLOG);
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        setTitleState(draft.title || "");
        setContentState(draft.content || "");
        setExcerptState(draft.excerpt || "");
        setCoverImageState(draft.coverImage || "");
        setCategoryState(draft.category || ""); // Added category loading
        setTagsState(draft.tags || []);
        setIsPublishedState(false);
        setVisibilityState(draft.visibility || "public");
        setIsDirty(false);
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DRAFT_BLOG);
  }, []);

  const reset = useCallback(() => {
    const initial = initialStateRef.current;
    setTitleState(initial.title);
    setContentState(initial.content);
    setExcerptState(initial.excerpt);
    setCoverImageState(initial.coverImage);
    setCategoryState(initial.category); // Added category reset
    setTagsState(initial.tags);
    setIsPublishedState(initial.isPublished);
    setIsDirty(false);
    setLastSaved(null);
  }, []);

  const getBlogData = useCallback(() => {
    const baseData = {
      title,
      content,
      excerpt,
      coverImage,
      category, // Added category to blog data
      tags,
      isPublished,
    };

    if (initialBlog?.id) {
      return { ...baseData, id: initialBlog.id };
    }

    return baseData;
  }, [
    title,
    content,
    excerpt,
    coverImage,
    category,
    tags,
    isPublished,
    initialBlog,
  ]);

  const populateFromBlog = useCallback((blog) => {
    if (!blog) return;

    setTitleState(blog.title || "");
    setContentState(blog.content || "");
    setExcerptState(blog.excerpt || "");
    setCoverImageState(blog.featuredImage || blog.coverImage || "");
    setCategoryState(blog.category || "");
    setTagsState(blog.tags || []);
    setIsPublishedState(
      blog.status === "published" || blog.isPublished || false,
    );

    // Update initial state ref for dirty checking
    initialStateRef.current = {
      title: blog.title || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      coverImage: blog.featuredImage || blog.coverImage || "",
      category: blog.category || "",
      tags: blog.tags || [],
      isPublished: blog.status === "published" || blog.isPublished || false,
    };

    setIsDirty(false);
  }, []);

  useEffect(() => {
    const current = {
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      isPublished,
    }; // Added category
    const initial = initialStateRef.current;

    const hasChanged =
      current.title !== initial.title ||
      current.content !== initial.content ||
      current.excerpt !== initial.excerpt ||
      current.coverImage !== initial.coverImage ||
      current.category !== initial.category || // Added category comparison
      JSON.stringify(current.tags) !== JSON.stringify(initial.tags) ||
      current.isPublished !== initial.isPublished;

    setIsDirty(hasChanged);
  }, [title, content, excerpt, coverImage, category, tags, isPublished]); // Added category dependency

  useEffect(() => {
    if (!initialBlog) {
      loadDraft();
    }
  }, [initialBlog, loadDraft]);

  return {
    title,
    content,
    excerpt,
    coverImage,
    category, // Added category to return
    tags,
    isPublished,
    visibility,
    isDirty,
    isSaving,
    lastSaved,

    setTitle,
    setContent,
    setExcerpt,
    setCoverImage,
    setCategory, // Added setCategory to return
    setTags,
    setIsPublished,
    setVisibility,

    addTag,
    removeTag,

    generateExcerpt,
    generateSlug,

    saveDraft,
    loadDraft,
    clearDraft,

    reset,
    getBlogData,
    populateFromBlog,
  };
}
