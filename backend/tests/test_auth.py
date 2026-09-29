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
