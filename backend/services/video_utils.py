import moviepy
from moviepy import VideoFileClip
import os

def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path
    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=clip.fps or 20)
    os.remove(input_path)
    return output_path