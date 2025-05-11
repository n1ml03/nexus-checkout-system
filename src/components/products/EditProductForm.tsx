import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Barcode, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  barcode: string;
  stock: number;
  sku: string;
  category: string;
}

interface EditProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, product: Omit<Product, 'id'>) => void;
}

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home",
  "Beauty",
  "Sports",
  "Food",
  "Toys",
  "Accessories",
  "Smart Home",
  "Wearables",
  "Home Appliances",
  "Other"
];

const EditProductForm: React.FC<EditProductFormProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form with product data when it changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description || '');
      setCategory(product.category || 'Other');
      setStock(product.stock.toString());
      setBarcode(product.barcode || '');
      setSku(product.sku || '');
      setImageUrl(product.image_url || '');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !name || !price || !stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    // Create updated product object
    const updatedProduct = {
      name,
      price: parseFloat(price),
      description,
      image_url: imageUrl,
      barcode,
      stock: parseInt(stock),
      sku,
      category: category || "Other"
    };
    
    // Save the product
    onSave(product.id, updatedProduct);
    setLoading(false);
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="barcode" 
                value={barcode} 
                onChange={(e) => setBarcode(e.target.value)}
              />
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input 
              id="name" 
              placeholder="Enter product name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input 
                id="price"
                type="number" 
                placeholder="0.00" 
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)} 
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input 
                id="stock"
                type="number" 
                placeholder="1" 
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)} 
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input 
              id="sku" 
              placeholder="Product SKU" 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input 
              id="imageUrl" 
              placeholder="https://example.com/image.jpg" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Enter product description" 
              rows={3} 
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductForm;
