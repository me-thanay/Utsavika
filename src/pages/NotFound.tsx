import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center bg-white px-4 py-20">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-playfair font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-playfair font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            Oops! The page you're looking for seems to have wandered off to another celebration. 
            Let's get you back to discovering our beautiful collections.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
