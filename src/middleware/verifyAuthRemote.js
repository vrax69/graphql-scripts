import axios from "axios";

export const verifyAuthRemote = async (req) => {
  const skipAuth = process.env.SKIP_AUTH === "1";

  if (skipAuth) {
    return {
      user: { id: 1, nombre: "Dev QA User", rol: "QA", email: "qa@dev.local" },
    };
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Token no proporcionado");

  try {
    const { data } = await axios.get(process.env.AUTH_SERVICE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 3000,
      validateStatus: () => true,
    });

    if (data?.user) {
      return { user: data.user };
    } else {
      throw new Error("Token inválido o expirado");
    }
  } catch (err) {
    console.error("❌ Error al validar token remoto:", err.message);
    throw new Error("Error al validar autenticación");
  }
};
