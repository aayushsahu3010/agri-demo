"""
Treatment Recommendations Database
─────────────────────────────────────────────────────────────────
Maps disease labels → treatment advice.
In production this lives in PostgreSQL. This file serves as
seed data and in-memory fallback during development.
"""

TREATMENT_DB: dict = {
    "Tomato___Late_blight": {
        "disease_name_en": "Tomato Late Blight",
        "disease_name_hi": "टमाटर का लेट ब्लाइट",
        "description_en": "Caused by Phytophthora infestans. Appears as dark water-soaked lesions on leaves.",
        "description_hi": "फाइटोफ्थोरा इन्फेस्टन्स के कारण होता है। पत्तियों पर गहरे धब्बे दिखते हैं।",
        "chemical_treatments": [
            {
                "name": "Mancozeb 75% WP",
                "dosage": "2-2.5 g/L water",
                "frequency": "Every 7-10 days",
                "brand_example": "Dithane M-45",
            },
            {
                "name": "Metalaxyl + Mancozeb",
                "dosage": "2 g/L water",
                "frequency": "Every 10-14 days",
                "brand_example": "Ridomil Gold",
            },
        ],
        "organic_treatments": [
            {
                "name": "Copper-based fungicide",
                "dosage": "3 g/L water",
                "frequency": "Every 7 days",
            },
            {
                "name": "Neem oil spray",
                "dosage": "5 ml/L water",
                "frequency": "Every 5-7 days",
            },
        ],
        "prevention": [
            "Ensure proper spacing between plants for air circulation",
            "Avoid overhead irrigation; use drip irrigation",
            "Remove and destroy infected plant material",
            "Apply fungicide preventively during humid weather",
        ],
        "urgency": "High — Act within 24-48 hours",
    },
    "Tomato___Early_blight": {
        "disease_name_en": "Tomato Early Blight",
        "disease_name_hi": "टमाटर का अर्ली ब्लाइट",
        "description_en": "Caused by Alternaria solani. Shows target-like concentric rings on older leaves.",
        "description_hi": "अल्टरनेरिया सोलानी के कारण होता है। पुरानी पत्तियों पर गोल धब्बे बनते हैं।",
        "chemical_treatments": [
            {
                "name": "Chlorothalonil 75% WP",
                "dosage": "2 g/L water",
                "frequency": "Every 7-10 days",
                "brand_example": "Kavach",
            },
        ],
        "organic_treatments": [
            {
                "name": "Baking soda spray",
                "dosage": "5 g/L water + few drops of soap",
                "frequency": "Every 5 days",
            },
        ],
        "prevention": [
            "Rotate crops annually",
            "Remove lower infected leaves",
            "Avoid working in wet fields",
        ],
        "urgency": "Medium — Act within 3-5 days",
    },
    "Potato___Late_blight": {
        "disease_name_en": "Potato Late Blight",
        "disease_name_hi": "आलू का लेट ब्लाइट",
        "description_en": "Same pathogen as tomato late blight. Critical disease in India during monsoon.",
        "description_hi": "टमाटर के लेट ब्लाइट जैसा रोगकारक। भारत में मानसून में गंभीर बीमारी।",
        "chemical_treatments": [
            {
                "name": "Cymoxanil + Mancozeb",
                "dosage": "2.5 g/L water",
                "frequency": "Every 7 days",
                "brand_example": "Curzate M8",
            },
        ],
        "organic_treatments": [
            {"name": "Copper oxychloride", "dosage": "3 g/L water", "frequency": "Every 7 days"},
        ],
        "prevention": [
            "Use certified disease-free seed tubers",
            "Hill up soil around plants",
            "Ensure good drainage",
        ],
        "urgency": "High — Act within 24-48 hours",
    },
    "healthy": {
        "disease_name_en": "Healthy Plant",
        "disease_name_hi": "स्वस्थ पौधा",
        "description_en": "Your crop appears healthy! No disease detected.",
        "description_hi": "आपकी फसल स्वस्थ दिखती है! कोई बीमारी नहीं मिली।",
        "chemical_treatments": [],
        "organic_treatments": [],
        "prevention": [
            "Continue regular monitoring",
            "Maintain proper irrigation schedule",
            "Apply balanced fertilizer as per soil test",
        ],
        "urgency": "None",
    },
}


def get_treatment(disease_label: str) -> dict:
    """
    Get treatment info for a disease label.
    Falls back to generic advice if disease not in DB.
    """
    # Try exact match first
    if disease_label in TREATMENT_DB:
        return TREATMENT_DB[disease_label]

    # Try partial match (for "healthy" variants)
    if "healthy" in disease_label.lower():
        return TREATMENT_DB["healthy"]

    # Generic fallback
    return {
        "disease_name_en": disease_label.replace("___", " — ").replace("_", " "),
        "disease_name_hi": "अज्ञात रोग",
        "description_en": "Disease identified. Please consult an agronomist for detailed advice.",
        "description_hi": "रोग की पहचान हुई। विस्तृत सलाह के लिए कृषि विशेषज्ञ से परामर्श करें।",
        "chemical_treatments": [],
        "organic_treatments": [],
        "prevention": ["Consult your nearest Krishi Vigyan Kendra (KVK)", "Contact CROOPIC agronomist support"],
        "urgency": "Medium — Seek expert advice",
    }
