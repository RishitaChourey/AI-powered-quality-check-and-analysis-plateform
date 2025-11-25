def test_large_file_rejection(client):
    fake_data = b"0" * (1024 * 1024 * 105)  # 105MB fake file
    res = client.post(
        "/upload-video/",
        files={"file": ("large.mp4", fake_data, "video/mp4")}
    )
    assert res.status_code == 413
