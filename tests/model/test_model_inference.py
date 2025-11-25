from model import run_inference

def test_inference_output():
    result = run_inference("tests/data/sample_frame.jpg")
    assert isinstance(result, list)
    if result:
        r = result[0]
        assert "label" in r
        assert "confidence" in r
        assert 0 <= r["confidence"] <= 1
