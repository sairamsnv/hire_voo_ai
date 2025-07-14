
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Pricing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state
  useEffect(() => {
    const checkLoginState = () => {
      const loginState = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginState);
    };

    checkLoginState();
    
    // Listen for storage changes
    window.addEventListener('storage', checkLoginState);
    
    return () => {
      window.removeEventListener('storage', checkLoginState);
    };
  }, []);

  const plans = [
    {
      name: 'Test Plan',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out our platform',
      popular: false,
      features: [
        { name: '50 new Jobs / month', included: true },
        { name: 'Dashboard Access', included: false },
        { name: 'Support Access', included: false },
      ]
    },
    {
      name: 'Lite Plan',
      price: '$29',
      period: '/month',
      description: 'Great for individual consultants',
      popular: true,
      features: [
        { name: '1500 Jobs / month', included: true },
        { name: 'Dashboard Access', included: true },
        { name: 'Support Access', included: false },
      ]
    },
    {
      name: 'Pro Plan',
      price: '$99',
      period: '/month',
      description: 'Best for professional consultants and agencies',
      popular: false,
      features: [
        { name: '3500 Jobs / month', included: true },
        { name: 'Dashboard Access', included: true },
        { name: 'Support Access', included: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={isLoggedIn} />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 shadow-luxury border-white/60">
            <Crown className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              Premium Plans
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get access to premium job opportunities with our flexible pricing plans designed for consultants at every level.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`glass card-hover shadow-luxury border-white/60 relative overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500/20 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 text-sm font-semibold">
                    <Star className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <CardTitle className="text-2xl font-bold gradient-text mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="plan-details space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">{feature.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <X className="w-5 h-5" />
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full h-12 font-semibold ${
                      plan.popular 
                        ? 'btn-glossy text-white shadow-luxury' 
                        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Test Plan' ? 'Start Free Trial' : 'Get Started'}
                    {plan.popular && <Zap className="w-4 h-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Features */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold gradient-text mb-8">All plans include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 p-4 glass rounded-xl shadow-premium">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="font-medium">Secure Platform</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 glass rounded-xl shadow-premium">
                <Star className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Premium Quality Jobs</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 glass rounded-xl shadow-premium">
                <Zap className="w-6 h-6 text-purple-600" />
                <span className="font-medium">Real-time Updates</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Have questions about our pricing?
            </p>
            <Link to="/contact">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
