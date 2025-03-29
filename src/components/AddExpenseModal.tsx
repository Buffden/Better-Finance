import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, Expense } from "@/types/finance";
import { Camera, Receipt, Plus, Upload, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onAddExpense: (expense: Expense) => void;
  onProcessReceipt: (file: File) => void;
}

const AddExpenseModal = ({
  open,
  onOpenChange,
  categories,
  onAddExpense,
  onProcessReceipt,
}: AddExpenseModalProps) => {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [activeTab, setActiveTab] = useState("manual");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    
    const newExpense: Expense = {
      id: "",
      amount: parseFloat(amount),
      categoryId,
      description,
      date: new Date().toISOString(),
      paymentMethod,
    };
    
    onAddExpense(newExpense);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setAmount("");
    setCategoryId("");
    setDescription("");
    setPaymentMethod("card");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onProcessReceipt(file);
      onOpenChange(false);
    }
  };

  const checkCameraPermissions = async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permissions.state === 'granted';
    } catch (error) {
      console.log('Permission check failed:', error);
      return false;
    }
  };

  const startCamera = async () => {
    try {
      console.log('Checking camera support...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }

      console.log('Checking camera permissions...');
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        console.log('Requesting camera permission...');
      }

      console.log('Attempting to start camera...');
      setCameraError(null);
      setShowCamera(true); // Show camera UI before stream to avoid layout shifts

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Getting user media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log('Video playback started');
                  resolve(true);
                })
                .catch((error) => {
                  console.error('Video playback failed:', error);
                  throw error;
                });
            }
          };
        }
      });

    } catch (error) {
      console.error('Camera initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not access camera';
      setCameraError(errorMessage);
      // Keep showing camera UI to display error
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
            onProcessReceipt(file);
            stopCamera();
            onOpenChange(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) stopCamera();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        
        {showCamera ? (
          <div className="relative">
            {cameraError ? (
              <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center p-4">
                  <p className="text-red-500 mb-2">Camera Error</p>
                  <p className="text-sm text-gray-600">{cameraError}</p>
                  <Button
                    onClick={() => {
                      setCameraError(null);
                      setShowCamera(false);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">
                      Initializing camera...
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <Button
                    onClick={capturePhoto}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    Capture
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="receipt">
                <Receipt className="h-4 w-4 mr-2" />
                Receipt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <span
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></span>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                    Add Expense
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="receipt" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={startCamera}
                  className="h-32 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>

                <div className="relative h-32">
                  <Button
                    className="h-full w-full flex flex-col items-center justify-center space-y-2"
                    variant="outline"
                  >
                    <Upload className="h-8 w-8" />
                    <span>Upload Receipt/Statement</span>
                  </Button>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,application/pdf"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                Take a photo or upload a receipt/bank statement to automatically extract expense details using AI
              </p>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
