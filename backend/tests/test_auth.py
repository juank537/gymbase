import pytest
from httpx import AsyncClient


class TestAuth:
    REGISTER_DATA = {
        "email": "test@test.com",
        "password": "Test1234$",
        "full_name": "Test User",
    }
    LOGIN_DATA = {"email": "test@test.com", "password": "Test1234$"}

    async def test_register(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "test@test.com"
        assert data["full_name"] == "Test User"
        assert "id" in data

    async def test_register_duplicate(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        resp = await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        assert resp.status_code == 409

    async def test_login_success(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        resp = await client.post("/api/v1/auth/login", json=self.LOGIN_DATA)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "access_token" in resp.cookies
        assert "refresh_token" in resp.cookies

    async def test_login_invalid(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login", json=self.LOGIN_DATA)
        assert resp.status_code == 401

    async def test_me_unauthenticated(self, client: AsyncClient):
        resp = await client.get("/api/v1/users/me")
        assert resp.status_code == 401

    async def test_me_authenticated(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        login_resp = await client.post("/api/v1/auth/login", json=self.LOGIN_DATA)
        token = login_resp.json()["access_token"]
        resp = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == "test@test.com"

    async def test_me_via_cookie(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        login_resp = await client.post("/api/v1/auth/login", json=self.LOGIN_DATA)
        client.cookies.update(login_resp.cookies)
        resp = await client.get("/api/v1/users/me")
        assert resp.status_code == 200
        assert resp.json()["email"] == "test@test.com"

    async def test_refresh_token(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        login_resp = await client.post("/api/v1/auth/login", json=self.LOGIN_DATA)
        client.cookies.update(login_resp.cookies)
        resp = await client.post("/api/v1/auth/refresh")
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@test.com"

    async def test_logout_clears_cookies(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json=self.REGISTER_DATA)
        login_resp = await client.post("/api/v1/auth/login", json=self.LOGIN_DATA)
        client.cookies.update(login_resp.cookies)
        resp = await client.post("/api/v1/auth/logout")
        assert resp.status_code == 200
        me_resp = await client.get("/api/v1/users/me")
        assert me_resp.status_code == 401
