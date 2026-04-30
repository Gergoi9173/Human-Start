@echo off
echo Starting Resource Planner App...

:: Start the backend
echo Starting backend...
cd backend
:: Check if venv exists, if not create and install requirements
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing backend dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)
start "Backend API" cmd /k "uvicorn main:app --reload --port 8000"

:: Start the frontend
cd ..\frontend
echo Starting frontend...
start "Frontend UI" cmd /k "npm run dev"

echo Both services started!
echo Frontend is available at http://localhost:5173
echo Backend API is available at http://localhost:8000
pause
