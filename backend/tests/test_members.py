import pytest
from httpx import AsyncClient


class TestMembers:
    ADMIN_EMAIL = "admin@test.com"
    ADMIN_PW = "Admin123$"
    MEMBER_DATA = {"full_name": "John Doe", "phone": "+1234567890"}

    async def _register_admin(self, client: AsyncClient, db_session):
        await client.post("/api/v1/auth/register", json={
            "email": self.ADMIN_EMAIL, "password": self.ADMIN_PW, "full_name": "Admin",
        })
        from sqlalchemy import text
        await db_session.execute(text("UPDATE users SET role = 'admin' WHERE email = :e"), {"e": self.ADMIN_EMAIL})
        await db_session.commit()
        resp = await client.post("/api/v1/auth/login", json={
            "email": self.ADMIN_EMAIL, "password": self.ADMIN_PW,
        })
        client.cookies.update(resp.cookies)

    async def test_create_member(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        resp = await client.post("/api/v1/members/", json=self.MEMBER_DATA)
        assert resp.status_code == 201
        data = resp.json()
        assert data["full_name"] == "John Doe"
        assert data["phone"] == "+1234567890"
        assert data["status"] == "trial"

    async def test_list_members_pagination(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        for i in range(5):
            await client.post("/api/v1/members/", json={"full_name": f"Member {i}", "phone": None})
        resp = await client.get("/api/v1/members/?page=1&limit=3")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 3
        assert data["total"] == 5
        assert data["page"] == 1

    async def test_list_members_unauthorized(self, client: AsyncClient):
        resp = await client.get("/api/v1/members/")
        assert resp.status_code == 401

    async def test_terminate_member(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        create_resp = await client.post("/api/v1/members/", json=self.MEMBER_DATA)
        member_id = create_resp.json()["id"]
        resp = await client.patch(f"/api/v1/members/{member_id}/terminate")
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"
        assert resp.json()["ended_at"] is not None
