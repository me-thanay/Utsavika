import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product, useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowToggle = useMemo(() => {
    // Show read more if description is fairly long
    return (product.description?.length || 0) > 140;
  }, [product.description]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    addToCart(product);
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
            className="text-primary hover:underline text-xs font-medium mb-3"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ₹{product.price}
          </span>
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