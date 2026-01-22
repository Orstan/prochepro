import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "ProchePro";
  const description =
    searchParams.get("description") ||
    "Services à domicile en France";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0ea5e9",
          backgroundImage:
            "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginRight: 20,
            }}
          >
            🏠
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
            }}
          >
            ProchePro
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 40 ? 48 : 56,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 20,
            }}
          >
            {title}
          </h1>

          {description && (
            <p
              style={{
                fontSize: 24,
                color: "rgba(255, 255, 255, 0.9)",
                margin: 0,
                maxWidth: 700,
              }}
            >
              {description.slice(0, 100)}
              {description.length > 100 ? "..." : ""}
            </p>
          )}

          {/* Tags */}
          {(category || city) && (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 30,
              }}
            >
              {category && (
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    padding: "8px 20px",
                    borderRadius: 50,
                    fontSize: 20,
                  }}
                >
                  {category}
                </span>
              )}
              {city && (
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    padding: "8px 20px",
                    borderRadius: 50,
                    fontSize: 20,
                  }}
                >
                  📍 {city}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            prochepro.fr — Services à domicile en France
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
