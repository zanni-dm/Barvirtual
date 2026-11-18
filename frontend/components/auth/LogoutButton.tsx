import { logoutAction } from "@/lib/auth/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-snow transition hover:bg-white/10"
      >
        Cerrar sesión
      </button>
    </form>
  );
}