from app.services import auth


def test_register_user_creates_user(monkeypatch):
    captured = {}

    class FakeQuery:
        def filter_by(self, **kwargs):
            return self

        def first(self):
            return None

    class FakeUser:
        query = FakeQuery()

        def __init__(self, email, password_hash, display_name):
            self.email = email
            self.password_hash = password_hash
            self.display_name = display_name

    class FakeSession:
        def add(self, obj):
            captured["added"] = obj

        def commit(self):
            captured["committed"] = True

    monkeypatch.setattr(auth, "User", FakeUser)
    monkeypatch.setattr(auth, "create_refresh_token", lambda user: "fake-refresh-token")
    monkeypatch.setattr(auth, "hash_password", lambda password: f"hashed:{password}")
    monkeypatch.setattr(auth.db, "session", FakeSession(), raising=False)

    user, refresh = auth.register_user("  TestUser@Example.com  ", "123456789", "Hani")

    assert user.email == "testuser@example.com"
    assert user.display_name == "Hani"
    assert user.password_hash == "hashed:123456789"
    assert refresh == "fake-refresh-token"
    assert captured["added"] is user
    assert captured["committed"] is True


def test_login_user_validates_credentials(monkeypatch):
    class FakeQuery:
        def filter_by(self, **kwargs):
            return self

        def first(self):
            return FakeUser("testuser@example.com", "hashed-pass", "Test User")

    class FakeUser:
        query = FakeQuery()

        def __init__(self, email, password_hash, display_name=None):
            self.id = "user-123"
            self.email = email
            self.password_hash = password_hash
            self.display_name = display_name

    monkeypatch.setattr(auth, "User", FakeUser)
    monkeypatch.setattr(auth, "check_password", lambda password, hashed: password == "123456789" and hashed == "hashed-pass")
    monkeypatch.setattr(auth, "create_refresh_token", lambda user: "fake-refresh-token")

    user, refresh = auth.login_user("  TestUser@Example.com  ", "123456789")

    assert user.email == "testuser@example.com"
    assert user.display_name == "Test User"
    assert refresh == "fake-refresh-token"


def test_rotate_refresh_returns_new_token(monkeypatch):
    class FakeRefreshToken:
        def __init__(self):
            self.user_id = "user-123"
            self.revoked_at = None
            self.expires_at = auth.utcnow() + auth.timedelta(days=7)

    class FakeSession:
        def get(self, model, user_id):
            return {"user-123": FakeUser("testuser@example.com", "hashed-pass", "Test User")}[user_id]

        def commit(self):
            return None

    class FakeUser:
        def __init__(self, email, password_hash, display_name=None):
            self.id = "user-123"
            self.email = email
            self.password_hash = password_hash
            self.display_name = display_name

    monkeypatch.setattr(auth, "find_valid_refresh", lambda raw: FakeRefreshToken())
    monkeypatch.setattr(auth.db, "session", FakeSession(), raising=False)
    monkeypatch.setattr(auth, "create_refresh_token", lambda user: "new-refresh-token")

    user, refresh = auth.rotate_refresh("valid-refresh-token")

    assert user.email == "testuser@example.com"
    assert refresh == "new-refresh-token"


def test_logout_refresh_revokes_token(monkeypatch):
    class FakeRefreshToken:
        def __init__(self):
            self.revoked_at = None
            self.expires_at = auth.utcnow() + auth.timedelta(days=7)

    fake_row = FakeRefreshToken()
    monkeypatch.setattr(auth, "find_valid_refresh", lambda raw: fake_row)

    class FakeSession:
        def commit(self):
            fake_row.revoked_at = auth.utcnow()

    monkeypatch.setattr(auth.db, "session", FakeSession(), raising=False)

    auth.logout_refresh("valid-refresh-token")

    assert fake_row.revoked_at is not None
