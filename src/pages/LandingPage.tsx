import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock,
  Receipt,
  BarChart3,
  HeadphonesIcon,
  ArrowRight,
  Play
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const features = [
    {
      icon: Receipt,
      title: "Professional Receipts",
      description: "Generate stunning, branded receipts that build trust with your customers"
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Track sales, monitor trends, and make data-driven decisions"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-level security with automatic backups and 99.9% uptime"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Automate your receipt generation and reduce paperwork by 80%"
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Collaborate with your team and manage multiple locations"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Get help when you need it with our dedicated support team"
    }
  ];

  const testimonials = [
    {
      name: "Ahmed Al-Mansouri",
      business: "Golden Touch Jewelry",
      location: "Dubai, UAE",
      text: "Gold Ease Receipt transformed our business. We've reduced receipt processing time by 75% and our customers love the professional look.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Sarah Johnson", 
      business: "Precious Metals Ltd",
      location: "London, UK",
      text: "The analytics feature helped us identify our best-selling products. Revenue increased by 30% in just 3 months!",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Mohammed Hassan",
      business: "Heritage Gold",
      location: "Cairo, Egypt", 
      text: "Finally, a receipt system designed for gold businesses. The purity calculations are spot-on and save us hours daily.",
      rating: 5,
      image: "/api/placeholder/60/60"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Receipts Generated" },
    { number: "500+", label: "Happy Businesses" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9★", label: "Customer Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Gold Ease Receipt</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pricing-public')}>
            Pricing
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth')}>
            Start Free Trial
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 bg-yellow-100 text-yellow-800 border-yellow-300">
          ✨ Trusted by 500+ Gold Businesses Worldwide
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
          Professional Receipts for Gold Businesses
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Generate stunning receipts, track sales analytics, and manage your gold business with the industry's most trusted platform. Join thousands of businesses already using Gold Ease Receipt.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" onClick={() => navigate('/auth')}>
            Start Free 14-Day Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="group">
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Watch Demo (2 min)
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-600">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Run Your Gold Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From receipt generation to business analytics, we've got you covered with tools specifically designed for gold businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Gold Business Owners Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say about transforming their businesses
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl font-medium mb-6">
                    "{testimonials[activeTestimonial].text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {testimonials[activeTestimonial].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{testimonials[activeTestimonial].name}</div>
                      <div className="text-muted-foreground text-sm">
                        {testimonials[activeTestimonial].business}, {testimonials[activeTestimonial].location}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that fits your business size. Start with a 14-day free trial.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <Card className="border-2 border-border hover:border-yellow-300 transition-colors">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <div className="text-2xl font-bold">$29.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 500 transactions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Professional receipts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Basic analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-400 shadow-lg scale-105">
              <CardHeader>
                <Badge className="w-fit mx-auto mb-2 bg-yellow-100 text-yellow-800">Most Popular</Badge>
                <CardTitle>Professional</CardTitle>
                <div className="text-2xl font-bold">$79.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 2,000 transactions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Custom branding
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-yellow-300 transition-colors">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="text-2xl font-bold">$199.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Unlimited transactions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    API access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Dedicated support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Button size="lg" onClick={() => navigate('/pricing-public')}>
            View All Plans & Features
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Gold Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of gold businesses already using Gold Ease Receipt. Start your free trial today.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              Start Free 14-Day Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-yellow-600">
              Contact Sales
            </Button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            No credit card required • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Gold Ease Receipt</span>
              </div>
              <p className="text-muted-foreground">
                The leading receipt management platform for gold businesses worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={() => navigate('/pricing-public')}>Pricing</button></li>
                <li>Features</li>
                <li>API</li>
                <li>Security</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Status</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              © 2025 Gold Ease Receipt. All rights reserved.
            </p>
            <div className="flex gap-6 text-muted-foreground mt-4 md:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;