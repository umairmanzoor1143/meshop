import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Live product/category images are served as full Infomaniak S3 URLs, e.g.
    // https://s3.pub2.infomaniak.cloud/object/v1/AUTH_.../me-onra-dev/associations/...
    // (Next 16 removed `images.domains` — `remotePatterns` is required.)
    remotePatterns: [
      { protocol: "https", hostname: "s3.pub2.infomaniak.cloud" },
      { protocol: "https", hostname: "*.infomaniak.cloud" },
    ],
  },
};

export default nextConfig;
