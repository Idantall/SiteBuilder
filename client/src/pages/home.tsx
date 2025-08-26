import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Menu,
  X,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { 
  SiRedis,
  SiTypescript,
  SiReact,
  SiPython,
  SiNodedotjs,
  SiPostgresql,
  SiDocker,
  SiVercel,
  SiChatbot,
  SiFastapi
} from "react-icons/si";
import StackIcon from "tech-stack-icons";
import logoImg from "@assets/IMG_4364_1754462674951.png";
import fintechImg from "@assets/Finance_1755018204858.png";
import manufacturingImg from "@assets/Manufacturing_1755018201891.png";
import saasImg from "@assets/SaaS_1755018201889.png";
import digitalHealthImg from "@assets/Digital Health_1755018201890.png";
import viteIcon from "@assets/vite_icon_1755627981796.png";
import qdrantIcon from "@assets/qdrant_icon_1755627984818.png";
import pineconeIcon from "@assets/pinecone_icon_1755627987215.png";
import fastapiIcon from "@assets/fastapi_icon_1755627989650.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import HeroCardPinpoint from "@/components/HeroCardPinpoint";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Logo from "@assets/Logo.png";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  brief: z.string().min(10, "Please provide more details").max(140, "Brief must be 140 characters or less"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModel, setActiveModel] = useState("fullstack");
  const [navBackground, setNavBackground] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [serviceDetailModalOpen, setServiceDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  const models = [
    {
      id: "fullstack",
      name: "Fullstack",
      title: "Fullstack Development",
      description: "End-to-end web and mobile applications using React, Node.js, Python, and modern cloud infrastructure. From MVP to enterprise scale.",
      gradient: "from-purple-400 via-pink-400 to-orange-400"
    },
    {
      id: "automation", 
      name: "Automation",
      title: "Intelligent Automation",
      description: "Complex workflow automation using n8n and LangGraph. AI-powered processes that integrate with your existing tools and systems.",
      gradient: "from-blue-400 via-purple-400 to-pink-400"
    },
    {
      id: "lectures",
      name: "Lectures", 
      title: "n8n Training & Consulting",
      description: "Official n8n lecturing and training programs. Transform your team into automation experts with hands-on workshops and consulting.",
      gradient: "from-green-400 via-blue-400 to-purple-400"
    }
  ];

  const currentModel = models.find(m => m.id === activeModel) || models[0];

  // Advanced scroll animation system
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / documentHeight, 1);
      
      setScrollProgress(progress);
      setNavBackground(scrollY > 20);
      
      // Advanced reveal animations with precise timing
      const reveals = document.querySelectorAll('.reveal:not(.revealed)');
      reveals.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate reveal threshold based on element position
        const revealPoint = windowHeight * 0.8;
        const progressPoint = windowHeight * 0.6;
        
        if (elementTop < revealPoint) {
          // Add delay based on index for sequential reveals
          setTimeout(() => {
            element.classList.add('revealed');
          }, index * 150);
        }
        
        // Progressive animation based on scroll progress
        if (elementTop < progressPoint && elementTop > -elementHeight) {
          const elementProgress = Math.max(0, Math.min(1, (progressPoint - elementTop) / elementHeight));
          (element as HTMLElement).style.setProperty('--scroll-progress', elementProgress.toString());
        }
      });
      
      // Stagger animations with improved timing
      const staggerItems = document.querySelectorAll('.stagger-item:not(.animate)');
      staggerItems.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const triggerPoint = window.innerHeight * 0.85;
        
        if (rect.top < triggerPoint) {
          // Staggered timing based on position and index
          setTimeout(() => {
            element.classList.add('animate');
          }, index * 100 + Math.random() * 50);
        }
      });

      // Parallax effects for sections
      updateParallaxEffects(scrollY);
    };

    const updateParallaxEffects = (scrollY: number) => {
      const sections = [heroRef, platformRef, solutionsRef, researchRef, companyRef];
      
      sections.forEach((ref, index) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const speed = 0.5 + (index * 0.1); // Different speeds for each section
          const yPos = -(scrollY * speed);
          
          // Calculate opacity differently for footer (last section)
          let opacity = 1;
          if (window.innerWidth > 768) {
            if (index === sections.length - 1) {
              // For the footer/company section, ensure it stays visible when scrolled to bottom
              const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
              const scrollProgress = scrollY / documentHeight;
              opacity = Math.max(0.8, Math.min(1, 1.5 - scrollProgress));
            } else {
              opacity = Math.max(0, Math.min(1, 1 - Math.abs(rect.top) / window.innerHeight));
            }
          }
          
          // Apply subtle parallax effects only on desktop
          if (window.innerWidth > 768) {
            ref.current.style.transform = `translateY(${yPos * 0.05}px)`;
            ref.current.style.opacity = opacity.toString();
          } else {
            // Keep opacity normal for mobile
            ref.current.style.opacity = '1';
          }
        }
      });
    };

    // Throttled scroll handler for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        const currentIndex = models.findIndex(m => m.id === activeModel);
        const newIndex = currentIndex > 0 ? currentIndex - 1 : models.length - 1;
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveModel(models[newIndex].id);
          setIsTransitioning(false);
        }, 200);
      }
      if (event.key === 'ArrowRight') {
        const currentIndex = models.findIndex(m => m.id === activeModel);
        const newIndex = currentIndex < models.length - 1 ? currentIndex + 1 : 0;
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveModel(models[newIndex].id);
          setIsTransitioning(false);
        }, 200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModel, models]);

  // Lazy loading effect for mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      brief: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
      setIsContactModalOpen(false);
      setServiceDetailModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header height
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navBackground ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      } border-b border-gray-200`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={Logo} 
                alt="82 Labs" 
                className="h-8 transition-transform hover:scale-105 duration-300 cursor-pointer"
                data-testid="logo-82labs"
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
              <button 
                onClick={() => scrollToSection("platform")} 
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium hover:scale-105"
                data-testid="link-platform"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection("solutions")} 
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium hover:scale-105"
                data-testid="link-solutions"
              >Why 82Labs</button>
              <button 
                onClick={() => scrollToSection("research")} 
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium hover:scale-105"
                data-testid="link-research"
              >
                Industries
              </button>
            </div>
            
            {/* CTA & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsContactModalOpen(true)}
                className="minimal-button minimal-button-primary hidden md:block"
                data-testid="button-request-demo"
              >
                Request a demo
              </Button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 mobile-menu animate-in slide-in-from-top duration-300">
              <div className="space-y-4">
                <button 
                  onClick={() => scrollToSection("platform")} 
                  className="flex items-center justify-between w-full py-2 text-gray-900 hover:text-gray-600 transition-colors"
                  data-testid="mobile-link-platform"
                >
                  Services
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button 
                  onClick={() => scrollToSection("solutions")} 
                  className="flex items-center justify-between w-full py-2 text-gray-900 hover:text-gray-600 transition-colors"
                  data-testid="mobile-link-solutions"
                >
                  Why 82 Labs
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button 
                  onClick={() => scrollToSection("research")} 
                  className="flex items-center justify-between w-full py-2 text-gray-900 hover:text-gray-600 transition-colors"
                  data-testid="mobile-link-research"
                >
                  Industries
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="minimal-button minimal-button-primary w-full mt-4"
                  data-testid="mobile-button-request-demo"
                >
                  Request a demo
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8" ref={heroRef}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Empty space where trusted companies used to be */}
          <div className="mb-8"></div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto fade-in-delay-1 leading-tight font-space-mono">
            Expert Software Development & Automation Solutions
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto fade-in-delay-2 leading-relaxed">
            82 Labs delivers complex fullstack applications for web and mobile, powered by cutting-edge automation 
            technologies including n8n and LangGraph. Official n8n lecturers with enterprise-grade expertise.
          </p>
          
          <div className="fade-in-delay-3">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="minimal-button minimal-button-primary text-lg px-8 py-4"
              data-testid="button-request-demo-hero"
            >
              Request a demo
            </Button>
          </div>
        </div>
      </section>
      {/* Technology Sliding Bar - Moved to under hero section */}
      <div className="overflow-hidden">
        <div className="tech-slider">
          <div className="tech-track">
            {/* Render tech items twice for continuous scroll effect */}
            {[...Array(2)].map((_, repeatIndex) => 
              [
                { type: 'stack' as const, name: 'n8n', label: 'n8n' },
                { type: 'stack' as const, name: 'cohere', label: 'Cohere' },
                { type: 'stack' as const, name: 'langchain', label: 'LangChain' },
                { type: 'stack' as const, name: 'langgraph', label: 'LangGraph' },
                { type: 'stack' as const, name: 'react', label: 'React' },
                { type: 'stack' as const, name: 'python', label: 'Python' },
                { type: 'stack' as const, name: 'nodejs', label: 'Node.js' },
                { type: 'stack' as const, name: 'typescript', label: 'TypeScript' },
                { type: 'png' as const, src: fastapiIcon, alt: 'FastAPI', label: 'FastAPI' },
                { type: 'png' as const, src: viteIcon, alt: 'Vite', label: 'Vite' },
                { type: 'stack' as const, name: 'docker', label: 'Docker' },
                { type: 'stack' as const, name: 'postgresql', label: 'PostgreSQL' },
                { type: 'stack' as const, name: 'redis', label: 'Redis' },
                { type: 'png' as const, src: pineconeIcon, alt: 'Pinecone', label: 'Pinecone' },
                { type: 'png' as const, src: qdrantIcon, alt: 'Qdrant', label: 'Qdrant' },
                { type: 'stack' as const, name: 'vercel', label: 'Vercel' },
                { type: 'stack' as const, name: 'tailwindcss', label: 'Tailwind' },
                { type: 'stack' as const, name: 'nextjs', label: 'Next.js' },
                { type: 'stack' as const, name: 'aws', label: 'AWS' },
                { type: 'stack' as const, name: 'openai', label: 'OpenAI' }
              ].map((tech, index) => (
                <div key={`${repeatIndex}-${index}`} className="tech-item">
                  {tech.type === 'stack' ? (
                    <StackIcon name={tech.name} className="w-8 h-8" />
                  ) : (
                    <img src={tech.src} alt={tech.alt} className="w-8 h-8" />
                  )}
                  <span>{tech.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Models Section */}
      <section id="platform" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative" ref={platformRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 font-space-mono">
              Our Core Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three specialized domains where we excel — delivering comprehensive solutions from concept to deployment.
            </p>
          </div>

          {/* Model Selector - Tabs on Desktop, Dropdown on Mobile */}
          <div className="mb-8 reveal">
            {/* Desktop Tabs */}
            <div className="hidden md:flex justify-center mb-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setActiveModel(model.id);
                        setIsTransitioning(false);
                      }, 200);
                    }}
                    className={`service-tab-button ${
                      activeModel === model.id
                        ? 'active text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    data-testid={`tab-${model.id}`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden flex justify-center">
              <Select 
                value={activeModel} 
                onValueChange={(value) => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setActiveModel(value);
                    setIsTransitioning(false);
                  }, 200);
                }}
              >
                <SelectTrigger className="w-[200px] border-0 border-b-2 border-orange-200 rounded-none hover:border-orange-300 focus:border-orange-400 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Navigation hint */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">Use arrow keys to navigate • Swipe on mobile</p>
            </div>
          </div>

          {/* Model Card with Touch Support */}
          <div className={`max-w-4xl lg:max-w-5xl mx-auto reveal touch-pan-x relative lg:w-4/5 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <div 
              className={`model-card-container relative ${isTransitioning ? 'transitioning' : ''}`}
              style={{ 
                transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                isolation: 'isolate'
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e.currentTarget.setAttribute('data-start-x', touch.clientX.toString());
                e.currentTarget.setAttribute('data-start-y', touch.clientY.toString());
                e.currentTarget.setAttribute('data-start-time', Date.now().toString());
              }}
              onTouchMove={(e) => {
                const startX = parseFloat(e.currentTarget.getAttribute('data-start-x') || '0');
                const startY = parseFloat(e.currentTarget.getAttribute('data-start-y') || '0');
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                
                const diffX = Math.abs(startX - currentX);
                const diffY = Math.abs(startY - currentY);
                
                // If horizontal movement is dominant, prevent default to avoid scrolling
                if (diffX > diffY && diffX > 15) {
                  e.preventDefault();
                }
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat(e.currentTarget.getAttribute('data-start-x') || '0');
                const startY = parseFloat(e.currentTarget.getAttribute('data-start-y') || '0');
                const startTime = parseFloat(e.currentTarget.getAttribute('data-start-time') || '0');
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const endTime = Date.now();
                
                const diffX = startX - endX;
                const diffY = Math.abs(startY - endY);
                const timeDiff = endTime - startTime;
                
                // Only process swipes that are:
                // 1. Horizontal (min 50px horizontal, max 50px vertical)
                // 2. Fast enough (less than 300ms) or long enough (more than 80px)
                const isHorizontalSwipe = Math.abs(diffX) > 50 && diffY < 50;
                const isFastEnough = timeDiff < 300;
                const isLongEnough = Math.abs(diffX) > 80;
                
                if (isHorizontalSwipe && (isFastEnough || isLongEnough)) {
                  const currentIndex = models.findIndex(m => m.id === activeModel);
                  
                  if (diffX > 0) {
                    // Swipe left - next (with circular navigation)
                    const nextIndex = currentIndex < models.length - 1 ? currentIndex + 1 : 0;
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setActiveModel(models[nextIndex].id);
                      setIsTransitioning(false);
                    }, 200);
                  } else {
                    // Swipe right - previous (with circular navigation)
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : models.length - 1;
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setActiveModel(models[prevIndex].id);
                      setIsTransitioning(false);
                    }, 200);
                  }
                }
              }}
            >
              <div className="bg-gray-900 text-white rounded-t-2xl p-8 lg:p-12 relative overflow-hidden scrollable-content">
                {/* Moving transition element */}
                <div className={`card-moving-element ${isTransitioning ? 'active' : ''}`}></div>
                
                <h3 className="text-2xl lg:text-3xl font-semibold mb-6 card-content-transition font-space-mono">{currentModel.title}</h3>
                <p className="text-gray-300 mb-8 text-lg lg:text-xl leading-relaxed card-content-transition">
                  {currentModel.description}
                </p>
                <button 
                  onClick={() => {
                    setSelectedService(currentModel.id);
                    setServiceDetailModalOpen(true);
                  }}
                  className="flex items-center text-white hover:text-gray-300 transition-all duration-300 group text-lg minimal-button"
                >
                  Learn more 
                  <ChevronRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              
              {/* Gradient Background */}
              <div 
                key={currentModel.id}
                className={`h-48 lg:h-64 bg-gradient-to-br ${currentModel.gradient} rounded-b-2xl relative overflow-hidden transition-all duration-1000 ease-out`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20 card-content-transition"></div>
                
                {/* Moving transition element */}
                <div className={`card-moving-element ${isTransitioning ? 'active' : ''}`}></div>
                
                {/* Abstract Shapes */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-xl shape-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/30 rounded-full blur-lg shape-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/25 rounded-full blur-md shape-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                
                {/* Interactive Demo Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white rounded-xl p-6 shadow-lg card-content-transition">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-base font-semibold text-gray-700">{currentModel.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentModel.id === 'fullstack' && 'React + Node.js + Cloud Infrastructure'}
                    {currentModel.id === 'automation' && 'n8n + LangGraph + AI Integration'}
                    {currentModel.id === 'lectures' && 'Official n8n Certification Program'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-4">
              {models.map((model, index) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setActiveModel(model.id);
                      setIsTransitioning(false);
                    }, 200);
                  }}
                  className={`nav-dot ${
                    activeModel === model.id ? 'active' : ''
                  }`}
                  aria-label={`View ${model.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Interactive Bottleneck Analysis - Hidden for now */}
      <section className="py-16 bg-white hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 font-space-mono">
              See How We Identify and Solve Bottlenecks
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our process visualization shows how we pinpoint workflow inefficiencies and transform them into optimized, automated solutions.
            </p>
          </div>
          <HeroCardPinpoint highlight="middle" />
        </div>
      </section>
      
      {/* Features Section */}
      <section id="solutions" className="py-16 px-4 sm:px-6 lg:px-8" ref={solutionsRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 font-space-mono">Why Choose 82Labs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our approach combines technical excellence with proven methodologies to deliver exceptional results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Scalable */}
            <div className="text-center stagger-item fade-in-left">
              <div className="w-12 h-12 mx-auto mb-4 transition-all hover:scale-110 hover:rotate-12 duration-500 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-black transition-colors">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors hover:text-gray-700 duration-300">Enterprise-Ready</h3>
              <p className="text-gray-600 transition-all duration-300 hover:text-gray-800">
                From rapid prototypes to production-scale applications. We build robust, maintainable solutions 
                that grow with your business using modern cloud-native architectures.
              </p>
            </div>

            {/* Accurate */}
            <div className="text-center stagger-item scale-in">
              <div className="w-12 h-12 mx-auto mb-4 transition-all hover:scale-110 hover:-rotate-6 duration-500 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-black transition-colors">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors hover:text-gray-700 duration-300">Automation Experts</h3>
              <p className="text-gray-600 transition-all duration-300 hover:text-gray-800">
                Specialized in n8n and LangGraph workflows. We create intelligent automation systems that 
                reduce manual work and integrate seamlessly with your existing business processes.
              </p>
            </div>

            {/* Secure */}
            <div className="text-center stagger-item fade-in-right">
              <div className="w-12 h-12 mx-auto mb-4 transition-all hover:scale-110 hover:rotate-6 duration-500 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-black transition-colors">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors hover:text-gray-700 duration-300">Training & Support</h3>
              <p className="text-gray-600 transition-all duration-300 hover:text-gray-800">
                Official n8n lecturers providing comprehensive training programs. We don't just build solutions — 
                we empower your team with the knowledge to maintain and extend them.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Industries Section */}
      <section id="research" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50" ref={researchRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 font-space-mono">
              Industries We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From fintech to manufacturing, we deliver specialized solutions across complex industries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Fintech */}
            <div className="minimal-card bg-cover bg-center h-64 relative overflow-hidden group stagger-item" 
                 style={{backgroundImage: `url(${fintechImg})`}}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white transform group-hover:translate-y-1 transition-transform duration-300">
                <h3 className="text-2xl font-semibold mb-2">Fintech</h3>
                <p className="text-sm opacity-90">Complex financial applications and payment systems</p>
              </div>
            </div>

            {/* Manufacturing */}
            <div className="minimal-card bg-cover bg-center h-64 relative overflow-hidden group stagger-item" 
                 style={{backgroundImage: `url(${manufacturingImg})`}}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white transform group-hover:translate-y-1 transition-transform duration-300">
                <h3 className="text-2xl font-semibold mb-2">Manufacturing</h3>
                <p className="text-sm opacity-90">Process automation and industrial IoT solutions</p>
              </div>
            </div>

            {/* SaaS */}
            <div className="minimal-card bg-cover bg-center h-64 relative overflow-hidden group stagger-item" 
                 style={{backgroundImage: `url(${saasImg})`}}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white transform group-hover:translate-y-1 transition-transform duration-300">
                <h3 className="text-2xl font-semibold mb-2">SaaS</h3>
                <p className="text-sm opacity-90">Scalable software platforms and enterprise tools</p>
              </div>
            </div>

            {/* Digital Health */}
            <div className="minimal-card bg-cover bg-center h-64 relative overflow-hidden group stagger-item" 
                 style={{backgroundImage: `url(${digitalHealthImg})`}}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white transform group-hover:translate-y-1 transition-transform duration-300">
                <h3 className="text-2xl font-semibold mb-2">Digital Health</h3>
                <p className="text-sm opacity-90">Healthcare technology and patient data solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Company Section */}
      <section id="company" className="py-16 px-4 sm:px-6 lg:px-8" ref={companyRef}>
        <div className="max-w-4xl mx-auto text-center reveal">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 font-space-mono">
            Ready to transform your business with intelligent automation and expert development?
          </h2>
        </div>
      </section>
      
      {/* Footer with Privacy Policy */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-gray-600 hover:text-gray-900 text-sm underline transition-colors duration-200"
            data-testid="link-privacy-policy"
          >
            מדיניות פרטיות | Privacy Policy
          </button>
        </div>
      </footer>
      
      {/* Contact Modal */}
      <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)}>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Request a Demo</h2>
          <p className="text-gray-600">Tell us about your project and we'll get back to you within 24 hours</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900" 
                      placeholder="Your name"
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900" 
                      placeholder="your@email.com"
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brief"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">Project Brief (140 chars max)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900 resize-none" 
                      placeholder="Tell us about your project..."
                      rows={4}
                      maxLength={140}
                      data-testid="textarea-brief"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500">{field.value?.length || 0}/140 characters</p>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={contactMutation.isPending}
              className="minimal-button minimal-button-primary w-full"
              data-testid="button-submit-contact"
            >
              {contactMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Form>
      </Modal>
      {/* Service Detail Modal */}
      <Modal isOpen={serviceDetailModalOpen} onClose={() => setServiceDetailModalOpen(false)}>
        <div className="mb-6">
          {selectedService === 'fullstack' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Fullstack Development</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  End-to-end web and mobile applications using cutting-edge technologies. 
                  We specialize in React, Node.js, Python, and modern cloud infrastructure.
                </p>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What's Included:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Frontend development with React/Next.js</li>
                    <li>Backend API development with Node.js/Python</li>
                    <li>Database design and implementation</li>
                    <li>Cloud infrastructure and deployment</li>
                    <li>Mobile app development (React Native)</li>
                    <li>Testing and quality assurance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Perfect for:</h3>
                  <p>Startups, SaaS products, enterprise applications, and complex web platforms requiring scalable, maintainable code.</p>
                </div>
              </div>
            </>
          )}
          
          {selectedService === 'automation' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intelligent Automation</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Complex workflow automation using n8n and LangGraph. AI-powered processes 
                  that integrate with your existing tools and systems.
                </p>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What's Included:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Custom n8n workflow development</li>
                    <li>AI integration with LangGraph</li>
                    <li>API integrations and data synchronization</li>
                    <li>Process optimization and monitoring</li>
                    <li>Custom automation solutions</li>
                    <li>Ongoing support and maintenance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Perfect for:</h3>
                  <p>Businesses looking to streamline operations, reduce manual work, and implement intelligent decision-making processes.</p>
                </div>
              </div>
            </>
          )}
          
          {selectedService === 'lectures' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">n8n Training & Consulting</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Official n8n lecturing and training programs. We don't just build solutions — 
                  we empower your team with the knowledge to maintain and extend them.
                </p>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What's Included:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Official n8n certification training</li>
                    <li>Hands-on workshops and tutorials</li>
                    <li>Custom training programs for teams</li>
                    <li>Best practices consultation</li>
                    <li>Architecture reviews and optimization</li>
                    <li>Ongoing mentorship and support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Perfect for:</h3>
                  <p>Teams wanting to master automation, companies implementing n8n, and organizations seeking to build internal automation expertise.</p>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t pt-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ready to get started with this service?</p>
            <Button
              onClick={() => {
                setServiceDetailModalOpen(false);
                setIsContactModalOpen(true);
              }}
              className="minimal-button minimal-button-primary"
              data-testid="button-contact-from-service"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Privacy Policy Modal */}
      <Modal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)}>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">מדיניות פרטיות | Privacy Policy</h2>
          <p className="text-gray-600">82Labs - הגנת פרטיות</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto prose prose-sm text-gray-700" dir="rtl">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">הגנת פרטיות - 82Labs</h3>
              <p><strong>עודכן לאחרונה:</strong> אוגוסט 2025</p>
              <p><strong>בהתאם לתיקון 13 לחוק הגנת הפרטיות, התשמ"א-1981</strong></p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">מידע כללי</h4>
              <p>אנו ב-82Labs מתחייבים לשמור על פרטיותכם ולהגן על המידע האישי שלכם בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותיקון 13 שנכנס לתוקף באוגוסט 2025.</p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">איסוף מידע באתר</h4>
              <p><strong>מידע שאנו אוספים:</strong></p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה</li>
                <li><strong>נתוני שימוש:</strong> דפים שנצפו, זמן ביקור, מקור הגישה לאתר</li>
                <li><strong>עוגיות טכניות</strong> להבטחת תפקוד תקין של האתר</li>
                <li><strong>מידע אישי דרך טופס יצירת קשר:</strong> כאשר אתם בוחרים למלא את טופס "Request a Demo", אנו אוספים:
                  <ul className="list-disc list-inside mr-4 mt-1">
                    <li>שם מלא</li>
                    <li>כתובת דוא"ל</li>
                    <li>פרטי הפרויקט שאתם מעוניינים בו</li>
                  </ul>
                </li>
              </ul>
              
              <p><strong>חשוב לדעת:</strong></p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>מילוי הטופס הוא וולונטרי לחלוטין</li>
                <li>המידע נאסף רק כאשר אתם בוחרים למסור אותו בפעולה מודעת</li>
                <li>ללא מילוי הטופס, ניתן לגלוש באתר בחופשיות</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">מטרת השימוש במידע</h4>
              <p>המידע נאסף אך ורק למטרות הבאות:</p>
              <p><strong>מידע טכני ונתוני שימוש:</strong></p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>הבטחת תפקוד תקין של האתר</li>
                <li>שיפור חוויית המשתמש</li>
                <li>ניתוח סטטיסטי כללי של השימוש באתר</li>
                <li>אבטחת האתר מפני גישה לא מורשית</li>
              </ul>
              
              <p><strong>מידע מטופס יצירת קשר:</strong></p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>יצירת קשר עמכם בנוגע לבקשתכם</li>
                <li>מתן מידע על שירותי החברה</li>
                <li>תיאום פגישות והדגמות</li>
                <li>מעקב אחר הבקשה עד להשלמתה</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">העברת מידע לצדדים שלישיים</h4>
              <p>איננו מעבירים מידע אישי לצדדים שלישיים, למעט במקרים הבאים:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>כאשר נדרש על פי חוק או צו שיפוטי</li>
                <li>לשם הגנה על זכויותינו המשפטיות</li>
                <li>במקרה חירום לשם הגנת בטיחות הציבור</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">שימוש בעוגיות (Cookies)</h4>
              <p>האתר משתמש בעוגיות טכניות לצורך תפעול תקין, ובכלל זה לאיסוף נתונים סטטיסטיים על השימוש באתר ולאבטחת מידע. ניתן לחסום עוגיות דרך הגדרות הדפדפן, אך הדבר עלול להשפיע על תפקוד האתר.</p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">זכויותיכם</h4>
              <p>בהתאם לחוק הגנת הפרטיות, זכאים אתם:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>לעיין במידע הקיים עליכם במאגרי המידע שלנו</li>
                <li>לדרוש תיקון מידע שגוי או לא מדויק</li>
                <li>לדרוש מחיקת מידע במקרים המתאימים על פי חוק</li>
                <li>לקבל מידע על אופן השימוש במידע שלכם</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">פרטי התקשרות</h4>
              <p>לכל שאלה או בקשה בנוגע למדיניות פרטיות זו, ניתן לפנות אלינו:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li><strong>דוא"ל:</strong> info@82labs.io</li>
                <li><strong>כתובת:</strong> WeWork Haifa</li>
              </ul>
            </div>

            <div>
              <p><strong>אתר:</strong> www.82labs.io</p>
              <p><strong>חברה:</strong> 82Labs</p>
              <p><strong>תאריך עדכון אחרון:</strong> אוגוסט 2025</p>
            </div>
          </div>
        </div>
      </Modal>
      
      <SpeedInsights />
    </div>
  );
}