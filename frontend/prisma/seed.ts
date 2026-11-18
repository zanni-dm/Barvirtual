import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const username = (process.env.ADMIN_USERNAME ?? "admin").trim().toLowerCase();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Faltan ADMIN_NAME, ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env");
  }
  if (password.length < 12 || password === "CAMBIAR_POR_UNA_CLAVE_SEGURA") {
    throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres y no puede ser el valor de ejemplo.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "admin") {
      throw new Error(
        `Ya existe una cuenta ${email} que NO es administradora. Usá otro ADMIN_EMAIL o borrá esa cuenta manualmente.`,
      );
    }
    console.log(`El administrador ${email} ya existe. No se modificó nada.`);
    return;
  }

  const usernameTaken = await prisma.user.findUnique({ where: { username } });
  if (usernameTaken) {
    throw new Error(`El nombre de usuario "${username}" ya está en uso. Cambiá ADMIN_USERNAME.`);
  }

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log(`Administrador ${email} creado correctamente.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());