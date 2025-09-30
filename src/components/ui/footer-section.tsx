"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Send, Twitter, Mail, Phone } from "lucide-react"
import { Link } from "react-router-dom"

function Footerdemo() {

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription submitted")
  }

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight font-playfair">Utsavika</h2>
            <p className="mb-6 text-muted-foreground">
              Join our newsletter for the latest updates on handcrafted candles, gift hampers, and exclusive offers.
            </p>
            <form className="relative" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm"
                required
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <Link to="/" className="block transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/about" className="block transition-colors hover:text-primary">
                About Us
              </Link>
              <Link to="/shop" className="block transition-colors hover:text-primary">
                Products
              </Link>
              <Link to="/contact" className="block transition-colors hover:text-primary">
                Contact
              </Link>
              <Link to="/cart" className="block transition-colors hover:text-primary">
                Cart
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <p>+91 9000630794</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <p>utsavika.store@gmail.com</p>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-primary" />
                <p>@utsavika_store</p>
              </div>
            </address>
          </div>
          
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => window.open('https://www.instagram.com/utsavika_store', '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => window.open('https://wa.me/919000630794', '_blank')}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="sr-only">WhatsApp</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat with us on WhatsApp</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => window.open('mailto:utsavika.store@gmail.com', '_blank')}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Email</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send us an email</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Developer Credits Section */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="text-center mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Developed with ❤️ by</h4>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">F.A.T.E</h4>
            <div className="flex justify-center space-x-6 text-sm">
              <a 
                href="https://www.linkedin.com/in/thanay-525924243/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>Thanay</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/varun-erabati-a384a9341/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>Varun</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Utsavika. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link to="/about" className="transition-colors hover:text-primary">
              About Us
            </Link>
            <Link to="/contact" className="transition-colors hover:text-primary">
              Contact
            </Link>
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
