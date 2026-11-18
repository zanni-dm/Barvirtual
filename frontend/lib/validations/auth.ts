import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Ingresá tu email")
  .email("Ingresá un email válido")
  .max(254, "El email es demasiado largo");

const newPassword = z
  .string()
  .min(1, "Ingresá una contraseña")
  .min(8, "La contraseña debe tener como mínimo 8 caracteres para ser segura")
  .max(72, "La contraseña no puede superar los 72 caracteres");

const confirmPassword = z.string().min(1, "Confirmá tu contraseña");

const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Ingresá un nombre de usuario")
  .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
  .max(20, "El nombre de usuario no puede superar los 20 caracteres")
  .regex(/^[a-z0-9_]+$/, "Usá solo letras, números y guión bajo");

const passwordsMatch = {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
};

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const registerSchema = z
  .object({ username, email, password: newPassword, confirmPassword })
  .refine((d) => d.password === d.confirmPassword, passwordsMatch);

export const emailOnlySchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "El enlace no es válido"),
    password: newPassword,
    confirmPassword,
  })
  .refine((d) => d.password === d.confirmPassword, passwordsMatch);