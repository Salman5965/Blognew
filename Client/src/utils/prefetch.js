/**
 * Resource prefetching utilities for performance optimization
 */

import { getNetworkInfo, shouldLazyLoad } from "./performance";
import { ApiCache } from "./cache";

/**
 * Prefetch manager for intelligent resource loading
 */
export class PrefetchManager {
  static prefetchQueue = new Set();
  static isProcessing = false;
  static maxConcurrent = 3;
  static currentConcurrent = 0;

  /**
   * Prefetch a URL with priority and caching
   */
  static async prefetch(url, options = {}) {
    const {
      priority = "low",
      cache = true,
      timeout = 5000,
      crossOrigin = "anonymous",
    } = options;

    // Check if already prefetched
    if (this.prefetchQueue.has(url)) {
      return;
    }

    // Check network conditions
    const networkInfo = getNetworkInfo();
    if (networkInfo?.saveData || networkInfo?.effectiveType === "slow-2g") {
      console.log("Skipping prefetch due to data saver or slow connection");
      return;
    }

    this.prefetchQueue.add(url);

    // Add to queue
    return this.addToQueue({
      url,
      priority,
      cache,
      timeout,
      crossOrigin,
    });
  }

  /**
   * Prefetch multiple URLs
   */
  static async prefetchMultiple(urls, options = {}) {
    const promises = urls.map((url) => this.prefetch(url, options));
    return Promise.allSettled(promises);
  }

