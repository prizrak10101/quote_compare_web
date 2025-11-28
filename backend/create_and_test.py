import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from services import extract_text_from_pdf, compare_texts, compare_texts_data

def create_pdf(filename, content):
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica", 12)
    
    y = height - 50
    for line in content:
        c.drawString(50, y, line)
        y -= 20
        
    c.save()
    print(f"Created {filename}")

def main():
    # Define content for two quotes
    quote1_content = [
        "ENTREPRISE TEST SARL",
        "123 Rue de l'Innovation",
        "75001 Paris",
        "",
        "DEVIS #2023-001",
        "Date: 28/11/2023",
        "",
        "Client: Mathieu",
        "",
        "Description                         Quantité    Prix Unitaire    Total",
        "---------------------------------------------------------------------",
        "Développement Site Web              1           5000.00 €        5000.00 €",
        "Hébergement (1 an)                  1           120.00 €         120.00 €",
        "",
        "Total HT: 5120.00 €",
        "TVA (20%): 1024.00 €",
        "Total TTC: 6144.00 €",
        "",
        "Validité: 30 jours"
    ]

    quote2_content = [
        "ENTREPRISE TEST SARL",
        "123 Rue de l'Innovation",
        "75001 Paris",
        "",
        "DEVIS #2023-001 (Révisé)",
        "Date: 29/11/2023",
        "",
        "Client: Mathieu",
        "",
        "Description                         Quantité    Prix Unitaire    Total",
        "---------------------------------------------------------------------",
        "Développement Site Web Avancé       1           5500.00 €        5500.00 €",
        "Hébergement (1 an)                  1           120.00 €         120.00 €",
        "Maintenance (1 an)                  1           500.00 €         500.00 €",
        "",
        "Total HT: 6120.00 €",
        "TVA (20%): 1224.00 €",
        "Total TTC: 7344.00 €",
        "",
        "Validité: 15 jours"
    ]

    # File paths
    file1 = "devis_v1.pdf"
    file2 = "devis_v2.pdf"
    
    # Create PDFs
    create_pdf(file1, quote1_content)
    create_pdf(file2, quote2_content)

    print("-" * 50)
    print("Test de comparaison...")

    # Extract text
    text1 = extract_text_from_pdf(file1)
    text2 = extract_text_from_pdf(file2)
    
    print("Texte extrait du fichier 1 (premières lignes):")
    print(text1[:100] + "...")
    print("-" * 20)
    
    # Compare
    diffs = compare_texts_data(text1, text2)
    
    print(f"Nombre de segments de différence trouvés: {len(diffs)}")
    print("Aperçu des différences (Raw Data):")
    for op, data in diffs:
        if op == 0: # Equal
            if len(data) > 20:
                print(f"  (=) {data[:20]}...")
            else:
                print(f"  (=) {data}")
        elif op == 1: # Insert
            print(f"  (+) {data}")
        elif op == -1: # Delete
            print(f"  (-) {data}")

    print("-" * 50)
    print("Test terminé avec succès.")
    print(f"Fichiers créés: {os.path.abspath(file1)} et {os.path.abspath(file2)}")

if __name__ == "__main__":
    main()

