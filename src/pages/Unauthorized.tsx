import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ fontSize: "72px", color: "#dc3545", marginBottom: "0" }}>
        403
      </h1>
      <h2 style={{ marginTop: "10px", color: "#343a40" }}>Yetkisiz Erişim!</h2>
      <p style={{ color: "#6c757d", maxWidth: "400px", marginBottom: "30px" }}>
        Bu sayfayı görmeye yetkin yok.
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate(-1)} // Bir önceki sayfaya döndürür
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
            border: "1px solid #6c757d",
            backgroundColor: "transparent",
          }}
        >
          Geri Git
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
          }}
        >
          Giriş Sayfasına Dön
        </button>
      </div>
    </div>
  );
}
