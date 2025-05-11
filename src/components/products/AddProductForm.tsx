
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Barcode,
  Save,
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
  Search,
  RefreshCw,
  Sparkles,
  Copy,
  FileUp,
  Calendar,
  Ruler,
  Weight,
  Tag,
  Tags,
  Layers,
  ShoppingBag,
  Package,
  QrCode,
  Download,
  Upload,
  Scissors,
  RotateCw,
  Palette,
  Star,
  Clock,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import JsBarcode from 'jsbarcode';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

interface Product {
  name: string;
  price: number;
  description: string;
  image_url: string;
  barcode: string;
  stock: number;
  sku: string;
  category: string;
  tags?: string[];
  brand?: string;
  weight?: number;
  dimensions?: string;
  expiry_date?: string;
  cost_price?: number;
  tax_rate?: number;
  min_stock_level?: number;
  supplier?: string;
  location?: string;
  is_featured?: boolean;
  is_digital?: boolean;
  has_variants?: boolean;
  variants?: ProductVariant[];
  unit_of_measure?: string;
  warranty_info?: string;
  country_of_origin?: string;
  custom_fields?: Record<string, string>;
}

interface AddProductFormProps {
  barcode: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

// Product lookup result from external API
interface ProductLookupResult {
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  image_url?: string;
  price?: number;
  barcode?: string;
  weight?: number;
  dimensions?: string;
}

// Product template for quick addition
interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: Array<keyof Product>;
  defaultValues: Partial<Product>;
  icon: React.ReactNode;
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
  "Groceries",
  "Beverages",
  "Health",
  "Office",
  "Pet Supplies",
  "Other"
];

// Units of measure
const unitsOfMeasure = [
  "Each",
  "Pair",
  "Pack",
  "Box",
  "Carton",
  "Kg",
  "g",
  "L",
  "mL",
  "m",
  "cm",
  "mm"
];

// Product templates for quick addition
const productTemplates: ProductTemplate[] = [
  {
    id: "physical-product",
    name: "Physical Product",
    category: "General",
    description: "Standard physical product with inventory tracking",
    fields: ["name", "price", "stock", "barcode", "category", "brand", "weight", "dimensions"],
    defaultValues: {
      stock: 1,
      is_digital: false
    },
    icon: <Package className="h-5 w-5" />
  },
  {
    id: "digital-product",
    name: "Digital Product",
    category: "Digital",
    description: "Digital product without physical inventory",
    fields: ["name", "price", "category", "description"],
    defaultValues: {
      stock: 999,
      is_digital: true
    },
    icon: <FileUp className="h-5 w-5" />
  },
  {
    id: "food-product",
    name: "Food Product",
    category: "Food",
    description: "Food product with expiry date tracking",
    fields: ["name", "price", "stock", "barcode", "expiry_date", "weight"],
    defaultValues: {
      category: "Food",
      is_digital: false
    },
    icon: <ShoppingBag className="h-5 w-5" />
  },
  {
    id: "clothing-product",
    name: "Clothing Product",
    category: "Clothing",
    description: "Clothing product with variants (size, color)",
    fields: ["name", "price", "stock", "barcode", "brand", "has_variants"],
    defaultValues: {
      category: "Clothing",
      has_variants: true,
      is_digital: false
    },
    icon: <Tag className="h-5 w-5" />
  }
];

