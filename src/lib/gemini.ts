import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface ProcessedTransaction {
  amount: number;
  categoryId: string;
  date: string;
  description: string;
  paymentMethod: string;
}

// Supported file types
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf'
];

// Category mapping for common transactions
const CATEGORY_MAPPING: { [key: string]: string } = {
  'starbucks': 'food',
  'coffee': 'food',
  'uber': 'transport',
  'rent': 'utilities',
  'grocery': 'shopping',
  'electricity': 'utilities',
  'netflix': 'entertainment',
  'restaurant': 'food',
  'salary': 'other',
  'bill': 'utilities',
  'subscription': 'entertainment'
};

function determineCategory(description: string): string {
  description = description.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAPPING)) {
    if (description.includes(keyword)) {
      return category;
    }
  }
  return 'other';
}

export async function processInvoiceWithGemini(file: File): Promise<ProcessedTransaction[]> {
  try {
    // Validate API key
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured. Please check your .env file.");
    }

    // Validate file type
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload a supported image file (JPEG, PNG, WEBP, HEIC, HEIF) or PDF.`);
    }

    // Validate file size (max 4MB)
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is 4MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    console.log("Starting bank statement processing...");
    console.log("File type:", file.type);
    console.log("File size:", file.size);
    console.log("File name:", file.name);

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    console.log("File converted to base64");
    
    // Get the model - using gemini-1.5-flash instead of gemini-pro-vision
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model initialized");

    // Prepare the prompt with more specific instructions
    const prompt = `You are a financial data extraction expert. Please analyze this bank statement image and extract all transactions in a precise JSON format. For each transaction line, extract:
    {
      "transactions": [
        {
          "date": "YYYY-MM-DD",
          "description": "exact transaction description",
          "amount": number (use positive for credits like salary, negative for debits like purchases)
        }
      ]
    }
    
    Important:
    - Keep the exact descriptions as shown in the statement
    - Maintain the exact dates in YYYY-MM-DD format
    - Use negative numbers for expenses/debits and positive for income/credits
    - Provide only the JSON response, no additional text
    
    Please process the image and return only the JSON data.`;

    console.log("Sending request to Gemini AI...");
    // Generate content with the new model
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini AI:", text);
    
    // Parse the JSON response
    let parsedData;
    try {
      // Clean the response text to ensure it's valid JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to parse AI response. Please try again.");
    }
    
    if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
      throw new Error("Invalid response format: missing transactions array");
    }

    // Process each transaction
    const processedTransactions: ProcessedTransaction[] = parsedData.transactions.map((transaction: any) => {
      const categoryId = determineCategory(transaction.description);
      return {
        amount: Number(transaction.amount),
        categoryId,
        date: transaction.date,
        description: transaction.description,
        paymentMethod: 'card' // Default to card for bank statements
      };
    });

    // Validate all transactions
    processedTransactions.forEach(transaction => {
      if (isNaN(transaction.amount)) {
        throw new Error(`Invalid amount in transaction: ${transaction.description}`);
      }
      if (!transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error(`Invalid date format in transaction: ${transaction.description}`);
      }
    });

    console.log("Successfully processed transactions:", processedTransactions);
    return processedTransactions;
  } catch (error) {
    console.error('Error processing bank statement with Gemini:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to process bank statement: ${error.message}`);
    }
    throw new Error('Failed to process bank statement. Please try again.');
  }
}

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => {
      console.error("Error reading file:", error);
      reject(new Error("Failed to read file"));
    };
  });
} 