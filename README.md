1.Clone the Repository: Open a terminal and run this exact command:

Bash

git clone --recurse-submodules https://github.com/RishitaChourey/AI-powered-quality-check-and-analysis-plateform.git
cd AI-powered-quality-check-and-analysis-plateform

Phase 2: Python Environment and Dependencies
This phase installs all standard libraries and, critically, links the custom YOLOv12 submodule to the Python path.

Create and Activate Virtual Environment:

Bash

python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
Navigate to the Backend Folder:

Bash

cd backend
Install Standard Dependencies: (Assuming you added the requirements.txt file below to your repo.)

Bash

pip install -r requirements.txt
Install the Custom YOLOv12 Code (Crucial Step): This tells Python how to resolve the imports for custom layers like AAttn inside the yolov12 submodule folder.

Bash

pip install -e ./yolov12
Phase 3: Run the Application
Start the Backend API (Terminal 1):

Ensure your model weights (weights/best.pt) are present.

Start the FastAPI server:

Bash

uvicorn app:app --reload
(Wait for the server to confirm it's running on http://127.0.0.1:8000.)



Run the Frontend (React app)
cd frontend
npm install          # installs all React dependencies
npm start            # runs
React app on localhost:3000