const AddProductForm: React.FC<AddProductFormProps> = ({
  barcode,
  isOpen,
  onClose,
  onSave
}) => {
  // Basic product info
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('1');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Advanced product info
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [costPrice, setCostPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Each');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  // Product flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDigital, setIsDigital] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);

  // Variants handling
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<string[]>([]);
  const [variantAttributeInput, setVariantAttributeInput] = useState('');
  const [showVariantBuilder, setShowVariantBuilder] = useState(false);

  // Image handling
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Barcode handling
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null);
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);
  const barcodeRef = useRef<HTMLDivElement>(null);

  // Template handling
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Bulk import
  const [bulkImportMode, setBulkImportMode] = useState(false);
  const [bulkImportData, setBulkImportData] = useState('');
  const [bulkImportPreview, setBulkImportPreview] = useState<Partial<Product>[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<ProductLookupResult | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Generate a random SKU when component mounts
  useEffect(() => {
    setSku(`SKU-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
  }, []);

  // Try to lookup product info when barcode is provided
  useEffect(() => {
    if (barcode && barcode.trim().length > 0) {
      lookupProductInfo(barcode);
    }
  }, [barcode]);

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Function to apply a product template
  const applyTemplate = (templateId: string) => {
    const template = productTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Apply default values from template
    if (template.defaultValues.category) {
      setCategory(template.defaultValues.category as string);
    }

    if (template.defaultValues.stock !== undefined) {
      setStock(template.defaultValues.stock.toString());
    }

    if (template.defaultValues.is_digital !== undefined) {
      setIsDigital(!!template.defaultValues.is_digital);
    }

    if (template.defaultValues.has_variants !== undefined) {
      setHasVariants(!!template.defaultValues.has_variants);

      if (template.defaultValues.has_variants && template.id === 'clothing-product') {
        // Add default variant attributes for clothing
        setVariantAttributes(['Size', 'Color']);
      }
    }

    // Set the selected template
    setSelectedTemplate(templateId);
    setShowTemplates(false);

    // Switch to the appropriate tab based on template
    if (template.fields.includes('weight') || template.fields.includes('dimensions')) {
      setActiveTab('advanced');
    } else if (template.fields.includes('description')) {
      setActiveTab('basic');
    }

    toast.success(`Applied ${template.name} template`);
  };

  // Function to generate a barcode
  const generateBarcode = () => {
    if (!barcodeRef.current) return;

    try {
      // Clear previous barcode
      barcodeRef.current.innerHTML = '';

      // Generate a barcode if none provided
      const barcodeValue = barcode || sku;

      if (!barcodeValue) {
        toast.error("Please enter a barcode or SKU value");
        return;
      }

      // Create a canvas element for the barcode
      const canvas = document.createElement('canvas');
      barcodeRef.current.appendChild(canvas);

      // Generate the barcode
      JsBarcode(canvas, barcodeValue, {
        format: barcodeType,
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
      });

      // Store the generated barcode
      setGeneratedBarcode(barcodeValue);

      // If no barcode was provided, use the generated one
      if (!barcode) {
        toast.success("Barcode generated from SKU");
      }

      setShowBarcodeGenerator(true);
    } catch (error) {
      console.error("Error generating barcode:", error);
      toast.error("Failed to generate barcode. Please try a different format or value.");
    }
  };

  // Function to download the generated barcode
  const downloadBarcode = () => {
    if (!barcodeRef.current || !generatedBarcode) return;

    try {
      const canvas = barcodeRef.current.querySelector('canvas');
      if (!canvas) return;

      // Create a download link
      const link = document.createElement('a');
      link.download = `barcode-${generatedBarcode}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Barcode downloaded successfully");
    } catch (error) {
      console.error("Error downloading barcode:", error);
      toast.error("Failed to download barcode");
    }
  };

  // Function to add a custom field
  const addCustomField = () => {
    if (!customFieldKey.trim() || !customFieldValue.trim()) {
      toast.error("Please enter both key and value for custom field");
      return;
    }

    setCustomFields(prev => ({
      ...prev,
      [customFieldKey]: customFieldValue
    }));

    setCustomFieldKey('');
    setCustomFieldValue('');

    toast.success("Custom field added");
  };

  // Function to remove a custom field
  const removeCustomField = (key: string) => {
    setCustomFields(prev => {
      const newFields = { ...prev };
      delete newFields[key];
      return newFields;
    });
  };

  // Function to add a variant attribute
  const addVariantAttribute = () => {
    if (!variantAttributeInput.trim()) {
      toast.error("Please enter an attribute name");
      return;
    }

    if (variantAttributes.includes(variantAttributeInput.trim())) {
      toast.error("This attribute already exists");
      return;
    }

    setVariantAttributes(prev => [...prev, variantAttributeInput.trim()]);
    setVariantAttributeInput('');
  };

  // Function to generate variants based on attributes
  const generateVariants = () => {
    if (variantAttributes.length === 0) {
      toast.error("Please add at least one variant attribute");
      return;
    }

    // For demo purposes, we'll create some sample variants
    // In a real app, you would have UI to define attribute values
    const sampleVariants: ProductVariant[] = [];

    if (variantAttributes.includes('Size')) {
      const sizes = ['S', 'M', 'L', 'XL'];
      const colors = variantAttributes.includes('Color') ? ['Red', 'Blue', 'Black'] : [''];

      sizes.forEach(size => {
        colors.forEach(color => {
          const variantName = color ? `${name} - ${size}, ${color}` : `${name} - ${size}`;
          const variantSku = `${sku}-${size}${color ? `-${color.charAt(0)}` : ''}`;

          sampleVariants.push({
            id: `variant-${Math.random().toString(36).substring(2, 9)}`,
            name: variantName,
            sku: variantSku,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 1,
            attributes: {
              Size: size,
              ...(color ? { Color: color } : {})
            }
          });
        });
      });
    } else {
      // Generic variant generation for other attributes
      variantAttributes.forEach(attr => {
        ['Option 1', 'Option 2', 'Option 3'].forEach((value, index) => {
          sampleVariants.push({
            id: `variant-${Math.random().toString(36).substring(2, 9)}`,
            name: `${name} - ${attr} ${value}`,
            sku: `${sku}-${attr.charAt(0)}${index + 1}`,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 1,
            attributes: {
              [attr]: value
            }
          });
        });
      });
    }

    setVariants(sampleVariants);
    setShowVariantBuilder(true);
    toast.success(`Generated ${sampleVariants.length} variants`);
  };

  // Function to lookup product information from external API
  const lookupProductInfo = async (barcode: string) => {
    setLookupLoading(true);
    setFormErrors({});

    try {
      // In a real app, this would be an API call to a product database
      // For demo purposes, we'll simulate a response after a delay
      setTimeout(() => {
        // Simulate a 70% chance of finding the product
        if (Math.random() > 0.3) {
          const mockResult: ProductLookupResult = {
            name: `Product ${barcode.substring(0, 4)}`,
            description: `This is an automatically generated description for product with barcode ${barcode}.`,
            brand: ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas'][Math.floor(Math.random() * 5)],
            category: categories[Math.floor(Math.random() * categories.length)],
            image_url: `https://source.unsplash.com/random/300x300?product`,
            price: Math.round(Math.random() * 100 * 100) / 100,
            weight: Math.round(Math.random() * 5 * 10) / 10,
            dimensions: `${Math.round(Math.random() * 30)}x${Math.round(Math.random() * 20)}x${Math.round(Math.random() * 10)} cm`
          };

          setLookupResult(mockResult);

          // Auto-fill the form with the found data
          setName(mockResult.name);
          setDescription(mockResult.description || '');
          if (mockResult.price) setPrice(mockResult.price.toString());
          if (mockResult.category) setCategory(mockResult.category);
          if (mockResult.brand) setBrand(mockResult.brand);
          if (mockResult.weight) setWeight(mockResult.weight.toString());
          if (mockResult.dimensions) setDimensions(mockResult.dimensions);
          if (mockResult.image_url) {
            setImageUrl(mockResult.image_url);
            setImagePreview(mockResult.image_url);
          }

          // Show success message with enhanced details
          toast.success(
            <div className="space-y-1">
              <p className="font-medium">Product information found!</p>
              <p className="text-xs text-muted-foreground">
                {mockResult.name} - ${mockResult.price?.toFixed(2)}
              </p>
              <p className="text-xs">You can edit details if needed.</p>
            </div>
          );

          // Suggest a template based on the category
          if (mockResult.category === 'Food' || mockResult.category === 'Beverages') {
            setSelectedTemplate('food-product');
          } else if (mockResult.category === 'Clothing' || mockResult.category === 'Accessories') {
            setSelectedTemplate('clothing-product');
          } else {
            setSelectedTemplate('physical-product');
          }
        } else {
          toast.info(
            <div className="space-y-1">
              <p>No product information found for barcode {barcode}</p>
              <p className="text-xs">Please fill in the details manually or try a template.</p>
            </div>
          );

          // Show templates to help the user
          setShowTemplates(true);
        }

        setLookupLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error looking up product:", error);
      toast.error("Failed to lookup product information");
      setLookupLoading(false);
    }
  };

  // Function to parse bulk import data
  const parseBulkImportData = () => {
    if (!bulkImportData.trim()) {
      toast.error("Please enter CSV or JSON data");
      return;
    }

    try {
      let products: Partial<Product>[] = [];

      // Check if it's JSON format
      if (bulkImportData.trim().startsWith('[') || bulkImportData.trim().startsWith('{')) {
        products = JSON.parse(bulkImportData);
        if (!Array.isArray(products)) {
          products = [products as Partial<Product>];
        }
      } else {
        // Assume CSV format
        const lines = bulkImportData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const product: Partial<Product> = {};

          headers.forEach((header, index) => {
            if (values[index]) {
              // Convert numeric fields
              if (['price', 'stock', 'weight', 'cost_price', 'tax_rate'].includes(header)) {
                // Safely cast the numeric value
                (product as any)[header] = parseFloat(values[index]);
              } else if (['is_featured', 'is_digital', 'has_variants'].includes(header)) {
                // Safely cast the boolean value
                (product as any)[header] = values[index].toLowerCase() === 'true';
              } else {
                // Safely cast the string value
                (product as any)[header] = values[index];
              }
            }
          });

          products.push(product);
        }
      }

      // Validate required fields
      const validProducts = products.filter(p => p.name && (p.price !== undefined || p.price !== null));

      if (validProducts.length === 0) {
        toast.error("No valid products found. Each product must have at least a name and price.");
        return;
      }

      setBulkImportPreview(validProducts);
      toast.success(`Found ${validProducts.length} valid products to import`);

      // Show preview of first product
      if (validProducts.length > 0) {
        const firstProduct = validProducts[0];
        setName(firstProduct.name || '');
        setPrice(firstProduct.price?.toString() || '');
        setDescription(firstProduct.description || '');
        if (firstProduct.category) setCategory(firstProduct.category);
        if (firstProduct.stock !== undefined) setStock(firstProduct.stock.toString());
        if (firstProduct.brand) setBrand(firstProduct.brand);
        if (firstProduct.image_url) {
          setImageUrl(firstProduct.image_url);
          setImagePreview(firstProduct.image_url);
        }
      }
    } catch (error) {
      console.error("Error parsing bulk import data:", error);
      toast.error("Failed to parse import data. Please check the format.");
    }
  };

  // Function to start the camera for image capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  // Function to capture image from camera
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setImagePreview(dataUrl);

        // In a real app, you would upload this image to your server or cloud storage
        // and then set the URL. For this demo, we'll just use the data URL.
        setImageUrl(dataUrl);

        // Stop the camera
        stopCamera();
      }
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setShowCamera(false);
  };

  // Function to add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Function to remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Function to apply AI suggestions
  const applyAiSuggestions = () => {
    // In a real app, this would call an AI service to generate product details
    setLoading(true);

    setTimeout(() => {
      // Generate some mock AI suggestions
      const aiName = name || `Smart ${categories[Math.floor(Math.random() * categories.length)]} Product`;
      const aiDescription = `This premium quality ${aiName.toLowerCase()} offers exceptional performance and reliability. Perfect for everyday use, it combines modern design with practical functionality.`;
      const aiTags = ['premium', 'quality', 'bestseller', 'new arrival'];
      const aiPrice = price || (Math.round(Math.random() * 100 * 100) / 100).toString();

      // Apply the suggestions
      setName(aiName);
      setDescription(aiDescription);
      setPrice(aiPrice);
      setTags(aiTags);

      toast.success("AI suggestions applied!");
      setLoading(false);
    }, 1500);
  };

  // Validate the form
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Product name is required";
    if (!price.trim()) errors.price = "Price is required";
    if (!stock.trim()) errors.stock = "Stock quantity is required";

    try {
      if (price && parseFloat(price) < 0) errors.price = "Price cannot be negative";
      if (stock && parseInt(stock) < 0) errors.stock = "Stock cannot be negative";
      if (weight && parseFloat(weight) < 0) errors.weight = "Weight cannot be negative";
      if (costPrice && parseFloat(costPrice) < 0) errors.costPrice = "Cost price cannot be negative";
      if (taxRate && (parseFloat(taxRate) < 0 || parseFloat(taxRate) > 100)) errors.taxRate = "Tax rate must be between 0 and 100";
    } catch (e) {
      errors.general = "Please enter valid numbers for numeric fields";
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      // Show error toast with details
      const errorMessages = Object.values(errors).join(", ");
      toast.error(`Please fix the following errors: ${errorMessages}`);
      return;
    }

    setLoading(true);

    // Create new product object with enhanced fields
    const newProduct: Product = {
      name,
      price: parseFloat(price),
      description,
      image_url: imageUrl || `https://source.unsplash.com/random/300x300?${name.split(' ')[0].toLowerCase()}`,
      barcode: barcode || generatedBarcode || "",
      stock: parseInt(stock),
      sku: sku || `SKU-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      category: category || "Other",
      tags,
      brand: brand || undefined,

      // Advanced fields
      weight: weight ? parseFloat(weight) : undefined,
      dimensions: dimensions || undefined,
      expiry_date: expiryDate ? expiryDate.toISOString() : undefined,
      cost_price: costPrice ? parseFloat(costPrice) : undefined,
      tax_rate: taxRate ? parseFloat(taxRate) : undefined,
      min_stock_level: minStockLevel ? parseInt(minStockLevel) : undefined,
      supplier: supplier || undefined,
      location: location || undefined,
      unit_of_measure: unitOfMeasure || undefined,
      warranty_info: warrantyInfo || undefined,
      country_of_origin: countryOfOrigin || undefined,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,

      // Flags
      is_featured: isFeatured,
      is_digital: isDigital,
      has_variants: hasVariants && variants.length > 0,

      // Variants
      variants: hasVariants && variants.length > 0 ? variants : undefined
    };

    // Save the product
    onSave(newProduct);

    // Show success message with product details
    toast.success(
      <div className="space-y-1">
        <p className="font-medium">Product added successfully!</p>
        <p className="text-xs text-muted-foreground">
          {name} - ${parseFloat(price).toFixed(2)}
        </p>
      </div>
    );

    setLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    // Reset basic info
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setStock('1');
    setBrand('');
    setTags([]);
    setTagInput('');
    setSku(`SKU-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);

    // Reset advanced info
    setWeight('');
    setDimensions('');
    setExpiryDate(null);
    setCostPrice('');
    setTaxRate('');
    setMinStockLevel('');
    setSupplier('');
    setLocation('');
    setUnitOfMeasure('Each');
    setWarrantyInfo('');
    setCountryOfOrigin('');
    setCustomFields({});
    setCustomFieldKey('');
    setCustomFieldValue('');

    // Reset flags
    setIsFeatured(false);
    setIsDigital(false);
    setHasVariants(false);

    // Reset variants
    setVariants([]);
    setVariantAttributes([]);
    setVariantAttributeInput('');
    setShowVariantBuilder(false);

    // Reset image
    setImageUrl('');
    setImagePreview(null);
    setCapturedImage(null);
    setShowCamera(false);
    setImageLoading(false);
    setCropMode(false);

    // Reset barcode
    setGeneratedBarcode(null);
    setBarcodeType('CODE128');
    setShowBarcodeGenerator(false);

    // Reset template
    setSelectedTemplate(null);
    setShowTemplates(false);

    // Reset bulk import
    setBulkImportMode(false);
    setBulkImportData('');
    setBulkImportPreview([]);

    // Reset UI state
    setActiveTab('basic');
    setLookupResult(null);
    setFormErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopCamera();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add New Product</span>
            {lookupLoading && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Looking up product...
              </Badge>
            )}
            {lookupResult && (
              <Badge variant="secondary" className="ml-2">
                <Search className="h-3 w-3 mr-1" />
                Product found
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Create a new product using the scanned barcode.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              {/* Barcode field */}
              <div className="grid gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex items-center gap-2">
                  <Input id="barcode" value={barcode} readOnly className="bg-muted font-mono" />
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* AI suggestions button */}
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={applyAiSuggestions}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                )}
                Generate AI Suggestions
              </Button>

              {/* Basic product info fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
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
                    <Label htmlFor="price">
                      Price <span className="text-destructive">*</span>
                    </Label>
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
                    <Label htmlFor="stock">
                      Stock <span className="text-destructive">*</span>
                    </Label>
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
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Enter brand name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Tags input */}
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add tags and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('image')}
                >
                  Next: Add Image
                </Button>
              </div> */}
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Product Image</Label>

                  {/* Image preview */}
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-full max-w-[300px] aspect-square mx-auto">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-contain rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={() => {
                            setImagePreview(null);
                            setImageUrl('');
                            setCapturedImage(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : showCamera ? (
                      <div className="relative w-full max-w-[300px] aspect-square mx-auto">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            type="button"
                            onClick={captureImage}
                            className="bg-primary/80 hover:bg-primary/90"
                          >
                            Capture
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50"
                          onClick={stopCamera}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={startCamera}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Generate a random image based on product name or category
                              const searchTerm = name || category || 'product';
                              const randomImage = `https://source.unsplash.com/random/300x300?${searchTerm.split(' ')[0].toLowerCase()}`;
                              setImageUrl(randomImage);
                              setImagePreview(randomImage);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image URL input */}
                  <div className="grid gap-2 mt-4">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('basic')}
                >
                  Back: Basic Info
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('advanced')}
                >
                  Next: Advanced
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                  <Input
                    id="sku"
                    placeholder="Enter SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>

                {/* Additional fields could be added here */}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('image')}
                >
                  Back: Image
                </Button>
              </div>
            </TabsContent>

            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Product
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