  /**
   * Prefetch with link tag (browser native)
   */
  static prefetchWithLink(href, as = "fetch", crossOrigin = "anonymous") {
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    link.as = as;
    link.crossOrigin = crossOrigin;

    link.onload = () => {
      console.log(`Prefetched: ${href}`);
    };

    link.onerror = () => {
      console.warn(`Failed to prefetch: ${href}`);
    };

    document.head.appendChild(link);

    // Clean up after some time
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 30000);
  }

  /**
   * Preload critical resources
   */
  static preloadCritical(href, as, type = null, crossOrigin = "anonymous") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    link.crossOrigin = crossOrigin;

    if (type) {
      link.type = type;
    }

    document.head.appendChild(link);
  }

  /**
   * DNS prefetch for external domains
   */
  static dnsPrefetch(domain) {
    const link = document.createElement("link");
    link.rel = "dns-prefetch";
    link.href = `//${domain}`;
    document.head.appendChild(link);
  }

  /**
   * Add request to processing queue
   */
  static async addToQueue(request) {
    return new Promise((resolve, reject) => {
      const processQueue = async () => {
        if (this.currentConcurrent >= this.maxConcurrent) {
          setTimeout(processQueue, 100);
          return;
        }

        this.currentConcurrent++;

        try {
          const result = await this.executeRequest(request);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentConcurrent--;
          this.prefetchQueue.delete(request.url);
        }
      };

      processQueue();
    });
  }

  /**
   * Execute prefetch request
   */
  static async executeRequest(request) {
    const { url, timeout, cache } = request;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        mode: "cors",
        credentials: "same-origin",
        cache: "force-cache",
      });

      clearTimeout(timeoutId);

      if (response.ok && cache) {
        // Cache the response
        const cacheKey = `prefetch:${url}`;
        const data = await response.clone().text();
        ApiCache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

/**
 * Route prefetching for React Router
 */
export class RoutePrefetcher {
  static prefetchedRoutes = new Set();

  /**
   * Prefetch route component and data
   */
  static async prefetchRoute(path, loadComponent, loadData = null) {
    if (this.prefetchedRoutes.has(path)) {
      return;
    }

    this.prefetchedRoutes.add(path);

    try {
      // Prefetch component
      if (loadComponent) {
        await loadComponent();
      }

      // Prefetch data
      if (loadData) {
        await loadData();
      }

      console.log(`Route prefetched: ${path}`);
    } catch (error) {
      console.warn(`Failed to prefetch route ${path}:`, error);
      this.prefetchedRoutes.delete(path);
    }
  }

  /**
   * Prefetch routes based on current route
   */
  static prefetchRelatedRoutes(currentPath) {
    const routeMap = {
      "/": ["/feed", "/dashboard"],
      "/feed": ["/create-blog", "/dashboard/profile"],
      "/blog": ["/", "/feed"],
      "/dashboard": ["/my-blogs", "/dashboard/profile"],
      "/my-blogs": ["/create-blog", "/dashboard"],
    };

    const relatedRoutes = routeMap[currentPath] || [];

    relatedRoutes.forEach((route) => {
      // Use link prefetch for simplicity
      PrefetchManager.prefetchWithLink(route, "document");
    });
  }
}

/**
 * Image prefetching with intelligent loading
 */
export class ImagePrefetcher {
  static imageCache = new Map();

  /**
   * Prefetch images that are likely to be viewed
   */
  static async prefetchImages(imageUrls, priority = "low") {
    const networkInfo = getNetworkInfo();

    // Limit prefetching on slow connections
    if (networkInfo?.effectiveType === "slow-2g") {
      return;
    }

    const maxImages = networkInfo?.effectiveType === "4g" ? 10 : 5;
    const urlsToPreload = imageUrls.slice(0, maxImages);

    const promises = urlsToPreload.map((url) =>
      this.prefetchImage(url, priority),
    );
    return Promise.allSettled(promises);
  }

  /**
   * Prefetch a single image
   */
  static async prefetchImage(url, priority = "low") {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to prefetch image: ${url}`));
      };

      // Set loading priority
      if ("loading" in img) {
        img.loading = priority === "high" ? "eager" : "lazy";
      }

      img.src = url;
    });
  }

  /**
   * Preload critical images (above the fold)
   */
  static preloadCriticalImages(imageUrls) {
    imageUrls.forEach((url) => {
      PrefetchManager.preloadCritical(url, "image");
    });
  }
}

/**
 * API endpoint prefetching
 */
export class ApiPrefetcher {
  /**
   * Prefetch API endpoints based on user behavior
   */
  static async prefetchEndpoints(endpoints) {
    const networkInfo = getNetworkInfo();

    // Skip on data saver mode
    if (networkInfo?.saveData) {
      return;
    }

    const promises = endpoints.map((endpoint) =>
      this.prefetchEndpoint(endpoint),
    );
    return Promise.allSettled(promises);
  }

  /**
   * Prefetch a single API endpoint
   */
  static async prefetchEndpoint({ url, method = "GET", headers = {} }) {
    const cacheKey = ApiCache.generateKey(url);

    // Check if already cached
    if (ApiCache.has(cacheKey)) {
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "same-origin",
      });

      if (response.ok) {
        const data = await response.json();
        ApiCache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes
        return data;
      }
    } catch (error) {
      console.warn(`Failed to prefetch API endpoint ${url}:`, error);
    }
  }

  /**
   * Prefetch user-specific data
   */
  static prefetchUserData(userId) {
    const endpoints = [
      { url: `/api/users/${userId}/profile` },
      { url: `/api/users/${userId}/blogs?limit=5` },
      { url: `/api/users/${userId}/stats` },
    ];

    return this.prefetchEndpoints(endpoints);
  }

  /**
   * Prefetch blog-related data
   */
  static prefetchBlogData(blogId) {
    const endpoints = [
      { url: `/api/blogs/${blogId}/comments?limit=10` },
      { url: `/api/blogs/${blogId}/related?limit=5` },
    ];

    return this.prefetchEndpoints(endpoints);
  }
}

/**
 * Intelligent prefetching based on user behavior
 */
export class IntelligentPrefetcher {
  static userBehavior = {
    hoveredLinks: new Map(),
    scrollDepth: 0,
    timeOnPage: 0,
  };

  /**
   * Initialize intelligent prefetching
   */
  static init() {
    this.observeHoverIntent();
    this.observeScrollBehavior();
    this.observePageTime();
  }

  /**
   * Observe hover intent for link prefetching
   */
  static observeHoverIntent() {
    let hoverTimeout;

    document.addEventListener("mouseover", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");

      // Only prefetch internal links
      if (href.startsWith("/") || href.includes(window.location.origin)) {
        hoverTimeout = setTimeout(() => {
          this.userBehavior.hoveredLinks.set(href, Date.now());
          PrefetchManager.prefetchWithLink(href, "document");
        }, 100); // Prefetch after 100ms hover
      }
    });

    document.addEventListener("mouseout", () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    });
  }

  /**
   * Observe scroll behavior for content prefetching
   */
  static observeScrollBehavior() {
    let scrollTimeout;

    window.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollPercentage =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100;
        this.userBehavior.scrollDepth = Math.max(
          this.userBehavior.scrollDepth,
          scrollPercentage,
        );

        // Prefetch next page content when user scrolls 70%
        if (scrollPercentage > 70) {
          this.prefetchNextPageContent();
        }
      }, 100);
    });
  }

  /**
   * Observe time spent on page
   */
  static observePageTime() {
    const startTime = Date.now();

    const updateTimeOnPage = () => {
      this.userBehavior.timeOnPage = Date.now() - startTime;
    };

    // Update every 5 seconds
    const interval = setInterval(updateTimeOnPage, 5000);

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      clearInterval(interval);
      updateTimeOnPage();
    });
  }

  /**
   * Prefetch next page content based on behavior
   */
  static prefetchNextPageContent() {
    const currentPath = window.location.pathname;

    // Example: prefetch next blog posts on home page
    if (currentPath === "/") {
      ApiPrefetcher.prefetchEndpoints([{ url: "/api/blogs?page=2&limit=10" }]);
    }
  }
}

// Auto-initialize on DOM ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      IntelligentPrefetcher.init();
    });
  } else {
    IntelligentPrefetcher.init();
  }
}

export default {
  PrefetchManager,
  RoutePrefetcher,
  ImagePrefetcher,
  ApiPrefetcher,
  IntelligentPrefetcher,
};
