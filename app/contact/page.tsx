"use client";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Clock,
  Globe
} from "lucide-react";
import { toast } from "sonner";

const XIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (form.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1";
      const response = await fetch(`${apiUrl}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(response.statusText || "Server returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to send message");
      }

      toast.success(data?.message || "Thank you! Your message has been sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col pb-24 lg:pb-0 bg-muted/30 pt-4 md:pt-10">
      {/* Simple Header Section */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold mb-4">
              <Mail className="w-3.5 h-3.5" />
              Get in Touch
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Contact Us
            </h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Have questions or need support? Our team is here to help you with anything related to 
              the <span className="text-secondary font-semibold">.</span>Soko marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Column: Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-background border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <Send className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Send a Message</h2>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={onChange}
                        placeholder="John Doe"
                        className={`w-full bg-muted/20 border ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20'} rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 transition-all font-medium`}
                      />
                      {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="john@example.com"
                        className={`w-full bg-muted/20 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20'} rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 transition-all font-medium`}
                      />
                      {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.email}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="How can we help?"
                    className={`w-full bg-muted/20 border ${errors.subject ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20'} rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 transition-all font-medium`}
                  />
                  {errors.subject && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={onChange}
                    placeholder="Describe your inquiry..."
                    className={`w-full bg-muted/20 border ${errors.message ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20'} rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 transition-all font-medium resize-none`}
                  />
                  {errors.message && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-fit px-10 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Column: Contact Info & Map */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-6 uppercase tracking-tight text-sm">Direct Contact</h3>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: "+254 700 000 000", href: "tel:+254700000000" },
                  { icon: Mail, label: "Email", value: "support@dotsoko.com", href: "mailto:support@dotsoko.com" },
                  { icon: Globe, label: "Web", value: "www.dotsoko.com", href: "https://dotsoko.com" }
                ].map((item, i) => (
                  <a 
                    key={i}
                    href={item.href}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">{item.label}</div>
                      <div className="text-sm font-bold text-foreground">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Location Card & Map */}
            <div className="bg-background border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
              <h3 className="font-bold text-foreground mb-4 uppercase tracking-tight text-sm">Visit Us</h3>
              <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  Innovation District, Nairobi, Kenya<br />
                  Central Business Complex, Hub 44
                </p>
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden border border-border grayscale hover:grayscale-0 transition-all duration-700">
                <iframe
                  title="HQ Map"
                  src="https://www.google.com/maps?q=Nairobi,+Kenya&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Related Directories */}
            <div className="bg-muted/50 rounded-2xl p-6">
              <h4 className="font-bold text-foreground text-sm mb-4">Connect with Us</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: XIcon, label: "X", href: "#" },
                  { icon: Facebook, label: "Facebook", href: "#" },
                  { icon: Linkedin, label: "LinkedIn", href: "#" }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href}
                    title={social.label}
                    className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group"
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Support Resources */}
            <div className="bg-muted/50 rounded-2xl p-6">
              <h4 className="font-bold text-foreground text-sm mb-4">Support Resources</h4>
              <nav className="space-y-3">
                {[
                  { name: 'Help Center', href: '/help' },
                  { name: 'Seller Support', href: '/account/seller/support' },
                  { name: 'Terms of Service', href: '/terms' },
                  { name: 'Privacy Policy', href: '/privacy' }
                ].map((item) => (
                  <a 
                    key={item.name}
                    href={item.href} 
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
