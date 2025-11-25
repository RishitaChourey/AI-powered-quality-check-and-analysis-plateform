import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["message"] == "Server running"

def test_invalid_file_upload():
    res = client.post(
        "/upload-video/",
        files={"file": ("abc.exe", b"malicious", "application/x-msdownload")}
    )
    assert res.status_code == 400
    assert "Invalid file" in res.text
