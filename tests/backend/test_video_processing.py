from video_processor import extract_frames

def test_frame_extraction():
    frames = extract_frames("tests/data/sample_video.mp4")
    assert len(frames) > 0
    assert frames[0].endswith(".jpg")
