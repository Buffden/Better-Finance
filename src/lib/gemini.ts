import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI model
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() || "";
console.log('API Key length:', API_KEY.length);

if (!API_KEY) {
  console.error('No Gemini API key found. Please set VITE_GEMINI_API_KEY in your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

interface ProcessedReceipt {
  amount: number;
  categoryId?: string;
  description?: string;
  paymentMethod?: string;
  date?: string;
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export async function processInvoiceWithGemini(file: File): Promise<ProcessedReceipt[]> {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Validate file
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      throw new Error('File must be an image or PDF');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('File size must be less than 4MB');
    }

    const base64Data = await fileToBase64(file);
    
    if (!base64Data) {
      throw new Error('Failed to convert file to base64');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Determine if this is a receipt or an invoice based on the filename
    const isReceipt = file.name.toLowerCase().includes('receipt');

    // Different prompts for receipt vs invoice
    const prompt = isReceipt ? 
      `Analyze this receipt and extract ONLY:
      1. The final total amount (as a negative number since it's an expense)
      2. The store/merchant name
      3. The type of purchase (categorize as one of: food, shopping, entertainment, utilities, transport, other)

      Format your response as a simple JSON object like this, nothing else:
      {
        "amount": -number,  // Always negative for expenses
        "merchant": "string",
        "category": "string"
      }` :
      `Analyze this credit card statement and extract ALL transactions.
      For each transaction:
      - Amount (make expenses negative, keep income positive)
      - Description
      - Category (classify as one of: food, shopping, entertainment, utilities, transport, other)

      Important: All expenses/purchases should have negative amounts, only income/credits should be positive.

      Format your response as a JSON object like this, nothing else:
      {
        "transactions": [
          {
            "amount": -number,  // Negative for expenses, positive for income
            "description": "string",
            "category": "string"
          }
        ]
      }`;

    try {
      if (!model) {
        throw new Error('Failed to initialize Gemini model');
      }

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('Raw Gemini response:', text); // Debug log

      // Clean up the response text to ensure valid JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      // Try to find a JSON object in the cleaned text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response:', cleanedText);
        throw new Error('Invalid response format - no JSON found');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString); // Debug log

      try {
        const parsedData = JSON.parse(jsonString);
        console.log('Parsed data:', parsedData); // Debug log

        if (isReceipt) {
          // Handle single receipt
          if (!parsedData.amount || !parsedData.merchant) {
            console.error('Invalid receipt data:', parsedData);
            throw new Error('Invalid receipt data format');
          }
          
          const processedReceipt: ProcessedReceipt = {
            amount: parsedData.amount, // Keep original sign
            description: String(parsedData.merchant).trim(),
            categoryId: mapCategoryNameToId(parsedData.merchant),
            paymentMethod: 'card',
            date: new Date().toISOString()
          };

          return [processedReceipt];
        } else {
          // Handle invoice/statement with multiple transactions
          if (!Array.isArray(parsedData.transactions)) {
            console.error('Invalid transactions data:', parsedData);
            throw new Error('Invalid invoice data format - expected transactions array');
          }
          
          return parsedData.transactions.map(tx => ({
            amount: Number(tx.amount) > 0 ? Number(tx.amount) : -Math.abs(Number(tx.amount)), // Ensure expenses are negative
            description: String(tx.description).trim(),
            categoryId: tx.amount > 0 ? 'income' : mapCategoryNameToId(tx.description), // Use 'income' category for positive amounts
            paymentMethod: 'bank',
            date: new Date().toISOString()
          }));
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed JSON string:', jsonString);
        throw new Error('Failed to parse JSON data');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in processInvoiceWithGemini:', error);
    throw error;
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          if (!base64) {
            throw new Error('Invalid base64 data');
          }
          resolve(base64);
        } else {
          throw new Error('Invalid file data');
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = error => reject(new Error('Failed to read file'));
  });
}

// Helper function to map category names to IDs
function mapCategoryNameToId(description: string): string {
  // Convert description to lowercase for better matching
  const desc = description.toLowerCase();
  
  // Define category mappings with common keywords
  const categoryMappings = {
    food: [
      'mcdonald', 'chili', 'panera', 'restaurant', 'dining', 'cafe', 'starbucks', 
      'subway', 'burger', 'pizza', 'taco', 'wendy', 'kfc', 'chipotle'
    ],
    grocery: [
      'grocery', 'market', 'supermarket', 'trader joe', 'whole foods', 'kroger',
      'safeway', 'costco', 'sam\'s club', 'aldi', 'food lion', 'wegmans'
    ],
    entertainment: [
      'playstation', 'netflix', 'spotify', 'gaming', 'movie', 'theatre', 'theater',
      'hulu', 'disney+', 'amazon prime', 'xbox', 'steam'
    ],
    shopping: [
      'apple.com', 'amazon', 'walmart', 'target', 'best buy', 'clothing', 'nike',
      'adidas', 'store', 'mall', 'outlet'
    ],
    utilities: [
      'utility', 'water', 'electricity', 'gas', 'internet', 'phone', 'mobile',
      'cable', 'tv', 'waste', 'sewage'
    ],
    transport: [
      'uber', 'lyft', 'gas', 'fuel', 'parking', 'metro', 'subway', 'bus', 'train',
      'airline', 'flight', 'car service'
    ],
    health: [
      'pharmacy', 'doctor', 'medical', 'hospital', 'dental', 'healthcare',
      'clinic', 'cvs', 'walgreens', 'prescription'
    ],
    rent: [
      'rent', 'lease', 'apartment', 'housing', 'mortgage', 'property', 'hoa',
      'maintenance', 'repair'
    ],
    travel: [
      'hotel', 'motel', 'airbnb', 'booking.com', 'expedia', 'vacation',
      'resort', 'travel', 'airline', 'flight'
    ],
    education: [
      'tuition', 'school', 'college', 'university', 'course', 'training',
      'book', 'textbook', 'education'
    ],
    other: [
      'payment', 'transfer', 'subscription', 'fee', 'service', 'misc',
      'other', 'general'
    ]
  };

  // Find matching category based on keywords
  for (const [category, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }

  // Default to other if no match found
  return 'other';
} 