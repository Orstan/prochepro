import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ProchePro - Services à domicile en France";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          backgroundImage: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
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
              width: 100,
              height: 100,
              borderRadius: 24,
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
              marginRight: 24,
            }}
          >
            🏠
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
            }}
          >
            ProchePro
          </span>
        </div>

        {/* Tagline */}
        <h1
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: "white",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          Services à domicile en France
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
            maxWidth: 700,
            marginTop: 20,
          }}
        >
          Trouvez des prestataires de confiance près de chez vous
        </p>

        {/* Categories */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {["Plomberie", "Électricité", "Ménage", "Jardinage", "Déménagement"].map(
            (cat) => (
              <span
                key={cat}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  padding: "10px 24px",
                  borderRadius: 50,
                  fontSize: 22,
                }}
              >
                {cat}
              </span>
            )
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          prochepro.fr
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
