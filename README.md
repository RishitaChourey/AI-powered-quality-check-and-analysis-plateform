🚀 Phase 1: Clone the Repository

Open a terminal and run :

```bash
git clone https://github.com/RishitaChourey/AI-powered-quality-check-and-analysis-plateform.git
cd AI-powered-quality-check-and-analysis-plateform
```

⚙️ Phase 2: Python Environment and Dependencies
This phase installs all standard libraries and links the custom YOLOv12 submodule to the Python path.

1️⃣ Create and Activate Virtual Environment
Ensure you have python 3.12.0 installed on your system
```bash
py -3.12 -m venv .venv

**if the user doesn't have the persmissions to create virtual env, run the folowing:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

🪟 Windows
.\venv\Scripts\activate
🐧 macOS / Linux
source venv/bin/activate
```
2️⃣  Install Standard Dependencies
Make sure you have a requirements.txt file in the backend folder.

```bash
pip install -r requirements.txt
```
Place the .env file in backend folder

▶️ Phase 3: Run the Application

Navigate to the Backend Folder
```bash
cd backend
```
🧠 1️⃣ Start the Backend API (Terminal 1)
Ensure your model weights (e.g., weights/best.pt) are present inside the backend directory.

Start the FastAPI server:

```bash
uvicorn app:app --reload
```
✅ The backend should now be running at:

```bash
http://127.0.0.1:8000

```

💻 2️⃣ Run the Frontend (Terminal 2)
Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
npm install
npm start
```
✅ The React app should open automatically at:
```bash
http://localhost:3000
```
