import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getCartCount } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const totalAmount = getTotalPrice();
  const totalItems = getCartCount();

  if (cartItems.length === 0) {
    return (
      <div className="py-10 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any celebration essentials to your cart yet.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-h-12 px-6">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-4xl font-playfair font-bold text-foreground truncate">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Link to="/shop" className="shrink-0">
            <Button variant="outline" className="flex items-center gap-2 min-h-10 px-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-playfair">Items in Cart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 border border-border rounded-lg">
                    <div className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-playfair font-semibold text-foreground text-base md:text-lg truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-base md:text-lg font-bold text-primary mt-2">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-10 w-10 sm:h-8 sm:w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-10 sm:h-8 text-center"
                        min="0"
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-10 w-10 sm:h-8 sm:w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold text-foreground text-base md:text-lg">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive/90 mt-1 md:mt-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-0 gradient-card lg:sticky lg:top-4">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-playfair">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between text-muted-foreground text-sm md:text-base">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground text-sm md:text-base">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <hr className="border-border" />
                
                <div className="flex justify-between text-base md:text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <Link to="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 min-h-12">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <p className="text-xs text-muted-foreground text-center mt-3 md:mt-4">
                  Free shipping on all orders. Secure checkout guaranteed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;