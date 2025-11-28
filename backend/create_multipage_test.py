import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from services import extract_text_from_pdf, compare_texts, compare_texts_data

def create_multi_page_pdf(filename, pages_content):
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica", 12)
    
    for page_lines in pages_content:
        y = height - 50
        for line in page_lines:
            c.drawString(50, y, line)
            y -= 20
            if y < 50: # Nouvelle page si on arrive en bas
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 12)
        c.showPage() # Fin de page explicite
        
    c.save()
    print(f"Created {filename}")

def main():
    # Contenu Page 1 (similaire)
    page1_v1 = [
        "ENTREPRISE TEST MULTI-PAGE",
        "Page 1/3",
        "",
        "Introduction:",
        "Ce document est un devis multi-pages pour tester la comparaison.",
        "Nous proposons des services de qualité.",
        "",
        "Article 1: Développement",
        "- Site vitrine: 1000€",
        "- E-commerce: 3000€",
        "",
        "Suite page suivante..."
    ]
    
    page1_v2 = [
        "ENTREPRISE TEST MULTI-PAGE",
        "Page 1/3",
        "",
        "Introduction:",
        "Ce document est un devis multi-pages pour tester la comparaison.",
        "Nous proposons des services de qualité supérieure.", # Changement ici
        "",
        "Article 1: Développement",
        "- Site vitrine: 1200€", # Changement de prix
        "- E-commerce: 3000€",
        "",
        "Suite page suivante..."
    ]

    # Contenu Page 2 (modifications)
    page2_v1 = [
        "Page 2/3",
        "",
        "Article 2: Hébergement",
        "Serveur dédié: 100€ / mois",
        "Serveur mutualisé: 10€ / mois",
        "",
        "Conditions de paiement:",
        "30% à la commande",
        "Solde à la livraison"
    ]
    
    page2_v2 = [
        "Page 2/3",
        "",
        "Article 2: Hébergement & Cloud", # Titre modifié
        "Serveur dédié: 100€ / mois",
        "Cloud Privé: 150€ / mois", # Ligne ajoutée (remplace mutualisé ?)
        "",
        "Conditions de paiement:",
        "50% à la commande", # Changement %
        "Solde à la recette" # Changement terme
    ]

    # Contenu Page 3 (identique ou presque)
    page3_v1 = [
        "Page 3/3",
        "",
        "Signatures:",
        "",
        "Le client: ________________",
        "",
        "Le prestataire: ____________",
        "",
        "Fait à Paris, le 28/11/2023"
    ]
    
    page3_v2 = [
        "Page 3/3",
        "",
        "Signatures et Tampon:", # Titre modifié
        "",
        "Le client: ________________",
        "",
        "Le prestataire: ____________",
        "",
        "Fait à Paris, le 30/11/2023" # Date modifiée
    ]

    # Création des structures
    content_v1 = [page1_v1, page2_v1, page3_v1]
    content_v2 = [page1_v2, page2_v2, page3_v2]

    # File paths
    file1 = "devis_multi_v1.pdf"
    file2 = "devis_multi_v2.pdf"
    
    # Create PDFs
    create_multi_page_pdf(file1, content_v1)
    create_multi_page_pdf(file2, content_v2)

    print(f"Fichiers multipages créés: {os.path.abspath(file1)} et {os.path.abspath(file2)}")

if __name__ == "__main__":
    main()

