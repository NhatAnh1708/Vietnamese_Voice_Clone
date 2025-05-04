import os
import subprocess
from huggingface_hub import snapshot_download

def run(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    print("⏳ Đang cài đặt môi trường...")

    run("date")

    # Clone TTS repo and install
    run("rm -rf TTS/")
    run("git clone --branch add-vietnamese-xtts -q https://github.com/thinhlpg/TTS.git")
    run("pip install --use-deprecated=legacy-resolver -e TTS")

    # Install dependencies
    deps = [
        "deepspeed",
        "vinorm==2.0.7",
        "cutlet",
        "unidic==1.1.0",
        "underthesea",
        "gradio==4.35",
        "deepfilternet==0.5.6"
    ]
    for pkg in deps:
        run(f"pip install -q {pkg}")

    # Download Unidic
    run("python -m unidic download")

    # Download model
    print("📦 Tải mô hình từ Hugging Face...")
    snapshot_download(repo_id="thinhlpg/viXTTS", repo_type="model", local_dir="model")

    print("✅ Cài đặt hoàn tất!")

if __name__ == "__main__":
    main()
