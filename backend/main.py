from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import shutil
from services import extract_text_from_pdf, compare_texts, compare_texts_data, generate_comparison_images

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise toutes les origines en développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "API de comparaison de devis est en ligne"}

@app.post("/compare")
async def compare_files(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    try:
        # Sauvegarder les fichiers temporairement
        file1_path = os.path.join(UPLOAD_DIR, file1.filename)
        file2_path = os.path.join(UPLOAD_DIR, file2.filename)
        
        with open(file1_path, "wb") as buffer:
            shutil.copyfileobj(file1.file, buffer)
            
        with open(file2_path, "wb") as buffer:
            shutil.copyfileobj(file2.file, buffer)
            
        # Extraction du texte
        text1 = extract_text_from_pdf(file1_path)
        text2 = extract_text_from_pdf(file2_path)
        
        # Comparaison texte
        html_diff = compare_texts(text1, text2)
        raw_diff = compare_texts_data(text1, text2)
        
        # Génération images visuelles
        visual_diff = generate_comparison_images(file1_path, file2_path)
        
        return JSONResponse(content={
            "html_diff": html_diff,
            "raw_diff": raw_diff,
            "visual_diff": visual_diff,
            "filename1": file1.filename,
            "filename2": file2.filename
        })
        
    except Exception as e:
        # Print stack trace for debug
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
