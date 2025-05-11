import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentMethod, PAYMENT_METHODS } from "@/lib/payment";
import { Loader2, Smartphone, ArrowRight } from "lucide-react";

interface ThirdPartyPaymentProps {
  method: PaymentMethod;
  amount: number;
  onComplete: () => void;
}

const ThirdPartyPayment = ({ method, amount, onComplete }: ThirdPartyPaymentProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentInfo = PAYMENT_METHODS[method];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // In a real implementation, this would redirect to the payment provider
    // or open their app via deep linking
    // For this demo, we'll simulate a successful payment after a delay
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: `${paymentInfo.color}20` }}
            >
              {paymentInfo.icon === 'wallet' && (
                <Smartphone 
                  className="h-5 w-5" 
                  style={{ color: paymentInfo.color }} 
                />
              )}
            </div>
            <div>
              <h3 className="font-medium">{paymentInfo.name}</h3>
              <p className="text-sm text-muted-foreground">{paymentInfo.description}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send a payment request to your {paymentInfo.name} account
              </p>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${amount.toFixed(2)} with {paymentInfo.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          You will be redirected to {paymentInfo.name} to complete your payment
        </p>
      </div>
    </div>
  );
};

export default ThirdPartyPayment;
