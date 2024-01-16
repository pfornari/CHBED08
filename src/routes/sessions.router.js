import { Router } from "express";
import { userModel } from "../daos/models/user.model.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    console.log("Registrando usuario:");
    console.log(req.body);

    const exist = await userModel.findOne({ email });

    if (exist) {
      
      return res
        .status(400)
        .send({ status: "error", message: "Usuario ya existe!" });
    }

    let user = {
      first_name,
      last_name,
      email,
      password,
    };

    // Asignar el rol "admin" solo si las credenciales coinciden
    if (user.email === "adminCoder@coder.com" && user.password === "Cod3r123") {
      user.role = "admin";
    } else {
      user.role = "user"; // Asignar un rol predeterminado si no es un administrador
    }

    const result = await userModel.create(user);
    res.send({
      status: "success",
      message: "Usuario creado con éxito con ID: " + result.id,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, password });

  if (!user)
    return res
      .status(401)
      .send({ status: "error", error: "Incorrect credentials" });

  req.session.user = {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
  };

  res.send({
    status: "success",
    payload: req.session.user,
    message: "¡Primer logueo realizado! :)",
  });
});

router.post("/logout", (req, res) => {
  if (req.session.login || req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir la sesión:', err);
        res.status(500).json({ status: "error", message: "Error al cerrar sesión" });
      } else {
        res.status(200).json({ status: "success", message: "Sesión cerrada exitosamente" });
      }
    });
  } else {
    res.status(400).json({ status: "error", message: "No hay sesión activa para cerrar" });
  }
});


export default router;
