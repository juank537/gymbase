import pytest
from httpx import AsyncClient
from sqlalchemy import text


class TestPlans:
    ADMIN_EMAIL = "plans_admin@test.com"
    ADMIN_PW = "Plans123$"
    PLAN_DATA = {
        "name": "Basic Plan",
        "description": "Basic gym access",
        "price": 29.99,
        "duration_days": 30,
    }

    async def _register_admin(self, client: AsyncClient, db_session):
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

    async def test_create_plan(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        resp = await client.post("/api/v1/plans/", json=self.PLAN_DATA)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Basic Plan"
        assert data["price"] == 29.99
        assert data["duration_days"] == 30
        assert "id" in data

    async def test_list_plans(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        await client.post("/api/v1/plans/", json=self.PLAN_DATA)
        resp = await client.get("/api/v1/plans/")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_get_plan(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        create_resp = await client.post("/api/v1/plans/", json=self.PLAN_DATA)
        plan_id = create_resp.json()["id"]
        resp = await client.get(f"/api/v1/plans/{plan_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == plan_id

    async def test_update_plan(self, client: AsyncClient, db_session):
        await self._register_admin(client, db_session)
        create_resp = await client.post("/api/v1/plans/", json=self.PLAN_DATA)
        plan_id = create_resp.json()["id"]
        resp = await client.patch(f"/api/v1/plans/{plan_id}", json={"price": 39.99})
        assert resp.status_code == 200
        assert resp.json()["price"] == 39.99

    async def test_list_plans_public(self, client: AsyncClient, db_session):
        await client.post("/api/v1/auth/register", json={
            "email": "public@test.com", "password": "Public123$", "full_name": "User",
        })
        await db_session.execute(
            text("UPDATE users SET role = 'admin' WHERE email = :e"),
            {"e": "public@test.com"}
        )
        await db_session.commit()
        resp = await client.post("/api/v1/auth/login", json={
            "email": "public@test.com", "password": "Public123$",
        })
        client.cookies.update(resp.cookies)
        await client.post("/api/v1/plans/", json=self.PLAN_DATA)
        client.cookies.clear()
        resp = await client.get("/api/v1/plans/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)