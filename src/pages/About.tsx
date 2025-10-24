import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Gift, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Love & Togetherness',
      description: 'Every product is crafted to strengthen bonds and create beautiful memories with your loved ones.'
    },
    {
      icon: Sparkles,
      title: 'Quality & Craftsmanship',
      description: 'We believe in excellence. Each item is carefully selected and crafted to meet the highest standards.'
    },
    {
      icon: Gift,
      title: 'Meaningful Gifting',
      description: 'Our curated collections are designed to convey emotions and make every gesture more special.'
    },
    {
      icon: Users,
      title: 'Community & Celebration',
      description: 'We celebrate diversity and bring communities together through the universal language of gifting.'
    }
  ];

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-6">
            About Utsavika
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
        </div>

        {/* Main Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="shadow-card border-0 gradient-card">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              </div>
              
              <div className="prose prose-lg mx-auto text-center">
                <p className="text-xl text-foreground leading-relaxed mb-6">
                  Utsavika is more than just a brand — it's a feeling, a celebration, a joyful expression of love and togetherness.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Inspired by the Sanskrit word 'Utsav', meaning festival or celebration, Utsavika brings you a curated range of festive delights that light up every occasion. From beautifully crafted candles that illuminate your moments, to luxurious handcrafted chocolates that melt hearts, and thoughtful gift hampers that spread joy — Utsavika is your one-stop celebration companion.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Whether it's Diwali, Rakhi, Christmas, Eid, Pongal, or a personal milestone — we make your memories warmer, sweeter, and more meaningful. Every product in our collection is chosen with care, crafted with love, and delivered with the promise of bringing smiles to faces and warmth to hearts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide us in creating memorable experiences for you and your loved ones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300 border-0 gradient-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-playfair font-semibold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-card border-0 gradient-hero max-w-3xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-3xl font-playfair font-bold text-white mb-4">
                Join Our Celebration
              </h3>
              <p className="text-xl text-white/90 mb-6">
                Be part of the Utsavika family and let's create beautiful memories together, one celebration at a time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;