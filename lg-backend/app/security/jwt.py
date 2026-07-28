from datetime import datetime, timedelta

from jose import JWTError, jwt

SECRET_KEY = "CHANGE_THIS_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


def create_access_token(data: dict):
    payload = data.copy()

    payload["exp"] = (
        datetime.utcnow()
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_access_token(token: str):
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        return None
