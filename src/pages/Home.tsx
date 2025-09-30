import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Heart, Gift, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import heroImage from '@/assets/hero-celebration.jpg';

const Home = () => {
  const featuredProducts = products.slice(0, 8);

  const categories = [
    {
      name: 'Candles',
      icon: Flame,
      description: 'Illuminate your celebrations',
      path: '/shop?category=candles',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      name: 'Chocolates',
      icon: Heart,
      description: 'Sweetness that melts hearts',
      path: '/shop?category=chocolates',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Gift Hampers',
      icon: Gift,
      description: 'Curated joy in every box',
      path: '/shop?category=hampers',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      name: 'Customized',
      icon: Sparkles,
      description: 'Made just for you',
      path: '/shop?category=customized',
      gradient: 'from-purple-500 to-red-500'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 animate-in slide-in-from-bottom duration-1000">
            Celebrate life's moments with Utsavika
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-in slide-in-from-bottom duration-1000 delay-200">
            Your one-stop destination for candles, chocolates, and festive hampers — thoughtfully curated to spread joy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-1000 delay-400">
            <Link to="/shop">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 text-lg">
                Shop Now
              </Button>
            </Link>
            <Link to="/shop?category=hampers">
              <Button size="lg" className="bg-rose-500 text-white hover:bg-rose-600 font-semibold px-8 py-3 text-lg shadow-lg">
                Explore Hampers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-foreground mb-4">
              Discover Our Collections
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From luminous candles to decadent chocolates, find the perfect celebration companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link key={category.name} to={category.path}>
                  <Card className="group cursor-pointer shadow-card hover:shadow-hover transition-all duration-300 border-0 overflow-hidden">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-playfair font-semibold text-foreground mb-2">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-pink-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked favorites that bring warmth and joy to every celebration
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;