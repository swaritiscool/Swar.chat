from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import ollama
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use ["http://localhost:3000", "https://your-ngrok-url"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def models_list():
    return [m.model for m in ollama.list().models]

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    prompt = body["message"]
    chat_hist = body["history"]
    model = body["model"]

    """
    hist = [
    {
        id: ______,
        content: ______,
        role: ________,
        isLoaded: _____,
    },
    ...
    ]
    """

    chat_history = "\n".join(f"{msg['role']} (using {model}): {msg['content']}" for msg in chat_hist)
    

    print(chat_history)

    # Corrected message roles — only valid ones are used
    messages = [
        {"role": "system", "content": f"You are a helpful assistant who gives to the point answers. Provided is chat history. Don't let it influence your answer, just to provide more information. Here is the chat history: {chat_history}"},
        {"role": "user", "content": prompt}
    ]

    def generate():
        stream = ollama.chat(
            model=model,
            messages=messages,
            stream=True
        )
        for chunk in stream:
            yield chunk["message"]["content"]

    return StreamingResponse(generate(), media_type="text/plain")


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
