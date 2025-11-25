def test_video_process_pipeline(client):
    with open("tests/data/sample_video.mp4", "rb") as f:
        upload = client.post("/upload-video/", files={"file": ("sample.mp4", f, "video/mp4")})

    assert upload.status_code == 200
    video_id = upload.json()["video_id"]

    process = client.get(f"/process/{video_id}")
    assert process.status_code == 200
