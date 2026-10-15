import { useEffect, useState } from "react";
import { MousePointer2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const slides = [
  {
    title: "Streamline Your Workflow",
    description:
      "Manage your leads, deals, and customers in one unified platform designed for speed.",
    icon: <Zap className="size-12 text-primary" />,
    color: "bg-primary/10",
  },
  {
    title: "Secure & Reliable",
    description:
      "Your data is protected with enterprise-grade security and automated backups.",
    icon: <ShieldCheck className="size-12 text-primary" />,
    color: "bg-primary/10",
  },
  {
    title: "Data-Driven Insights",
    description:
      "Make better decisions with real-time analytics and customizable reporting dashboards.",
    icon: <CheckCircle2 className="size-12 text-primary" />,
    color: "bg-primary/10",
  },
];

export default function OnboardingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full bg-primary overflow-hidden flex flex-col items-center justify-center p-12 text-primary-content">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-xl">
            <MousePointer2 className="size-7 rotate-12" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-white">
            CRMgreenmouse
          </span>
        </div>

        <div className="min-h-[300px] flex flex-col justify-center transition-all duration-700">
          <div className="mb-8 p-4 w-fit rounded-3xl bg-white/10 backdrop-blur-md">
            {slides[currentSlide].icon}
          </div>
          <h2 className="text-4xl font-semibold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            {slides[currentSlide].title}
          </h2>
          <p className="text-xl opacity-80 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-1000">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Indicators */}
        <div className="flex gap-3 mt-12">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "w-12 bg-white" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-50 text-xs font-medium uppercase tracking-[0.2em]">
        <span>© 2026 CRMgreenmouse</span>
        <span>Premium Business Suite</span>
      </div>
    </div>
  );
}
