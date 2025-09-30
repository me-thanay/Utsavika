import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Sparkles, Flame, Heart, Gift, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user, signOut } = useAuth();
  const cartCount = getCartCount();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const categories = [
    { name: 'Candles', icon: Flame, path: '/shop?category=candles' },
    { name: 'Chocolates', icon: Heart, path: '/shop?category=chocolates' },
    { name: 'Gift Hampers', icon: Gift, path: '/shop?category=hampers' },
    { name: 'Customized', icon: Sparkles, path: '/shop?category=customized' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-pink-100 to-rose-100 border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Utsavika Logo" 
              className="h-40 w-65 object-contain bg-transparent mt-4"
            />
            <span className="text-2xl font-playfair font-bold text-foreground">
             
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/shop') ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Cart & Auth */}
          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary hover:bg-primary"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Category Quick Links */}
        <div className="hidden md:flex items-center justify-center space-x-6 py-3 border-t">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;