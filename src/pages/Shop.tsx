import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { products, getProductsByCategory } from '@/data/products';
import { Flame, Heart, Gift, Sparkles, Grid3X3, List } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [filteredProducts, setFilteredProducts] = useState(products);

  const categories = [
    { name: 'All Products', value: 'all', icon: Grid3X3 },
    { name: 'Candles', value: 'candles', icon: Flame },
    { name: 'Chocolates', value: 'chocolates', icon: Heart },
    { name: 'Gift Hampers', value: 'hampers', icon: Gift },
    { name: 'Customized', value: 'customized', icon: Sparkles },
  ];

  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setSelectedCategory(category);
    setFilteredProducts(getProductsByCategory(category));
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
    setFilteredProducts(getProductsByCategory(category));
  };

  return (
    <div className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
            Our Products
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated collection of celebration essentials
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-playfair font-semibold text-foreground mb-4">
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = selectedCategory === category.value;
                  return (
                    <Button
                      key={category.value}
                      variant={isActive ? "default" : "outline"}
                      onClick={() => handleCategoryChange(category.value)}
                      className={`flex items-center space-x-2 ${
                        isActive 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                          : 'hover:bg-primary/10 hover:text-primary border-border'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{category.name}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-playfair font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground">
                Try selecting a different category to see more products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;