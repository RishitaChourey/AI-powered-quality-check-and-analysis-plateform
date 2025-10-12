# 🧠 AI-Powered Quality Check & Analysis Platform

An end-to-end application combining **React (Frontend)** and **FastAPI + YOLOv12 (Backend)** to perform AI-powered quality inspection and analysis.

---

## 🚀 Phase 1: Clone the Repository

Open a terminal and run this exact command:

```bash
git clone --recurse-submodules https://github.com/RishitaChourey/AI-powered-quality-check-and-analysis-plateform.git
cd AI-powered-quality-check-and-analysis-plateform
🔹 The --recurse-submodules flag ensures the YOLOv12 model folder is also cloned properly.

⚙️ Phase 2: Python Environment and Dependencies
This phase installs all standard libraries and links the custom YOLOv12 submodule to the Python path.

1️⃣ Create and Activate Virtual Environment
bash
Copy code
python -m venv venv
Windows:
bash
Copy code
.\venv\Scripts\activate
macOS/Linux:
bash
Copy code
source venv/bin/activate
2️⃣ Navigate to the Backend Folder
bash
Copy code
cd backend
3️⃣ Install Standard Dependencies
Make sure a requirements.txt file exists in the backend folder.

bash
Copy code
pip install -r requirements.txt
4️⃣ Install the Custom YOLOv12 Code (Crucial Step)
This step ensures Python can properly resolve imports for custom layers like AAttn and other modules inside the YOLOv12 submodule.

bash
Copy code
pip install -e ./yolov12
▶️ Phase 3: Run the Application
🧩 1️⃣ Start the Backend API (Terminal 1)
Ensure your model weights (e.g. weights/best.pt) are present inside the backend directory.

Start the FastAPI server:

bash
Copy code
uvicorn app:app --reload
✅ Wait until the console confirms the backend is running at:

cpp
Copy code
http://127.0.0.1:8000
💻 2️⃣ Run the Frontend (Terminal 2)
In a new terminal, navigate to the frontend folder:

bash
Copy code
cd frontend
npm install      # installs all React dependencies
npm start        # runs React app on localhost:3000
✅ The frontend will open automatically in your browser:

arduino
Copy code
http://localhost:3000
🧩 Folder Structure
csharp
Copy code
AI-powered-quality-check-and-analysis-plateform/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── yolov12/              # Custom YOLOv12 model (Git submodule)
│   └── weights/              # Model weights (best.pt, etc.)
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitmodules
└── README.md
