import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const ImagePreloader = ({
  src,
  alt,
  className,
  fallback = "/api/placeholder/400/300",
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder/Skeleton */}
      {!isLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

      {/* Main Image */}
      <img
        src={hasError ? fallback : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...props}
      />
    </div>
  );
};

export default ImagePreloader;
