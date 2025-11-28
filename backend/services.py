import pdfplumber
import diff_match_patch as dmp_module
from PIL import Image, ImageDraw
import pypdfium2 as pdfium
import io
import base64

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def compare_texts(text1: str, text2: str) -> str:
    dmp = dmp_module.diff_match_patch()
    # Comparaison ligne par ligne ou mot par mot est souvent plus lisible pour les humains
    # que caractère par caractère. 
    # Pour l'instant on fait une diff simple, on optimisera pour le rendu visuel.
    
    diffs = dmp.diff_main(text1, text2)
    dmp.diff_cleanupSemantic(diffs)
    
    html_output = dmp.diff_prettyHtml(diffs)
    return html_output

def compare_texts_data(text1: str, text2: str) -> list:
    """
    Retourne les diffs sous forme de données brutes pour que le frontend puisse les manipuler
    (afficher côte à côte, etc.)
    """
    dmp = dmp_module.diff_match_patch()
    diffs = dmp.diff_main(text1, text2)
    dmp.diff_cleanupSemantic(diffs)
    return diffs

def generate_comparison_images(file_path1: str, file_path2: str):
    """
    Génère des images des pages des deux PDF avec les différences surlignées.
    Retourne une liste de dictionnaires contenant les images encodées en base64.
    """
    images_data = []
    
    # Ouvrir les PDFs avec pdfplumber pour l'extraction de texte et coordonnées
    pdf1 = pdfplumber.open(file_path1)
    pdf2 = pdfplumber.open(file_path2)
    
    # Ouvrir les PDFs avec pypdfium2 pour le rendu d'image haute qualité
    pdfium1 = pdfium.PdfDocument(file_path1)
    pdfium2 = pdfium.PdfDocument(file_path2)
    
    # On suppose pour l'instant que les PDFs ont le même nombre de pages ou on itère sur le max
    num_pages = max(len(pdf1.pages), len(pdf2.pages))
    
    for i in range(num_pages):
        page_data = {"page": i + 1}
        
        # Traitement PDF 1
        if i < len(pdf1.pages):
            plumber_page1 = pdf1.pages[i]
            # Rendu image avec pypdfium2
            # scale=2 pour une meilleure qualité (environ 144 dpi)
            pil_image1 = pdfium1[i].render(scale=2).to_pil() 
            
            # Extraction des mots avec coordonnées
            words1 = plumber_page1.extract_words()
            text1_words = [w['text'] for w in words1]
            
            # On stocke l'image originale et les mots pour le diff plus tard
            page_data["words1"] = words1
            page_data["image1"] = pil_image1
        else:
            page_data["words1"] = []
            page_data["image1"] = None

        # Traitement PDF 2
        if i < len(pdf2.pages):
            plumber_page2 = pdf2.pages[i]
            pil_image2 = pdfium2[i].render(scale=2).to_pil()
            words2 = plumber_page2.extract_words()
            page_data["words2"] = words2
            page_data["image2"] = pil_image2
        else:
            page_data["words2"] = []
            page_data["image2"] = None
            
        images_data.append(page_data)

    pdf1.close()
    pdf2.close()
    
    # Calcul du diff global (ou par page - ici on fait page par page pour simplifier l'alignement visuel)
    # Note: Un diff global serait plus précis si le texte coule d'une page à l'autre, 
    # mais pour l'affichage page par page, un diff local est souvent suffisant.
    
    final_output = []
    
    for p_data in images_data:
        img1 = p_data.get("image1")
        img2 = p_data.get("image2")
        words1 = p_data.get("words1", [])
        words2 = p_data.get("words2", [])
        
        # Reconstitution du texte pour le diff
        text1 = " ".join([w['text'] for w in words1])
        text2 = " ".join([w['text'] for w in words2])
        
        dmp = dmp_module.diff_match_patch()
        diffs = dmp.diff_main(text1, text2)
        dmp.diff_cleanupSemantic(diffs)
        
        # On doit mapper les diffs aux mots.
        # C'est complexe car dmp travaille sur les caractères.
        # On va parcourir les diffs et avancer dans les listes de mots.
        
        draw1 = ImageDraw.Draw(img1) if img1 else None
        draw2 = ImageDraw.Draw(img2) if img2 else None
        
        # Mode RGBA pour la transparence
        if img1: img1 = img1.convert("RGBA")
        if img2: img2 = img2.convert("RGBA")
        
        # Overlay layers
        overlay1 = Image.new('RGBA', img1.size, (255,255,255,0)) if img1 else None
        overlay2 = Image.new('RGBA', img2.size, (255,255,255,0)) if img2 else None
        draw_ov1 = ImageDraw.Draw(overlay1) if overlay1 else None
        draw_ov2 = ImageDraw.Draw(overlay2) if overlay2 else None

        # Indices de caractères courants
        idx1 = 0
        idx2 = 0
        
        # Facteur d'échelle entre pdfplumber (points) et pypdfium2 (pixels à scale=2)
        # pypdfium2 scale=2 -> 72 * 2 = 144 DPI.
        # pdfplumber coords sont en points (1/72 inch).
        # Donc scale factor = 2.
        scale = 2.0
        
        # On va essayer de mapper grossièrement les caractères aux mots
        # Une méthode plus robuste serait de faire un diff sur les mots directement.
        # Pour simplifier ici: on va iterer sur les mots et voir s'ils sont dans un range de diff.
        # Mais dmp retourne des caractères.
        
        # Approche alternative : Diff de mots
        # On convertit les mots en caractères uniques (unicode) pour dmp, puis on remap.
        # Ou plus simple : on utilise diff_main sur les textes, et on essaie de retrouver les mots.
        
        # Pour l'instant, implémentation naïve :
        # On parcourt le texte et les mots simultanément.
        
        # Construction d'une map : char_index -> word_index
        char_map1 = []
        current_idx = 0
        for i, w in enumerate(words1):
            # +1 pour l'espace ajouté lors du join, sauf pour le dernier (mais on simplifie)
            l = len(w['text'])
            for _ in range(l):
                char_map1.append(i)
            # Espace
            char_map1.append(-1) 
            
        char_map2 = []
        current_idx = 0
        for i, w in enumerate(words2):
            l = len(w['text'])
            for _ in range(l):
                char_map2.append(i)
            char_map2.append(-1)

        current_char1 = 0
        current_char2 = 0
        
        for op, text in diffs:
            length = len(text)
            
            if op == 0: # EQUAL
                current_char1 += length
                current_char2 += length
            elif op == -1: # DELETE (in text1, not in text2) -> Highlight Red on Img1
                # Trouver les mots touchés
                affected_words = set()
                for k in range(current_char1, current_char1 + length):
                    if k < len(char_map1):
                        w_idx = char_map1[k]
                        if w_idx != -1:
                            affected_words.add(w_idx)
                
                if draw_ov1:
                    for w_idx in affected_words:
                        w = words1[w_idx]
                        # Coords: x0, top, x1, bottom
                        box = (w['x0']*scale, w['top']*scale, w['x1']*scale, w['bottom']*scale)
                        # Rouge transparent
                        draw_ov1.rectangle(box, fill=(255, 0, 0, 100))
                
                current_char1 += length
            elif op == 1: # INSERT (in text2, not in text1) -> Highlight Green on Img2
                affected_words = set()
                for k in range(current_char2, current_char2 + length):
                    if k < len(char_map2):
                        w_idx = char_map2[k]
                        if w_idx != -1:
                            affected_words.add(w_idx)
                            
                if draw_ov2:
                    for w_idx in affected_words:
                        w = words2[w_idx]
                        box = (w['x0']*scale, w['top']*scale, w['x1']*scale, w['bottom']*scale)
                        # Vert transparent
                        draw_ov2.rectangle(box, fill=(0, 255, 0, 100))
                
                current_char2 += length

        # Composite images
        if img1 and overlay1:
            img1 = Image.alpha_composite(img1, overlay1)
        if img2 and overlay2:
            img2 = Image.alpha_composite(img2, overlay2)
            
        # Convert to base64
        img1_b64 = None
        if img1:
            buf = io.BytesIO()
            img1.convert("RGB").save(buf, format="PNG")
            img1_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            
        img2_b64 = None
        if img2:
            buf = io.BytesIO()
            img2.convert("RGB").save(buf, format="PNG")
            img2_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            
        final_output.append({
            "page": p_data["page"],
            "img1": img1_b64,
            "img2": img2_b64
        })
        
    return final_output
