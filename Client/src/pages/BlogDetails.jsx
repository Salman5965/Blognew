// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { PageWrapper } from "@/components/layout/PageWrapper";
// import { BlogMeta } from "@/components/blog/BlogMeta";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useBlogStore } from "@/features/blogs/blogStore";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { ROUTES, DEFAULT_COVER_IMAGE } from "@/utils/constant";
// import { ArrowLeft, Edit, Trash2, RefreshCw } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// export const BlogDetails = () => {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useAuthContext();
//   const {
//     currentBlog,
//     isLoading,
//     error,
//     getBlogBySlug,
//     deleteBlog,
//     clearError,
//   } = useBlogStore();

//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     if (slug) {
//       getBlogBySlug(slug);
//     }

//     return () => {
//       // Clear current blog when leaving the page
//       // setBlogStore({ currentBlog: null });
//     };
//   }, [slug, getBlogBySlug]);

//   const handleDelete = async () => {
//     if (!currentBlog) return;

//     try {
//       setIsDeleting(true);
//       await deleteBlog(currentBlog.id);
//       navigate(ROUTES.HOME);
//     } catch (error) {
//       console.error("Failed to delete blog:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleEdit = () => {
//     if (currentBlog) {
//       navigate(`${ROUTES.EDIT_BLOG}/${currentBlog.id}`);
//     }
//   };

//   const handleRetry = () => {
//     clearError();
//     if (slug) {
//       getBlogBySlug(slug);
//     }
//   };

//   if (isLoading) {
//     return (
//       <PageWrapper className="py-8">
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="flex items-center space-x-2">
//             <RefreshCw className="h-6 w-6 animate-spin" />
//             <span>Loading blog...</span>
//           </div>
//         </div>
//       </PageWrapper>
//     );
//   }

//   if (error) {
//     return (
//       <PageWrapper className="py-8">
//         <Alert variant="destructive">
//           <AlertDescription className="flex items-center justify-between">
//             <span>{error}</span>
//             <Button variant="outline" size="sm" onClick={handleRetry}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Retry
//             </Button>
//           </AlertDescription>
//         </Alert>
//       </PageWrapper>
//     );
//   }

//   if (!currentBlog) {
//     return (
//       <PageWrapper className="py-8">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
//           <p className="text-muted-foreground mb-6">
//             The blog you're looking for doesn't exist or has been removed.
//           </p>
//           <Button onClick={() => navigate(ROUTES.HOME)}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Home
//           </Button>
//         </div>
//       </PageWrapper>
//     );
//   }

//   const isOwner = isAuthenticated && user?.id === currentBlog.author.id;

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Back Button */}
//       <PageWrapper className="py-4">
//         <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//       </PageWrapper>

//       {/* Cover Image */}
//       {currentBlog.coverImage && (
//         <div className="w-full h-64 md:h-96 overflow-hidden">
//           <img
//             src={currentBlog.coverImage || DEFAULT_COVER_IMAGE}
//             alt={currentBlog.title}
//             className="w-full h-full object-cover"
//           />
//         </div>
//       )}

//       <PageWrapper maxWidth="4xl" className="py-8">
//         <article className="max-w-none">
//           {/* Header */}
//           <header className="mb-8">
//             <div className="flex items-start justify-between mb-6">
//               <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
//                 {currentBlog.title}
//               </h1>

//               {isOwner && (
//                 <div className="flex items-center space-x-2 ml-4">
//                   <Button variant="outline" size="sm" onClick={handleEdit}>
//                     <Edit className="h-4 w-4 mr-2" />
//                     Edit
//                   </Button>

//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button variant="outline" size="sm">
//                         <Trash2 className="h-4 w-4 mr-2" />
//                         Delete
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>Delete Blog</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           Are you sure you want to delete this blog? This action
//                           cannot be undone.
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={handleDelete}
//                           disabled={isDeleting}
//                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                         >
//                           {isDeleting ? "Deleting..." : "Delete"}
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               )}
//             </div>

//             <BlogMeta blog={currentBlog} />
//           </header>

//           {/* Content */}
//           <div className="prose prose-lg dark:prose-invert max-w-none">
//             {/* This would ideally render markdown/rich text */}
//             <div
//               dangerouslySetInnerHTML={{ __html: currentBlog.content }}
//               className="leading-relaxed"
//             />
//           </div>

//           {/* Footer Actions */}
//           <footer className="mt-12 pt-8 border-t">
//             <BlogMeta blog={currentBlog} variant="compact" />
//           </footer>
//         </article>

//         {/* Comments Section */}
//         <section className="mt-12">
//           <div className="border-t pt-8">
//             <h2 className="text-2xl font-bold mb-6">
//               Comments ({currentBlog.commentCount})
//             </h2>

//             {/* Comments would be rendered here */}
//             <div className="text-center py-8 text-muted-foreground">
//               <p>Comments feature coming soon...</p>
//             </div>
//           </div>
//         </section>
//       </PageWrapper>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BlogMeta } from "@/components/blog/BlogMeta";
import { CommentSection } from "@/components/blog/CommentSection";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBlogStore } from "@/features/blogs/blogStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES, DEFAULT_COVER_IMAGE } from "@/utils/constant";
import { ArrowLeft, Edit, Trash2, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const {
    currentBlog,
    isLoading,
    error,
    getBlogBySlug,
    deleteBlog,
    clearError,
  } = useBlogStore();

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (slug) {
      getBlogBySlug(slug);
    }

    return () => {
      // Clear current blog when leaving the page
      // setBlogStore({ currentBlog: null });
    };
  }, [slug, getBlogBySlug]);

  useEffect(() => {
    // Scroll to comments section if hash is present
    if (window.location.hash === "#comments" && !isLoading && currentBlog) {
      setTimeout(() => {
        const commentsSection = document.getElementById("comments");
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [isLoading, currentBlog]);

  const handleDelete = async () => {
    if (!currentBlog) return;

    try {
      setIsDeleting(true);
      await deleteBlog(currentBlog.id);
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Failed to delete blog:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (currentBlog) {
      navigate(`${ROUTES.EDIT_BLOG}/${currentBlog.id}`);
    }
  };

  const handleRetry = () => {
    clearError();
    if (slug) {
      getBlogBySlug(slug);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading blog...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="py-8">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  if (!currentBlog) {
    return (
      <PageWrapper className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
          <p className="text-muted-foreground mb-6">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(ROUTES.HOME)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const isOwner = isAuthenticated && user?.id === currentBlog.author.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <PageWrapper className="py-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </PageWrapper>

      {/* Cover Image */}
      {currentBlog.coverImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={currentBlog.coverImage || DEFAULT_COVER_IMAGE}
            alt={currentBlog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <PageWrapper maxWidth="4xl" className="py-8">
        <article className="max-w-none">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {currentBlog.title}
              </h1>

              {isOwner && (
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Blog</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this blog? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <BlogMeta blog={currentBlog} />
          </header>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* This would ideally render markdown/rich text */}
            <div
              dangerouslySetInnerHTML={{ __html: currentBlog.content }}
              className="leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <footer className="mt-12 pt-8 border-t">
            <BlogMeta blog={currentBlog} variant="compact" />
          </footer>
        </article>

        {/* Comments Section */}
        <section id="comments" className="mt-12">
          <div className="border-t pt-8">
            <CommentSection
              blogId={currentBlog._id || currentBlog.id}
              allowComments={currentBlog.allowComments}
            />
          </div>
        </section>
      </PageWrapper>
    </div>
  );
};
