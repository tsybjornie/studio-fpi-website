require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express & Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Set up Multer for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini AI (Will need a GEMINI_API_KEY in .env)
// For now we setup the client, but supply a fallback if no key is present during testing.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

// The AI System Prompt defining OpenTender's proprietary auditing logic
const AUDIT_PROMPT = `
You are the OpenTender AI Auditing Engine. Your job is to read an interior design or contractor quotation and extract structural data to allow multiple vendors to bid on it.
Analyze the extracted text from the quotation and return a JSON object with the following structure:
{
  "totalEstimated": "Number representing the total cost",
  "pricingState": "Enum: 'overpriced', 'fair', or 'underpriced'",
  "anomalies": [
    {
      "category": "e.g., Carpentry, Wet Works, Electrical",
      "flag": "High Risk / Clean / Scam Warning",
      "description": "Why this line item is overpriced, a great deal, or suspiciously cheap."
    }
  ],
  "tenderLots": [
    {
      "trade": "e.g., Flooring, Joinery, Construction & Wet Works",
      "extractedScope": "Brief summary of what needs to be built",
      "counterBid": "Simulated competitive integer value for the UI (Optional)"
    }
  ]
}
Return strictly valid JSON.
`;

app.post('/api/analyze-quote', upload.single('quotation'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 2. Process with AI (If API key exists)
        if (process.env.GEMINI_API_KEY) {
            // 1. Extract Text from PDF (Only required if we have an API key to process it)
            console.log(`Processing uploaded file: ${req.file.originalname}`);
            let extractedText = "Scanned Image / PDF Data";
            
            if (req.file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(req.file.buffer);
                extractedText = pdfData.text;
            }

            console.log("Analyzing with Gemini AI...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
            const result = await model.generateContent([AUDIT_PROMPT, extractedText]);
            const responseText = result.response.text();
            
            // Clean up Markdown JSON formatting if Gemini returns it
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiAnalysis = JSON.parse(jsonString);

            return res.json({ success: true, report: aiAnalysis });
        } else {
            // Simulated response while you secure API keys
            console.log("Simulating AI response...");
            
            // Randomly test the three states: Overpriced, Fair, Underpriced
            const rand = Math.random();
            let pricingState = 'overpriced';
            if (rand > 0.66) pricingState = 'fair';
            else if (rand > 0.33) pricingState = 'underpriced';

            setTimeout(() => {
                let simulatedAnomalies = [];
                
                if (pricingState === 'fair') {
                    simulatedAnomalies = [{ category: "Overall Pricing", flag: "Excellent Deal", description: "This quotation is priced fairly and aligns with current wholesale margins. We recommend proceeding if the contractor is verified." }];
                } else if (pricingState === 'underpriced') {
                    simulatedAnomalies = [{ category: "Suspiciously Low Cost", flag: "Scam / Variation Order Risk", description: "This quote is priced 35% below actual local material and labor costs. This is a common tactic to win a deposit, followed by either project abandonment or massive hidden Variation Orders (VOs) during construction." }];
                } else {
                    simulatedAnomalies = [{ category: "Custom Carpentry", flag: "High Markup", description: "Joinery line items are priced 25% above market average. Hardware specifications are vague." }];
                }

                res.json({
                    success: true,
                    report: {
                        totalEstimated: pricingState === 'underpriced' ? 18500 : 65400,
                        pricingState: pricingState,
                        anomalies: simulatedAnomalies,
                        tenderLots: [
                            { trade: "Joinery", extractedScope: "Fabrication of 24ft cabinets.", counterBid: 14000 },
                            { trade: "Wet Works", extractedScope: "Hacking and partition.", counterBid: 8500 }
                        ]
                    }
                });
            }, 3000);
        }

    } catch (error) {
        console.error("Auditing Error:", error);
        res.status(500).json({ error: 'Failed to process quotation.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`OpenTender Backend running on http://localhost:${PORT}`);
});
