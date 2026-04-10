import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_create_note():
    response = client.post("/notes/", json={"title": "Test", "content": "Hello"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test"
    assert data["content"] == "Hello"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_note_default_content():
    response = client.post("/notes/", json={"title": "No content"})
    assert response.status_code == 201
    assert response.json()["content"] == ""


def test_list_notes():
    client.post("/notes/", json={"title": "First"})
    client.post("/notes/", json={"title": "Second"})
    response = client.get("/notes/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Second"
    assert data[1]["title"] == "First"


def test_get_note():
    create = client.post("/notes/", json={"title": "Find me"})
    note_id = create.json()["id"]
    response = client.get(f"/notes/{note_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Find me"


def test_get_note_not_found():
    response = client.get("/notes/999")
    assert response.status_code == 404


def test_update_note():
    create = client.post("/notes/", json={"title": "Old", "content": "Old content"})
    note_id = create.json()["id"]
    response = client.put(f"/notes/{note_id}", json={"title": "New"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New"
    assert data["content"] == "Old content"


def test_update_note_not_found():
    response = client.put("/notes/999", json={"title": "Nope"})
    assert response.status_code == 404


def test_delete_note():
    create = client.post("/notes/", json={"title": "Delete me"})
    note_id = create.json()["id"]
    response = client.delete(f"/notes/{note_id}")
    assert response.status_code == 204
    assert client.get(f"/notes/{note_id}").status_code == 404


def test_delete_note_not_found():
    response = client.delete("/notes/999")
    assert response.status_code == 404


def test_full_lifecycle():
    created = client.post("/notes/", json={"title": "Life", "content": "v1"}).json()
    note_id = created["id"]

    fetched = client.get(f"/notes/{note_id}").json()
    assert fetched["title"] == "Life"

    updated = client.put(f"/notes/{note_id}", json={"content": "v2"}).json()
    assert updated["content"] == "v2"
    assert updated["title"] == "Life"

    assert client.delete(f"/notes/{note_id}").status_code == 204
    assert client.get(f"/notes/{note_id}").status_code == 404
