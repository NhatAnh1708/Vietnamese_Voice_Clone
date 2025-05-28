# 🗣️ Text-to-Speech API (TTS)

Ứng dụng FastAPI này cung cấp RESTful API để chuyển văn bản sang giọng nói (text-to-speech) sử dụng mô hình tùy chỉnh. Tích hợp Swagger UI giúp bạn dễ dàng thử nghiệm các endpoint.

## 🚀 Tính năng

- **Tải mô hình TTS động**: `/api/load-model`
- **Chuyển văn bản thành giọng nói**: `/api/text-to-speech`
- **Kiểm tra file âm thanh đầu ra**: `/api/test-audio-file`

## 📦 Cài đặt & Chạy ứng dụng

1. **Clone source code**:
    ```bash
    git clone https://your-repo-url
    cd your-repo-directory
    ```

2. **Tạo môi trường ảo với uv**:
    ```bash
    uv venv
    source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
    ```

3. **Cài đặt các dependencies**:
    ```bash
    uv sync
    ```

4. **Chạy ứng dụng FastAPI**:
    ```bash
    make dev
    ```
    🧠 *Thay `main:app` nếu file entrypoint của bạn có tên khác.*

## 📘 Tài liệu API

Swagger UI tự động được tạo tại:

```bash
http://127.0.0.1:8000/docs
```

## 🧪 Các Endpoint

### **GET /api/load-model**

- Dùng để tải mô hình TTS. Gọi API này trước khi chuyển văn bản sang giọng nói.
- **Phản hồi**:
  - `200 OK` nếu mô hình đã được tải thành công.

### **POST /api/text-to-speech**

- Chuyển văn bản thành âm thanh `.wav`.
- **Yêu cầu**:
  ```json
  {
     "input_text": "Xin chào, đây là hệ thống tổng hợp giọng nói!",
     "normalize_text": true,
     "verbose": false,
     "reference_audio": "path/to/speaker_reference.wav"
  }
  ```
- **Phản hồi**:
  - Trả về file `.wav` kết quả.

### **POST /api/test-audio-file**

- Trả lại file âm thanh từ đường dẫn đã chỉ định để kiểm tra.
- **Yêu cầu**:
  ```json
  {
     "audio_file": "path/to/generated_audio.wav"
  }
  ```
- **Phản hồi**:
  - Trả về file `.wav`.
