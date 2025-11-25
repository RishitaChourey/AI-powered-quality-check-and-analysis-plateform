import time
from model import run_inference

def test_speed_benchmark():
    start = time.time()
    for _ in range(10):
        run_inference("tests/data/sample_frame.jpg")
    avg = (time.time() - start) / 10
    print("Avg inference time:", avg)

    assert avg < 0.12  # adjust per GPU/CPU
