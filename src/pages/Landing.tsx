import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Bot, 
  MessageSquare, 
  Globe, 
  Bell, 
  Database, 
  Mic, 
  Smartphone, 
  Shield,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: "Bilingual Support",
      description: "Seamlessly interact in both English and Telugu with natural language processing",
      details: ["English & Telugu Support", "Real-time Translation", "Cultural Context Awareness", "Natural Conversations"]
    },
    {
      icon: Bot,
      title: "AI-Powered Intelligence",
      description: "Advanced RAG system with smart query understanding and personalized recommendations",
      details: ["Natural Language Processing", "Context-Aware Responses", "Smart Recommendations", "Learning Capabilities"]
    },
    {
      icon: Mic,
      title: "Voice Interaction",
      description: "Complete voice support with speech-to-text and text-to-speech in both languages",
      details: ["Speech Recognition", "Voice Responses", "Hands-free Operation", "Multilingual Audio"]
    },
    {
      icon: Database,
      title: "Real-time Updates",
      description: "Live monitoring and updates of government schemes directly from official sources",
      details: ["Web Scraping", "Automatic Updates", "Data Verification", "Fresh Information"]
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Personalized alerts about new schemes and updates based on your profile",
      details: ["Personalized Alerts", "Scheme Updates", "Application Reminders", "Custom Preferences"]
    },
    {
      icon: Smartphone,
      title: "Multi-modal Access",
      description: "Available across web and mobile platforms with responsive design",
      details: ["Web Interface", "Mobile Responsive", "Cross-platform", "Accessible Design"]
    }
  ];

  const stats = [
    { number: "500+", label: "Government Schemes", icon: Award },
    { number: "2", label: "Languages Supported", icon: Globe },
    { number: "24/7", label: "AI Assistance", icon: Bot },
    { number: "100%", label: "Free Service", icon: CheckCircle }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-xl">Schemes Assistant</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                Built for India
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")}>
                  Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-blue-600">AI-Powered</span><br />
                <span className="text-green-600">Government Schemes</span><br />
                <span className="text-gray-900 dark:text-white">Assistant</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Your bilingual companion for navigating Indian and Telangana government 
                schemes with ease. Get personalized recommendations, real-time updates, 
                and step-by-step guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-3"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  తెలుగు (Telugu)
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Assistant</p>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm">Hello! I can help you find government schemes. What are you looking for?</p>
                    </div>
                    <div className="bg-blue-600 text-white rounded-lg p-3 ml-8">
                      <p className="text-sm">I need help with healthcare schemes</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm">Great! I found Ayushman Bharat scheme for you. It provides health coverage up to ₹5 lakh...</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the powerful features that make our AI assistant your perfect companion 
              for government scheme information.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to explore government schemes?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start chatting with our AI assistant to discover schemes that 
              match your needs.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            >
              <Zap className="w-5 h-5 mr-2" />
              Try Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                <span className="font-bold text-xl">Schemes Assistant</span>
              </div>
              <p className="text-gray-400">
                AI-powered assistant for Indian government schemes, 
                built to serve citizens with accurate and timely information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Bilingual Support</li>
                <li>Voice Interaction</li>
                <li>Real-time Updates</li>
                <li>Smart Notifications</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Government Schemes Assistant. Built for India with ❤️</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}