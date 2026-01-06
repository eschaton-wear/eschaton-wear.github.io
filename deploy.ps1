Write-Host "🚀 Starting Léger AI Deployment Assistant..." -ForegroundColor Green

# 1. Build Verification
Write-Host "`n📦 Verifying Production Build..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit
}

Write-Host "✅ Build Success!" -ForegroundColor Green

# 2. Git Setup Instruction
Write-Host "`n🔗 Git Repository Setup"
Write-Host "I cannot log in to your GitHub, but I can open it for you."
Write-Host "1. Create a repository named 'leger-ai'"
Read-Host -Prompt "Press Enter to open GitHub..."
Start-Process "https://github.com/new"

Write-Host "`n📋 Run these commands in your terminal after creating the repo:" -ForegroundColor Yellow
Write-Host "git init"
Write-Host "git add ."
Write-Host "git commit -m 'Initial commit'"
Write-Host "git branch -M main"
Write-Host "git remote add origin https://github.com/<YOUR_USERNAME>/leger-ai.git"
Write-Host "git push -u origin main"

# 3. Vercel Handoff
Write-Host "`n☁️ Deploying to Cloud"
Read-Host -Prompt "Pres Enter once you have pushed your code to open Vercel..."
Start-Process "https://vercel.com/new"

Write-Host "`n✨ Good luck! Your site will be live in minutes." -ForegroundColor Cyan
