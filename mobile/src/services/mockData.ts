/**
 * mockData.ts
 * ─────────────────────────────────────────────────────────
 * Realistic mock scan responses for DEMO mode.
 * Contains 4 scenarios for Paddy (Rice): 3 diseased, 1 healthy.
 * Used by api.ts when DEMO_MODE = true.
 */
import { ScanResponse } from './api';

const MOCK_SCANS: Omit<ScanResponse, 'scan_id' | 'timestamp' | 'image_url'>[] = [
  {
    disease:          'Rice___Leaf_Blast',
    disease_name_en:  'Rice Leaf Blast',
    disease_name_hi:  'धान का ब्लास्ट रोग (झोंका)',
    confidence:       0.9234,
    severity:         'High',
    is_healthy:       false,
    top_3: [
      { label: 'Rice___Leaf_Blast',          confidence: 0.9234 },
      { label: 'Rice___Brown_Spot',          confidence: 0.0512 },
      { label: 'Rice___Bacterial_blight',    confidence: 0.0121 },
    ],
    message_en: 'Rice Leaf Blast detected with 92.3% confidence. High severity — immediate fungicide application required to prevent yield loss.',
    message_hi: 'धान का ब्लास्ट रोग 92.3% विश्वास से पहचाना गया। उच्च गंभीरता — उपज के नुकसान को रोकने के लिए तुरंत कवकनाशक का प्रयोग आवश्यक है।',
    treatment: {
      disease_name_en:  'Rice Leaf Blast',
      disease_name_hi:  'धान का ब्लास्ट रोग (झोंका)',
      description_en:   'Caused by the fungus Magnaporthe oryzae. It produces diamond-shaped lesions with a gray center and brown border. It can spread rapidly under high humidity and cool nights.',
      description_hi:   'यह मैग्नापोर्थे ओराइजी फंगस के कारण होता है। पत्तियों पर बीच में भूरे और किनारे पर गहरे रंग के हीरे के आकार के धब्बे बन जाते हैं।',
      chemical_treatments: [
        { name: 'Tricyclazole 75% WP', dosage: '0.6 g/L water', frequency: 'Every 10-15 days', brand_example: 'Baan, Beam' },
        { name: 'Isoprothiolane 40% EC', dosage: '1.5 mL/L water', frequency: 'Every 10 days', brand_example: 'Fuji-One' },
      ],
      organic_treatments: [
        { name: 'Pseudomonas fluorescens', dosage: '5 g/L water', frequency: 'Spray at tillering stage' },
        { name: 'Cow dung slurry extract', dosage: '20% concentration', frequency: 'Spray every 14 days' },
      ],
      prevention: [
        'Avoid excessive nitrogen fertilizer application',
        'Burn or remove infected crop residue after harvest',
        'Plant blast-resistant paddy varieties like MTU-1010 or IR-64',
        'Maintain proper plant spacing for air circulation',
      ],
      urgency: 'Treat within 48 hours to prevent the disease from reaching the panicle (neck blast).',
    },
  },
  {
    disease:          'Rice___Bacterial_leaf_blight',
    disease_name_en:  'Bacterial Leaf Blight',
    disease_name_hi:  'जीवाणु जनित पत्ती झुलसा',
    confidence:       0.8911,
    severity:         'High',
    is_healthy:       false,
    top_3: [
      { label: 'Rice___Bacterial_leaf_blight', confidence: 0.8911 },
      { label: 'Rice___Brown_Spot',            confidence: 0.0821 },
      { label: 'Rice___Leaf_Blast',            confidence: 0.0152 },
    ],
    message_en: 'Bacterial Leaf Blight detected with 89.1% confidence. Stop urea application immediately and apply bactericides.',
    message_hi: 'जीवाणु जनित पत्ती झुलसा 89.1% विश्वास से पहचाना गया। यूरिया का प्रयोग तुरंत बंद करें और जीवाणुनाशक का छिड़काव करें।',
    treatment: {
      disease_name_en:  'Bacterial Leaf Blight',
      disease_name_hi:  'जीवाणु जनित पत्ती झुलसा',
      description_en:   'Caused by Xanthomonas oryzae. Yellowish-white stripes appear along leaf margins, later turning gray and drying up. Highly contagious through water.',
      description_hi:   'यह ज़ैंथोमोनास ओराइजी बैक्टीरिया से होता है। पत्तियों के किनारे पीले-सफ़ेद हो जाते हैं और सूखने लगते हैं। पानी से तेज़ी से फैलता है।',
      chemical_treatments: [
        { name: 'Streptocycline + Copper Oxychloride', dosage: '0.15g + 2.5g /L water', frequency: 'Once, repeat after 12 days if needed', brand_example: 'Plantomycin + Blitox' },
      ],
      organic_treatments: [
        { name: 'Cow urine + Neem oil spray', dosage: '100mL + 5mL /L water', frequency: 'Every 7-10 days' },
      ],
      prevention: [
        'Do not drain water from infected field to healthy fields',
        'Temporarily stop applying Urea (Nitrogen) fertilizers',
        'Soak seeds in Streptocycline solution before sowing',
        'Allow field to dry occasionally to reduce humidity',
      ],
      urgency: 'Act immediately; disease spreads very fast through irrigation water.',
    },
  },
  {
    disease:          'Rice___Brown_Spot',
    disease_name_en:  'Rice Brown Spot',
    disease_name_hi:  'धान का भूरा धब्बा रोग',
    confidence:       0.8145,
    severity:         'Medium',
    is_healthy:       false,
    top_3: [
      { label: 'Rice___Brown_Spot',          confidence: 0.8145 },
      { label: 'Rice___Leaf_Blast',          confidence: 0.1123 },
      { label: 'Rice___Bacterial_blight',    confidence: 0.0312 },
    ],
    message_en: 'Rice Brown Spot detected. Often indicates soil nutrient deficiency. Apply fungicide and check fertilizer regime.',
    message_hi: 'धान का भूरा धब्बा रोग पहचाना गया। यह अक्सर मिट्टी में पोषक तत्वों की कमी को दर्शाता है।',
    treatment: {
      disease_name_en:  'Rice Brown Spot',
      disease_name_hi:  'धान का भूरा धब्बा रोग',
      description_en:   'Caused by Bipolaris oryzae. Small, circular to oval dark brown spots on leaves. Often a sign of poor soil fertility (lack of Nitrogen, Potassium, or Silicon).',
      description_hi:   'पत्तियों पर छोटे, गोल गहरे भूरे रंग के धब्बे बन जाते हैं। यह आमतौर पर कमजोर मिट्टी (पोषक तत्वों की कमी) के कारण होता है।',
      chemical_treatments: [
        { name: 'Mancozeb 75% WP', dosage: '2.5 g/L water', frequency: 'Every 10-12 days', brand_example: 'Dithane M-45' },
        { name: 'Propiconazole 25% EC', dosage: '1 mL/L water', frequency: 'Every 15 days', brand_example: 'Tilt' },
      ],
      organic_treatments: [
        { name: 'Panchagavya spray', dosage: '30 mL/L water', frequency: 'Every 15 days' },
      ],
      prevention: [
        'Apply balanced fertilizers, especially ensuring sufficient Potassium (Potash)',
        'Treat seeds with Captan or Thiram before sowing',
        'Maintain proper soil moisture (avoid water stress)',
      ],
      urgency: 'Treat within 5-7 days and improve soil nutrition.',
    },
  },
  {
    disease:          'Rice___healthy',
    disease_name_en:  'Paddy — Healthy',
    disease_name_hi:  'धान — स्वस्थ',
    confidence:       0.9521,
    severity:         'None',
    is_healthy:       true,
    top_3: [
      { label: 'Rice___healthy',             confidence: 0.9521 },
      { label: 'Rice___Brown_Spot',          confidence: 0.0210 },
      { label: 'Rice___Leaf_Blast',          confidence: 0.0101 },
    ],
    message_en: 'Excellent! Your paddy crop appears perfectly healthy. Keep up the good water and nutrient management.',
    message_hi: 'बहुत बढ़िया! आपकी धान की फसल पूरी तरह स्वस्थ दिख रही है। जल और उर्वरक प्रबंधन ऐसे ही बनाए रखें।',
    treatment: {
      disease_name_en: 'Healthy Crop — No Treatment Needed',
      disease_name_hi: 'स्वस्थ फसल — कोई उपचार की जरूरत नहीं',
      description_en:  'No signs of disease detected. Your crop is growing optimally.',
      description_hi:  'बीमारी का कोई लक्षण नहीं है। आपकी फसल बेहतरीन तरीके से बढ़ रही है।',
      chemical_treatments: [],
      organic_treatments: [],
      prevention: [
        'Maintain 2-3 cm standing water during tillering stage',
        'Apply split doses of nitrogen (Urea) at right intervals',
        'Keep the field bunds clean from weeds',
        'Continue regular monitoring every 4–5 days',
      ],
      urgency: 'No immediate action required.',
    },
  },
];

let _mockIndex = 0;

/**
 * Returns the next mock scan result in sequence.
 */
export function getNextMockScan(): Omit<ScanResponse, 'scan_id' | 'timestamp' | 'image_url'> {
  const result = MOCK_SCANS[_mockIndex % MOCK_SCANS.length];
  _mockIndex++;
  return result;
}

export { MOCK_SCANS };
