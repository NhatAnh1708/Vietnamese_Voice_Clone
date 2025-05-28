import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse

from routes.api import router as health_routers
from routes.text2speech import router as voice_routers
from routes.auth import router as auth_routers

app = FastAPI(
    title="Synsere TTS API",
    description="Text-to-Speech API with authentication",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root():
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Synsere TTS API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.6;
                }
                h1 {
                    color: #333;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .card {
                    background: #f9f9f9;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 15px 0;
                    border-left: 5px solid #4CAF50;
                }
                code {
                    background: #eee;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
                .endpoint {
                    font-weight: bold;
                    color: #2196F3;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Synsere TTS API</h1>
            <p>This API provides text-to-speech conversion with authentication.</p>
            
            <div class="card">
                <h2>Authentication</h2>
                <p>To use this API, you need to authenticate first:</p>
                <ol>
                    <li>Register at <span class="endpoint">/api/auth/register</span> or use the <a href="/login">login page</a></li>
                    <li>Get a JWT token from <span class="endpoint">/api/auth/login</span></li>
                    <li>Include the token in your requests using the Authorization header: <code>Authorization: Bearer your_token</code></li>
                </ol>
            </div>
            
            <div class="card">
                <h2>Main Endpoints</h2>
                <ul>
                    <li><span class="endpoint">/api/text-to-speech</span> - Convert text to speech</li>
                    <li><span class="endpoint">/api/auth/register</span> - Register a new user</li>
                    <li><span class="endpoint">/api/auth/login</span> - Login and get access token</li>
                </ul>
                <p>For API documentation, visit <a href="/docs">/docs</a></p>
            </div>
        </body>
    </html>
    """
    return html_content

@app.get("/login")
async def login_redirect():
    return RedirectResponse(url="/api/auth/login")

app.include_router(auth_routers)
app.include_router(health_routers)
app.include_router(voice_routers)
