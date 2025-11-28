from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import shutil
from typing import List, Optional
from pydantic import BaseModel
import glob
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

class CompareRequest(BaseModel):
    file1: str
    file2: str

@app.get("/")
def read_root():
    return {"message": "API de comparaison de devis est en ligne"}

@app.get("/versions")
def list_versions():
    """Liste tous les fichiers PDF dans le dossier uploads, triés par date de modification"""
    files = []
    for filename in os.listdir(UPLOAD_DIR):
        if filename.lower().endswith('.pdf'):
            filepath = os.path.join(UPLOAD_DIR, filename)
            stats = os.stat(filepath)
            files.append({
                "filename": filename,
                "path": filepath,
                "size": stats.st_size,
                "created": stats.st_ctime,
                "modified": stats.st_mtime
            })
    
    # Tri par date de modification (le plus récent en dernier)
    files.sort(key=lambda x: x['modified'])
    return files

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "message": "Fichier uploadé avec succès"}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/reset")
def reset_files():
    """Supprime tous les fichiers uploadés"""
    try:
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
        return {"message": "Tous les fichiers ont été supprimés"}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/compare-versions")
async def compare_versions(request: CompareRequest):
    try:
        file1_path = os.path.join(UPLOAD_DIR, request.file1)
        file2_path = os.path.join(UPLOAD_DIR, request.file2)
        
        if not os.path.exists(file1_path) or not os.path.exists(file2_path):
            raise HTTPException(status_code=404, detail="Un ou plusieurs fichiers introuvables")

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
            "filename1": request.file1,
            "filename2": request.file2
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Garder l'ancien endpoint pour compatibilité temporaire si besoin, ou le supprimer
@app.post("/compare")
async def compare_files(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    # Redirige vers la logique de sauvegarde + comparaison
    await upload_file(file1)
    await upload_file(file2)
    return await compare_versions(CompareRequest(file1=file1.filename, file2=file2.filename))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
