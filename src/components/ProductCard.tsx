import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Product, useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToCartWithVariant } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  const shouldShowToggle = useMemo(() => {
    // Always show toggle if there is any description text
    return (product.description?.length || 0) > 0;
  }, [product.description]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (product.variants && product.variants.length > 0) {
      if (!selectedVariant) {
        // If no variant selected, use the first variant as default
        const defaultVariant = product.variants[0];
        addToCartWithVariant(product, defaultVariant);
      } else {
        const variant = product.variants.find(v => `${v.name}-${v.price}` === selectedVariant);
        if (variant) {
          addToCartWithVariant(product, variant);
        }
      }
    } else {
      addToCart(product);
    }
  };

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 border-0 gradient-card">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-playfair font-semibold text-lg text-foreground mb-2">
          {product.name}
        </h3>
        <p className={`text-muted-foreground text-sm ${shouldShowToggle ? 'mb-1' : 'mb-3'} ${isExpanded ? '' : 'line-clamp-2'}`}>
          {product.description}
        </p>
        {shouldShowToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-primary hover:underline text-sm font-medium mt-1 mb-3 inline-flex"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
        {/* Variant Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Select Quantity:
            </Label>
            <RadioGroup
              value={selectedVariant}
              onValueChange={setSelectedVariant}
              className="space-y-2"
            >
              {product.variants.map((variant, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={`${variant.name}-${variant.price}`} 
                    id={`${product.id}-${index}`}
                  />
                  <Label 
                    htmlFor={`${product.id}-${index}`}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {variant.name} - ₹{variant.price}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            {product.originalPrice && (
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base text-muted-foreground line-through font-medium">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                  Save ₹{(product.originalPrice - product.price).toLocaleString()}
                </span>
              </div>
            )}
            <span className="text-xl sm:text-2xl font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-green-600 font-medium">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          size="sm"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;