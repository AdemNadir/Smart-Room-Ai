import pytest

from app import config, database


@pytest.fixture
def fresh_db(tmp_path, monkeypatch):
    # Every test gets its own empty database file, never the real one.
    monkeypatch.setattr(config, "DB_PATH", tmp_path / "test.db")
    database.init_db()
