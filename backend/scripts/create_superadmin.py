"""create_superadmin.py — Crea el superadmin inicial en la base de datos.

Uso:
    python scripts/create_superadmin.py admin@email.com "Admin Name"
    python scripts/create_superadmin.py admin@email.com "Admin Name" MiPasswordSeguro123$

Si se omite la contrasena, se pedira por consola (oculta).
"""
import asyncio, sys, getpass
sys.path.insert(0, __import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__), "..")))

from app.core.database import async_session
from app.core.security import hash_password
from app.core.roles import UserRole
from sqlalchemy import text


async def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    full_name = sys.argv[2].strip()
    password = sys.argv[3] if len(sys.argv) > 3 else getpass.getpass("Contrasena: ")

    if not email or "@" not in email:
        print("Error: Email invalido")
        sys.exit(1)
    if len(password) < 8:
        print("Error: La contrasena debe tener al menos 8 caracteres")
        sys.exit(1)

    hashed = hash_password(password)

    async with async_session() as db:
        result = await db.execute(text("SELECT id FROM users WHERE email = :e"), {"e": email})
        if result.first():
            print(f"[!] El email '{email}' ya esta registrado")
            sys.exit(1)

        result = await db.execute(
            text("""
                INSERT INTO users (email, hashed_password, full_name, role, is_active)
                VALUES (:email, :pw, :name, :role, true)
                RETURNING id, created_at
            """),
            {"email": email, "pw": hashed, "name": full_name, "role": "admin"},
        )
        row = result.first()
        await db.commit()

    print(f"[+] Superadmin creado: {email} | rol: admin | id: {row[0]}")


if __name__ == "__main__":
    asyncio.run(main())
