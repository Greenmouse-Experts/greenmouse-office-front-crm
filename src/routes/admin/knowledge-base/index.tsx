import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useAdminKBCategories,
  useAdminCreateKBCategory,
  useAdminUpdateKBCategory,
  useAdminDeleteKBCategory,
  useAdminKBArticles,
  useAdminCreateKBArticle,
  useAdminUpdateKBArticle,
  useAdminDeleteKBArticle,
  useAdminPublishKBArticle,
  useAdminArchiveKBArticle,
  type KnowledgeBaseCategory,
  type KnowledgeBaseArticle,
} from "@/api/knowledgeBaseApi";
import ConfirmModal, {
  type ConfirmModalHandle,
} from "@/components/ConfirmModal";

export const Route = createFileRoute("/admin/knowledge-base/")({
  component: RouteComponent,
});

const emptyArticle = {
  title: "",
  slug: "",
  summary: "",
  bodyMarkdown: "",
  categoryId: "",
  tags: "",
  isFeatured: false,
};
type ArticleForm = typeof emptyArticle;

function RouteComponent() {
  const categories = useAdminKBCategories();
  const articles = useAdminKBArticles();
  const createCategory = useAdminCreateKBCategory();
  const updateCategory = useAdminUpdateKBCategory();
  const deleteCategory = useAdminDeleteKBCategory();
  const createArticle = useAdminCreateKBArticle();
  const updateArticle = useAdminUpdateKBArticle();
  const deleteArticle = useAdminDeleteKBArticle();
  const publishArticle = useAdminPublishKBArticle();
  const archiveArticle = useAdminArchiveKBArticle();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [articleId, setArticleId] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleForm>(emptyArticle);
  const confirmRef = useRef<ConfirmModalHandle>(null);

  useEffect(() => {
    if (!articleId && !article.categoryId && categories.data?.[0]) {
      setArticle((current) => ({
        ...current,
        categoryId: categories.data![0].id,
      }));
    }
  }, [articleId, article.categoryId, categories.data]);

  const editCategory = (item: KnowledgeBaseCategory) => {
    setCategoryId(item.id);
    setCategoryName(item.name);
    setCategoryDescription(item.description || "");
  };
  const editArticle = (item: KnowledgeBaseArticle) => {
    setArticleId(item.id);
    setArticle({
      title: item.title,
      slug: item.slug || "",
      summary: item.summary || "",
      bodyMarkdown: item.bodyMarkdown,
      categoryId: item.categoryId,
      tags: (item.tags || []).join(", "),
      isFeatured: item.isFeatured || false,
    });
  };
  const reportError = (error: any) =>
    toast.error(
      error?.response?.data?.message || "The request failed. Try again.",
    );

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
      };
      if (categoryId)
        await updateCategory.mutateAsync({ id: categoryId, ...payload });
      else await createCategory.mutateAsync(payload);
      toast.success(categoryId ? "Category updated." : "Category created.");
      setCategoryId(null);
      setCategoryName("");
      setCategoryDescription("");
    } catch (error) {
      reportError(error);
    }
  };
  const saveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        title: article.title.trim(),
        bodyMarkdown: article.bodyMarkdown,
        categoryId: article.categoryId,
        slug: article.slug.trim() || undefined,
        summary: article.summary.trim() || undefined,
        tags: article.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isFeatured: article.isFeatured,
      };
      if (articleId)
        await updateArticle.mutateAsync({ id: articleId, ...payload });
      else await createArticle.mutateAsync(payload);
      toast.success(articleId ? "Article updated." : "Draft article created.");
      setArticleId(null);
      setArticle({
        ...emptyArticle,
        categoryId: categories.data?.[0]?.id || "",
      });
    } catch (error) {
      reportError(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold">Knowledge base</h1>
        <p className="text-base-content/70 mt-1">
          Organize categories and publish help articles.
        </p>
      </div>
      <section className="bg-base-100 rounded-box p-6 space-y-5">
        <h2 className="text-lg font-semibold">Categories</h2>
        {categories.isError && (
          <p role="alert" className="text-error">
            Could not load categories.{" "}
            <button className="link" onClick={() => categories.refetch()}>
              Retry
            </button>
          </p>
        )}
        {categories.isLoading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.data?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-base-200 rounded-box px-3 py-2"
              >
                <span>{item.name}</span>
                <button
                  type="button"
                  className="link link-primary text-sm"
                  onClick={() => editCategory(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="link link-error text-sm"
                  onClick={async () => {
                    if (
                      !(await confirmRef.current?.confirm({
                        title: "Delete category",
                        message: `Delete category "${item.name}"? This cannot be undone.`,
                        confirmLabel: "Delete",
                      }))
                    )
                      return;
                    try {
                      await deleteCategory.mutateAsync(item.id);
                      toast.success("Category deleted.");
                    } catch (error) {
                      reportError(error);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={saveCategory}
          className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
        >
          <label className="form-control">
            Name
            <input
              className="input input-bordered w-full"
              required
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
            />
          </label>
          <label className="form-control">
            Description
            <input
              className="input input-bordered w-full"
              value={categoryDescription}
              onChange={(event) => setCategoryDescription(event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              className="btn btn-primary"
            >
              {categoryId ? "Save" : "Add category"}
            </button>
            {categoryId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setCategoryId(null);
                  setCategoryName("");
                  setCategoryDescription("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="bg-base-100 rounded-box p-6 space-y-5">
        <h2 className="text-lg font-semibold">Articles</h2>
        {articles.isError && (
          <p role="alert" className="text-error">
            Could not load articles.{" "}
            <button className="link" onClick={() => articles.refetch()}>
              Retry
            </button>
          </p>
        )}
        {articles.isLoading ? (
          <p>Loading articles...</p>
        ) : articles.data?.length ? (
          <div className="divide-y divide-base-200">
            {articles.data.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-wrap gap-3 items-center justify-between"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-base-content/70">
                    {item.status} ·{" "}
                    {item.category?.name ||
                      categories.data?.find(
                        (category) => category.id === item.categoryId,
                      )?.name ||
                      "Uncategorized"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => editArticle(item)}
                  >
                    Edit
                  </button>
                  {item.status !== "published" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={async () => {
                        try {
                          await publishArticle.mutateAsync(item.id);
                          toast.success("Article published.");
                        } catch (error) {
                          reportError(error);
                        }
                      }}
                    >
                      Publish
                    </button>
                  )}
                  {item.status !== "archived" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={async () => {
                        try {
                          await archiveArticle.mutateAsync(item.id);
                          toast.success("Article archived.");
                        } catch (error) {
                          reportError(error);
                        }
                      }}
                    >
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost text-error"
                    onClick={async () => {
                      if (
                        !(await confirmRef.current?.confirm({
                          title: "Delete article",
                          message: `Delete article "${item.title}"? This cannot be undone.`,
                          confirmLabel: "Delete",
                        }))
                      )
                        return;
                      try {
                        await deleteArticle.mutateAsync(item.id);
                        toast.success("Article deleted.");
                      } catch (error) {
                        reportError(error);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No articles yet. Create the first draft below.</p>
        )}
        <form
          onSubmit={saveArticle}
          className="space-y-3 border-t border-base-200 pt-5"
        >
          <h3 className="font-semibold">
            {articleId ? "Edit article" : "New draft"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="form-control">
              Title
              <input
                className="input input-bordered w-full"
                required
                value={article.title}
                onChange={(event) =>
                  setArticle({ ...article, title: event.target.value })
                }
              />
            </label>
            <label className="form-control">
              Category
              <select
                className="select select-bordered w-full"
                required
                value={article.categoryId}
                onChange={(event) =>
                  setArticle({ ...article, categoryId: event.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="form-control">
              Slug
              <input
                className="input input-bordered w-full"
                value={article.slug}
                onChange={(event) =>
                  setArticle({ ...article, slug: event.target.value })
                }
              />
            </label>
            <label className="form-control">
              Tags, separated by commas
              <input
                className="input input-bordered w-full"
                value={article.tags}
                onChange={(event) =>
                  setArticle({ ...article, tags: event.target.value })
                }
              />
            </label>
          </div>
          <label className="form-control">
            Summary
            <textarea
              className="textarea textarea-bordered w-full"
              value={article.summary}
              onChange={(event) =>
                setArticle({ ...article, summary: event.target.value })
              }
            />
          </label>
          <label className="form-control">
            Article body (Markdown)
            <textarea
              className="textarea textarea-bordered w-full min-h-56 font-mono"
              required
              value={article.bodyMarkdown}
              onChange={(event) =>
                setArticle({ ...article, bodyMarkdown: event.target.value })
              }
            />
          </label>
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={article.isFeatured}
              onChange={(event) =>
                setArticle({ ...article, isFeatured: event.target.checked })
              }
            />
            Featured article
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={
                createArticle.isPending ||
                updateArticle.isPending ||
                !categories.data?.length
              }
              className="btn btn-primary"
            >
              {articleId ? "Save article" : "Create draft"}
            </button>
            {articleId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setArticleId(null);
                  setArticle({
                    ...emptyArticle,
                    categoryId: categories.data?.[0]?.id || "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <ConfirmModal ref={confirmRef} />
    </div>
  );
}
