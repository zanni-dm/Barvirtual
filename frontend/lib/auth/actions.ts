"use server";

import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyCredentials } from "@/lib/auth/credentials";
import { TOKEN_ERROR_MESSAGES, createUserToken, findUserToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth/email";
import {
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import type { FieldErrors, FormState } from "@/lib/auth/form-state";

const MIN_15 = 15 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const TOO_MANY = "Demasiados intentos. Esperá unos minutos antes de volver a intentarlo.";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

/* ---------------------------------- LOGIN ---------------------------------- */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { email: str(formData, "email"), password: str(formData, "password") };
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  const { email, password } = parsed.data;

  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`login:ip:${ip}`, 20, MIN_15),
    rateLimit(`login:email:${email}`, 5, MIN_15),
  ]);
  if (!byIp.allowed || !byEmail.allowed) return { message: TOO_MANY, values };

  const result = await verifyCredentials(email, password);

  if (result.status === "invalid") {
    return { message: "Email o contraseña incorrectos.", values };
  }
  if (result.status === "unverified") {
    return {
      message: "Todavía no verificaste tu correo. Revisá tu bandeja de entrada o pedí un nuevo enlace.",
      showResend: true,
      values,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: result.user.role === "admin" ? "/admin" : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "No pudimos iniciar sesión. Intentá nuevamente.", values };
    }
    throw error; // necesario: el redirect de Next.js también es una excepción
  }
  return {};
}

/* -------------------------------- REGISTRO --------------------------------- */

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    username: str(formData, "username"),
    email: str(formData, "email"),
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirmPassword"),
  };
  const values = { username: raw.username, email: raw.email };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  const { username, email, password } = parsed.data;

  const ip = await getClientIp();
  const limit = await rateLimit(`register:ip:${ip}`, 5, HOUR);
  if (!limit.allowed) return { message: TOO_MANY, values };

  const emailError = ["Este email ya está registrado"];
  const usernameError = ["Este nombre de usuario ya está en uso"];

  const [emailUser, usernameUser] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);
  if (emailUser || usernameUser) {
    const fieldErrors: FieldErrors = {};
    if (emailUser) fieldErrors.email = emailError;
    if (usernameUser) fieldErrors.username = usernameError;
    return { fieldErrors, values };
  }

  let user: { id: string; email: string; username: string };
  try {
    // El rol NO se envía: Prisma aplica el valor por defecto "user".
    user = await prisma.user.create({
      data: { username, email, name: username, password: await bcrypt.hash(password, 12) },
      select: { id: true, email: true, username: true },
    });
  } catch (error) {
    // Dos registros simultáneos: la restricción UNIQUE de PostgreSQL nos protege.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      const fieldErrors: FieldErrors = target.includes("username")
        ? { username: usernameError }
        : { email: emailError };
      return { fieldErrors, values };
    }
    throw error;
  }

  try {
    const token = await createUserToken(user.id, "EMAIL_VERIFICATION");
    await sendVerificationEmail({ to: user.email, username: user.username, token });
  } catch (error) {
    console.error("[registro] No se pudo enviar el correo de verificación", error);
    return {
      ok: true,
      message:
        "Tu cuenta fue creada, pero no pudimos enviar el correo de verificación. Usá el botón de abajo para reenviarlo.",
      values: { email },
    };
  }

  return {
    ok: true,
    message:
      "¡Tu cuenta fue creada! Te enviamos un enlace de verificación a tu correo electrónico. Verificá tu dirección para poder iniciar sesión.",
    values: { email },
  };
}

/* ------------------------- REENVIAR VERIFICACIÓN --------------------------- */

export async function resendVerificationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailOnlySchema.safeParse({ email: str(formData, "email") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { email } = parsed.data;

  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`resend:ip:${ip}`, 5, HOUR),
    rateLimit(`resend:email:${email}`, 3, HOUR),
  ]);
  if (!byIp.allowed || !byEmail.allowed) {
    return { message: "Ya pediste varios correos. Esperá un rato antes de solicitar otro." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    try {
      const token = await createUserToken(user.id, "EMAIL_VERIFICATION");
      await sendVerificationEmail({ to: user.email, username: user.username, token });
    } catch (error) {
      console.error("[reenvío] No se pudo enviar el correo", error);
    }
  }

  // Misma respuesta exista o no la cuenta: evita enumeración.
  return {
    ok: true,
    message:
      "Si existe una cuenta pendiente de verificación con ese email, te enviamos un nuevo enlace. Revisá también la carpeta de spam.",
  };
}

/* ---------------------------- RECUPERAR CONTRASEÑA ------------------------- */

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { email: str(formData, "email") };
  const parsed = emailOnlySchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values: raw };
  const { email } = parsed.data;

  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`forgot:ip:${ip}`, 5, HOUR),
    rateLimit(`forgot:email:${email}`, 3, HOUR),
  ]);
  if (!byIp.allowed || !byEmail.allowed) return { message: TOO_MANY, values: raw };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      const token = await createUserToken(user.id, "PASSWORD_RESET");
      await sendPasswordResetEmail({ to: user.email, username: user.username, token });
    } catch (error) {
      console.error("[recuperación] No se pudo enviar el correo", error);
    }
  }

  return {
    ok: true,
    message:
      "Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña. Revisá también la carpeta de spam.",
  };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    token: str(formData, "token"),
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirmPassword"),
  };
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { token, password } = parsed.data;

  const ip = await getClientIp();
  const limit = await rateLimit(`reset:ip:${ip}`, 10, HOUR);
  if (!limit.allowed) return { message: TOO_MANY };

  const check = await findUserToken(token, "PASSWORD_RESET");
  if (check.status !== "valid") return { message: TOKEN_ERROR_MESSAGES[check.status] };

  const hash = await bcrypt.hash(password, 12);
  const done = await prisma.$transaction(async (tx) => {
    const used = await tx.userToken.updateMany({
      where: { id: check.token.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (used.count !== 1) return false;

    // passwordChangedAt invalida todas las sesiones anteriores.
    await tx.user.update({
      where: { id: check.token.userId },
      data: { password: hash, passwordChangedAt: new Date() },
    });
    await tx.userToken.updateMany({
      where: { userId: check.token.userId, type: "PASSWORD_RESET", usedAt: null },
      data: { usedAt: new Date() },
    });
    return true;
  });

  if (!done) return { message: TOKEN_ERROR_MESSAGES.used };

  return { ok: true, message: "Tu contraseña fue actualizada. Ya podés iniciar sesión con la nueva." };
}

/* --------------------------------- LOGOUT ---------------------------------- */

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}