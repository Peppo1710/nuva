"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Bell,
  Camera,
  Flame,
  MessageCircle,
  ClipboardList,
  Phone,
  Shield,
  Check,
  ChevronRight,
  Heart,
  Eye,
  Navigation,
  Sparkles,
  Moon,
  Apple,
  Play,
  Menu,
  X,
} from "lucide-react"

function PhoneMockup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`}>
      <div className="relative rounded-[3rem] border-8 border-[#1A2744] bg-[#1A2744] p-2 shadow-2xl">
        <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#1A2744]" />
        <div className="relative overflow-hidden rounded-[2.25rem] bg-background">
          {children}
        </div>
      </div>
    </div>
  )
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D9E75]">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1A2744]">Nuva</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1D9E75]">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1D9E75]">How It Works</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1D9E75]">FAQ</a>
          {/* <a href={process.env.NEXT_PUBLIC_APP_STORE_URL || "#"} className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1D9E75]">App Store</a>
          <a href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#"} className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1D9E75]">Google Play</a> */}
        </nav>
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#features" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            {/* <a href={process.env.NEXT_PUBLIC_APP_STORE_URL || "#"} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>App Store</a>
            <a href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#"} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Google Play</a> */}
          </nav>
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-16 md:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#1D9E75]/10 blur-3xl" />
      <div className="absolute -right-20 top-40 h-96 w-96 rounded-full bg-[#534AB7]/10 blur-3xl" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1D9E75]/10 px-4 py-2 text-sm font-medium text-[#1D9E75]">
              <Sparkles className="h-4 w-4" />
              AI-Powered Health Companion
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-[#1A2744] md:text-5xl lg:text-6xl">
              Never Miss a Medication Again
            </h1>
            <p className="mb-8 max-w-xl text-pretty text-lg text-muted-foreground md:text-xl">
              Nuva is your AI-powered health companion — built for simplicity, designed with care. Manage medications, scan prescriptions, and get personalized health guidance, all in one app.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <button className="bg-[#1D9E75] text-white px-4 py-2 rounded-md">
            <a href="https://github.com/Peppo1710/nuva/releases/download/kv-3/Nuva-apk.apk" className="inline-flex items-center text-white gap-2 text-lg font-medium text-[#1D9E75] hover:underline">

                      Download Your App Now
            </a>

            </button>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup className="w-[280px] md:w-[320px]">
              <div className="h-[560px] bg-gradient-to-b from-[#F8FAFB] to-white p-6 md:h-[640px]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Good Morning</p>
                    <p className="text-xl font-semibold text-[#1A2744]">Kshipra</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/10">
                    <Bell className="h-5 w-5 text-[#1D9E75]" />
                  </div>
                </div>
                
                <Card className="mb-4 border-none bg-gradient-to-r from-[#1D9E75] to-[#1D9E75]/80 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                        <Flame className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Current Streak</p>
                        <p className="text-2xl font-bold text-white">14 Days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mb-4">
                  <p className="mb-3 text-sm font-medium text-[#1A2744]">{"Today's Medications"}</p>
                  <div className="space-y-3">
                    {[
                      { name: "Lisinopril", dose: "10mg", time: "8:00 AM", taken: true },
                      { name: "Metformin", dose: "500mg", time: "12:00 PM", taken: false },
                      { name: "Atorvastatin", dose: "20mg", time: "9:00 PM", taken: false },
                    ].map((med, i) => (
                      <Card key={i} className="border border-border/50 shadow-sm">
                        <CardContent className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${med.taken ? 'bg-[#1D9E75]/10' : 'bg-[#534AB7]/10'}`}>
                              {med.taken ? <Check className="h-5 w-5 text-[#1D9E75]" /> : <Heart className="h-5 w-5 text-[#534AB7]" />}
                            </div>
                            <div>
                              <p className="font-medium text-[#1A2744]">{med.name}</p>
                              <p className="text-xs text-muted-foreground">{med.dose} • {med.time}</p>
                            </div>
                          </div>
                          {med.taken && <span className="text-xs font-medium text-[#1D9E75]">Taken</span>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full gap-2 bg-[#534AB7] text-white hover:bg-[#534AB7]/90">
                  <Camera className="h-4 w-4" />
                  Scan Prescription
                </Button>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  const problems = [
    {
      icon: Bell,
      title: "Forgetting Doses",
      description: "Missed medications lead to health complications, especially for those managing multiple prescriptions."
    },
    {
      icon: Eye,
      title: "Confusing Prescriptions",
      description: "Tiny print, complex drug names, and unclear instructions make prescriptions hard to understand."
    },
    {
      icon: MessageCircle,
      title: "No Personalized Guidance",
      description: "Generic health apps don't consider your specific conditions, allergies, or medication interactions."
    }
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-[#1A2744] md:text-4xl">
            Managing Medications {"Shouldn't"} Be This Hard
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {problems.map((problem, i) => (
            <Card key={i} className="border-none bg-card shadow-lg shadow-black/5">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#534AB7]/10">
                  <problem.icon className="h-7 w-7 text-[#534AB7]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1A2744]">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Bell,
      title: "Smart Medication Reminders",
      description: "Set daily, weekly, or custom interval reminders. Mark doses as taken or skipped. Never miss a dose."
    },
    {
      icon: Camera,
      title: "AI Prescription Scanner",
      description: "Snap a photo of your prescription. Nuva's AI instantly extracts drug names, dosages, frequency, and instructions — in plain language."
    },
    
    {
      icon: MessageCircle,
      title: "AI Health Chat",
      description: "Ask health questions and get context-aware answers. Nuva considers your conditions, allergies, and current medications."
    },
    {
      icon: ClipboardList,
      title: "Complete Medical Profile",
      description: "Store conditions, allergies, surgeries, current medications, and doctor info — all in one secure place."
    },
    {
      icon: Phone,
      title: "Emergency Contact",
      description: "Keep your emergency contact information readily accessible when it matters most."
    }
  ]

  return (
    <section id="features" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-[#1A2744] md:text-4xl">
            Everything You Need, Nothing You {"Don't"}
          </h2>
          <p className="text-lg text-muted-foreground">
            Designed for simplicity. Powered by AI.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card key={i} className="group border-none bg-card shadow-lg shadow-black/5 transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D9E75]/10 transition-colors group-hover:bg-[#1D9E75]/20">
                  <feature.icon className="h-7 w-7 text-[#1D9E75]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1A2744]">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Enter your phone number and verify with a one-time code. No passwords to remember."
    },
    {
      number: "2",
      title: "Set Up Your Profile",
      description: "Tell us your name, age, and health goal — whether it's managing medicines, understanding prescriptions, or both."
    },
    {
      number: "3",
      title: "Start Your Health Journey",
      description: "Add medications, scan prescriptions, set reminders, and chat with your AI companion."
    }
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-[#1A2744] md:text-4xl">
            Up and Running in 3 Minutes
          </h2>
        </div>
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-2/3 -translate-x-1/2 bg-gradient-to-r from-[#1D9E75]/20 via-[#1D9E75] to-[#1D9E75]/20 md:block" />
          
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9E75] text-2xl font-bold text-white shadow-lg shadow-[#1D9E75]/30">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1A2744]">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AIShowcaseSection() {
  return (
    <section className="bg-gradient-to-br from-[#1A2744] to-[#1A2744]/90 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 flex justify-center lg:order-1">
            <PhoneMockup className="w-[260px] md:w-[280px]">
              <div className="h-[520px] bg-[#F8FAFB] p-4 md:h-[560px]">
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A2744]">Nuva AI</p>
                    <p className="text-xs text-muted-foreground">Your Health Companion</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-[#1D9E75] p-3 text-sm text-white">
                      Can I take ibuprofen with my current medications?
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted p-3 text-sm text-[#1A2744]">
                      Based on your profile, I see {"you're"} taking Lisinopril for blood pressure. While occasional ibuprofen is generally okay, regular use may reduce the effectiveness of your blood pressure medication. {"I'd"} recommend using acetaminophen as an alternative. Always consult your doctor for specific advice.
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-[#1D9E75] p-3 text-sm text-white">
                      What about acetaminophen dosage?
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted p-3 text-sm text-[#1A2744]">
                      For adults, the typical dose is 325-650mg every 4-6 hours, not exceeding 3,000mg per day. Given your medical history, this should be safe, but {"let's"} keep track of it in your medication log.
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-white p-2 pl-4">
                    <input 
                      type="text" 
                      placeholder="Ask me anything..." 
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      readOnly
                    />
                    <Button size="sm" className="h-8 w-8 rounded-full bg-[#1D9E75] p-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl">
              AI That Actually Understands You
            </h2>
            <div className="space-y-4 text-lg text-white/80">
              <p>
                {"Nuva's"} AI is powered by advanced language models that speak in simple, clear language — no medical jargon.
              </p>
              <p>
                It remembers your medical profile, so every answer is tailored to you.
              </p>
              <p>
                Upload a prescription photo and get a clear breakdown of what each medicine does, how to take it, and what to watch out for.
              </p>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm text-white/90">
              <Shield className="h-4 w-4" />
              Nuva does not diagnose conditions. Always consult your doctor for medical decisions.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AccessibilitySection() {
  const features = [
    {
      icon: Eye,
      title: "Large, Readable Text",
      description: "No squinting. Every screen is designed for comfort."
    },
    {
      icon: Navigation,
      title: "Simple Navigation",
      description: "Five tabs. Zero confusion. Everything is one tap away."
    },
    {
      icon: Sparkles,
      title: "Warm AI Personality",
      description: "Patient, encouraging, and never overwhelming. Like talking to a caring friend."
    },
    {
      icon: Moon,
      title: "Dark Mode",
      description: "Easy on the eyes, day or night."
    }
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-[#1A2744] md:text-4xl">
            Built With Care, For Those Who Matter Most
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card key={i} className="border-none bg-gradient-to-br from-card to-muted/30 shadow-lg shadow-black/5">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#534AB7]/10">
                  <feature.icon className="h-7 w-7 text-[#534AB7]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#1A2744]">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-[#1A2744] md:text-4xl">
            Free to Use. No Hidden Costs.
          </h2>
          <Card className="mt-8 border-2 border-[#1D9E75] bg-card shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1D9E75]/10 px-4 py-2 text-sm font-medium text-[#1D9E75]">
                <Heart className="h-4 w-4" />
                100% Free Forever
              </div>
              <p className="mb-4 text-lg text-[#1A2744]">
                Nuva is completely free. No subscriptions, no premium tiers, no ads.
              </p>
              <p className="mb-8 text-muted-foreground">
                Your health data is yours. We never sell it.
              </p>
              <Button size="lg" className="w-full bg-[#1D9E75] text-lg text-white hover:bg-[#1D9E75]/90 sm:w-auto">
                Get Started for Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    {
      question: "Is Nuva really free?",
      answer: "Yes, fully free with no hidden costs. We believe everyone deserves access to quality health management tools."
    },
    {
      question: "Is my health data secure?",
      answer: "Yes, stored securely with Supabase, encrypted, and never sold. Your privacy is our top priority."
    },
    {
      question: "Can Nuva replace my doctor?",
      answer: "No. Nuva provides guidance but always recommends consulting healthcare professionals for medical decisions."
    },
    {
      question: "What can the AI prescription scanner read?",
      answer: "Photos of prescriptions, medication labels, and doctor's notes. Our AI extracts the key information and presents it in plain language."
    },
    {
      question: "Does Nuva work offline?",
      answer: "Reminders work offline. AI features require an internet connection to provide accurate, personalized responses."
    },
    {
      question: "Who is Nuva designed for?",
      answer: "Anyone managing medications, but especially older adults and their caregivers who want a simple, reliable health companion."
    }
  ]

  return (
    <section id="faq" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-[#1A2744] md:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                <AccordionTrigger className="py-4 text-left text-lg font-medium text-[#1A2744] hover:text-[#1D9E75] hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="bg-gradient-to-br from-[#1A2744] via-[#1A2744] to-[#1D9E75]/30 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Take Control of Your Health Today
          </h2>
          <p className="mb-4 text-lg text-white/80">
            Join thousands of families who trust Nuva for medication management.
          </p>
          <p className="text-white/80 text-2xl font-serif">Made by Kshipra Vitalkar</p>
        </div>
      </div>
    </section>
  )
}

// function Footer() {
//   return (
//     <footer className="border-t border-border bg-[#1A2744] py-12">
//       <div className="container mx-auto px-4 md:px-6">
//         <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
//           <div className="flex items-center gap-2">
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D9E75]">
//               <Heart className="h-5 w-5 text-white" />
//             </div>
//             <span className="text-xl font-bold text-white">Nuva</span>
//           </div>
          
//           <nav className="flex flex-wrap justify-center gap-6">
//             <a href="#" className="text-sm text-white/70 transition-colors hover:text-white">Privacy Policy</a>
//             <a href="#" className="text-sm text-white/70 transition-colors hover:text-white">Terms of Service</a>
//             <a href="#" className="text-sm text-white/70 transition-colors hover:text-white">Contact Us</a>
//             <a href="#" className="text-sm text-white/70 transition-colors hover:text-white">Support</a>
//           </nav>
//         </div>
        
//         <div className="mt-8 border-t border-white/10 pt-8 text-center">
//           <p className="text-sm text-white/60">
//             © 2026 Nuva. Made with care for healthier lives.
//           </p>
//           <p className="mt-2 text-xs text-white/40">
//             Nuva is not a medical device and does not provide medical diagnoses. Always consult a qualified healthcare professional.
//           </p>
//         </div>
//       </div>
//     </footer>
//   )
// }

export default function NuvaLandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AIShowcaseSection />
        <AccessibilitySection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      {/* <Footer /> */}
    </div>
  )
}
