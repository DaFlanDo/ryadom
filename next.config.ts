import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // прототип лежит рядом как статика-референс, в сборку не тянем
  outputFileTracingExcludes: { "*": ["./prototype/**"] },

  // Базовые заголовки безопасности: страницу нельзя встроить в чужой iframe,
  // браузер не угадывает тип файла, в Referer не уходит полный адрес.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
