from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
from PIL import Image
import os
import sys
import shutil # New import for directory cleanup

# --- CRITICAL SETUP INSTRUCTIONS (Rerun if needed) ---
# 1. CLONE: git clone https://github.com/sunsmarterjie/yolov12.git
# 2. INSTALL: pip install -e ./yolov12
# 3. WEIGHTS: best.pt in the 'weights' folder.
# ---------------------------------------------------------------------

# Add the custom yolov12 folder to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

app = FastAPI(
    title="PPE Detection API",
    description="Custom YOLOv12 inference backend.",
    version="1.0.0"
)

# Configure CORS
origins = ["*", "http://localhost:3000", "http://127.0.0.1:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
MODEL_PATH = "weights/best.pt"
model = None 

@app.on_event("startup")
async def load_model():
    """Loads the custom YOLOv12 model."""
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model weights not found at {MODEL_PATH}.")

    try:
        model = YOLO(MODEL_PATH)
        print(f"INFO: Successfully loaded custom YOLOv12 model from {MODEL_PATH}")
    except Exception as e:
        error_msg = f"Critical Model Loading Failure: {e}"
        print(f"FATAL ERROR: {error_msg}")
        raise RuntimeError(f"YOLOv12 Custom Model Load Error: {error_msg}. Follow setup steps.") from e

# --- API Endpoint ---

@app.post("/api/check_ppe_image/")
async def check_ppe_image(file: UploadFile = File(...)):
    """Runs YOLOv12 inference and returns the resulting image."""
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG).")
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not initialized. Server startup failed.")

    content = await file.read()
    image_stream = io.BytesIO(content)
    
    # Define a temporary folder name for YOLO to save its output
    # This ensures we know exactly where the results are.
    temp_run_dir = os.path.join("temp_runs", os.urandom(8).hex())
    
    try:
        input_image = Image.open(image_stream).convert("RGB")
        
        # 3. Perform Inference
        # 'project=temp_runs' defines the parent directory (relative to current working dir)
        # 'name=...' defines the run name (which results in temp_runs/run_name)
        results = model.predict(
            source=input_image, 
            save=True, 
            project="temp_runs", 
            name=os.urandom(8).hex(), # Use random name to prevent conflicts
            exist_ok=True, 
            verbose=False
        )
        
        # 4. Retrieve Processed Image (FIXED LOGIC)
        if results and len(results) > 0:
            result = results[0]
            
            # result.save_dir is the full path to the directory where the output was saved.
            # result.path is the filename (e.g., 'image0.jpg').
            # We must join them to get the absolute path.
            result_path = os.path.join(result.save_dir, result.path)
            
            # Check if the generated file actually exists before opening
            if not os.path.exists(result_path):
                raise FileNotFoundError(f"YOLO output file not found at: {result_path}")

            processed_image = Image.open(result_path)
            
            # 5. Prepare Output
            output_stream = io.BytesIO()
            processed_image.save(output_stream, format="JPEG", quality=90)
            output_stream.seek(0)
            
            # 6. Return StreamingResponse
            return StreamingResponse(
                output_stream,
                media_type="image/jpeg",
                headers={"Content-Disposition": f"attachment; filename=result_{file.filename}.jpeg"}
            )
        else:
            raise HTTPException(status_code=500, detail="YOLO inference ran, but produced no results.")

    except Exception as e:
        print(f"Critical Processing Error: {e}")
        # General catch-all for inference failures
        raise HTTPException(
            status_code=500, 
            detail=f"Internal Server Error during AI processing: {e}"
        )
    finally:
        # 7. CLEANUP: Remove the temporary directory created by YOLO
        if os.path.exists(temp_run_dir):
            try:
                shutil.rmtree(temp_run_dir)
                print(f"INFO: Cleaned up temporary directory: {temp_run_dir}")
            except OSError as e:
                print(f"WARNING: Could not remove temporary directory {temp_run_dir}: {e}")


