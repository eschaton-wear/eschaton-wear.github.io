# How to Run Léger AI Locally

The project files are already located on your computer at:
`C:\Users\asus\.gemini\antigravity\scratch\leger-ai`

## To run it:

1.  **Open your terminal** (Command Prompt or PowerShell).
2.  **Navigate to the folder**:
    ```bash
    cd C:\Users\asus\.gemini\antigravity\scratch\leger-ai
    ```
3.  **Start the server**:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**:
    Go to `http://localhost:3000` (or `http://localhost:3001` if 3000 is taken).

## Environment Setup
Make sure you have a `.env.local` file in the root folder with the following:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENROUTER_API_KEY=your_openrouter_key
```
(If you are just testing UI, you can skip the specific keys, but chat features might use mock data).
