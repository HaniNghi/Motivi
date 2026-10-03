from datetime import datetime, timezone, timedelta

import bcrypt
import secrets
import os
import hashlib
import jwt

from app.models import User, RefreshToken
from app.database import db

def utcnow():
    return datetime.now(timezone.utc)

def as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

def hash_password(password: str)-> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def hash_refresh_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def check_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None, "expired"
    except jwt.InvalidSignatureError:
        return None, "invalid_signarture"
    except jwt.PyJWTError:
        return None, "invalid"
    user_id = payload.get("sub")
    if not user_id:
        return None, "invalid"
    return str(user_id), None
        

def create_refresh_token(user: User) -> str:
    raw = secrets.token_urlsafe(48)
    days = int(os.getenv("JWT_REFRESH_DAYS"))
    row = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(raw),
        expires_at=utcnow() + timedelta(days=days)
    )
    db.session.add(row)
    db.session.commit()
    return raw

def find_valid_refresh(raw: str) -> RefreshToken | None:
    row = RefreshToken.query.filter_by(token_hash=hash_refresh_token(raw)).first()
    if row is None:
        return None
    if row.revoked_at is not None:
        return None
    if as_utc(row.expires_at) <= utcnow():
        return None
    return row

def dump_user(user: User)-> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name or "",
    }
def issue_access_token(user: User)-> str:
    minutes = int(os.getenv("JWT_ACCESS_MINUTES"))
    payload = {
        "sub": str(user.id),
        "exp": utcnow() + timedelta(minutes=minutes),
        "iat": utcnow(),
    }
    return jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

def normalize_email(email: str) -> str:
    return email.strip().lower()

def session_payload(user: User, refresh_raw: str) -> str:
    minutes = int(os.getenv("JWT_ACCESS_MINUTES"))
    return {
        "user": dump_user(user),
        "access_token": issue_access_token(user),
        "refresh_token": refresh_raw,
        "token_type": "Bearer",
        "expires_in": minutes * 60,
    }

def register_user(email: str, password: str, display_name: str | None) -> tuple[User, str]:
    email = normalize_email(email)
    if User.query.filter_by(email=email).first():
        raise ValueError("email_taken")
    name = (display_name or "").strip() or email.split("@")[0]
    user = User(
        email=email,
        password_hash=hash_password(password),
        display_name=name
    )
    db.session.add(user)
    db.session.commit()
    refresh = create_refresh_token(user)
    return user, refresh

def login_user(email:str, password: str) -> tuple[User, str]:
    email = normalize_email(email)
    user = User.query.filter_by(email=email).first()
    if user is None or not user.password_hash:
        raise ValueError("invalid_credentials")
    if not check_password(password, user.password_hash):
        raise ValueError("invalid_credentials")
    refresh = create_refresh_token(user)
    return user, refresh

def rotate_refresh(raw: str) -> tuple[User, str]:
    row = find_valid_refresh(raw)
    if row is None:
        raise ValueError("invalid_refresh")
    user = db.session.get(User, row.user_id)
    if user is None:
        raise ValueError("invalid_refresh")
    row.revoked_at = utcnow()
    db.session.commit()
    new_raw = create_refresh_token(user)
    return user, new_raw

def logout_refresh(raw: str) -> None:
    row = find_valid_refresh(raw)
    if row is None:
        raise ValueError("invalid_refresh")
    row.revoked_at = utcnow()
    db.session.commit()