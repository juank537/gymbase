import pytest
from httpx import AsyncClient
from sqlalchemy import text


class TestMemberships:
    ADMIN_EMAIL = "mem_admin@test.com"
    ADMIN_PW = "MemAdmin123$"
    MEMBER_DATA = {"full_name": "Test Member", "phone": "+1234567890"}

    async def _setup_admin_and_member(self, client: AsyncClient, db_session):
        await client.post("/api/v1/auth/register", json={
            "email": self.ADMIN_EMAIL, "password": self.ADMIN_PW, "full_name": "Admin",
        })
        await db_session.execute(
            text("UPDATE users SET role = 'admin' WHERE email = :e"),
            {"e": self.ADMIN_EMAIL}
        )
        await db_session.commit()
        resp = await client.post("/api/v1/auth/login", json={
            "email": self.ADMIN_EMAIL, "password": self.ADMIN_PW,
        })
        client.cookies.update(resp.cookies)
        member_resp = await client.post("/api/v1/members/", json=self.MEMBER_DATA)
        member_id = member_resp.json()["id"]
        plan_resp = await client.post("/api/v1/plans/", json={
            "name": "Test Plan", "description": "Test", "price": 19.99, "duration_days": 30,
        })
        plan_id = plan_resp.json()["id"]
        return member_id, plan_id

    async def test_create_membership(self, client: AsyncClient, db_session):
        member_id, plan_id = await self._setup_admin_and_member(client, db_session)
        resp = await client.post("/api/v1/memberships/", json={
            "member_id": member_id, "plan_id": plan_id, "start_date": "2026-05-26",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["member_id"] == member_id
        assert data["plan_id"] == plan_id
        assert data["status"] == "active"

    async def test_list_memberships(self, client: AsyncClient, db_session):
        member_id, plan_id = await self._setup_admin_and_member(client, db_session)
        await client.post("/api/v1/memberships/", json={
            "member_id": member_id, "plan_id": plan_id, "start_date": "2026-05-26",
        })
        resp = await client.get("/api/v1/memberships/")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) >= 1

    async def test_get_membership(self, client: AsyncClient, db_session):
        member_id, plan_id = await self._setup_admin_and_member(client, db_session)
        create_resp = await client.post("/api/v1/memberships/", json={
            "member_id": member_id, "plan_id": plan_id, "start_date": "2026-05-26",
        })
        membership_id = create_resp.json()["id"]
        resp = await client.get(f"/api/v1/memberships/?limit=100")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)
        assert "items" in data

    async def test_renew_membership(self, client: AsyncClient, db_session):
        member_id, plan_id = await self._setup_admin_and_member(client, db_session)
        create_resp = await client.post("/api/v1/memberships/", json={
            "member_id": member_id, "plan_id": plan_id, "start_date": "2026-05-26",
        })
        membership_id = create_resp.json()["id"]
        resp = await client.patch(f"/api/v1/memberships/{membership_id}/cancel")
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    async def test_cancel_membership(self, client: AsyncClient, db_session):
        member_id, plan_id = await self._setup_admin_and_member(client, db_session)
        create_resp = await client.post("/api/v1/memberships/", json={
            "member_id": member_id, "plan_id": plan_id, "start_date": "2026-05-26",
        })
        membership_id = create_resp.json()["id"]
        resp = await client.patch(f"/api/v1/memberships/{membership_id}/cancel")
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    async def test_create_membership_unauthorized(self, client: AsyncClient):
        resp = await client.post("/api/v1/memberships/", json={
            "member_id": 1, "plan_id": 1, "start_date": "2026-05-26",
        })
        assert resp.status_code == 401