import React, { useMemo, useRef, useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type QA = { q: string; a: string };

type Section = {
  title: string;
  items: QA[];
};

const SECTIONS: Section[] = [
  {
    title: "Product & Shopping",
    items: [
      { q: "What products do you sell?", a: "We offer handcrafted candles, customized gift hampers, and premium chocolates. Perfect for all occasions!" },
      { q: "Do you have hand-crafted candles?", a: "Yes! All our candles are handmade with love and care. You can choose from different designs, scents, and sizes." },
      { q: "Can I customize a gift hamper?", a: "Absolutely! You can mix and match candles, chocolates, and other items to create your own hamper." },
      { q: "Do you sell chocolates separately?", a: "Yes, we do! Our chocolates are available as single packs or as part of hampers." },
      { q: "Do you have eco-friendly packaging?", a: "Yes, we care for nature. Most of our packaging is eco-friendly and reusable." },
      { q: "Do you have seasonal or festival hampers?", a: "Yes! We create special hampers for festivals like Diwali, Christmas, Rakhi, and more." },
    ],
  },
  {
    title: "Orders & Delivery",
    items: [
      { q: "How do I place an order?", a: "Simply browse our website, add items to your cart, and checkout. Our chatbot can also guide you step by step." },
      { q: "Can I order without signing up?", a: "Yes, you can order as a guest. But signing up helps you track your orders easily." },
      { q: "What is the delivery time?", a: "Usually 3–5 days, depending on your location. Same-day or next-day delivery may be available in select cities." },
      { q: "Do you provide same-day delivery?", a: "In some areas, yes. Please enter your pincode at checkout to check availability." },
      { q: "Can I schedule a delivery for a specific date?", a: "Yes! You can choose a delivery date at checkout. Perfect for birthdays and surprises." },
      { q: "How can I track my order?", a: "Once shipped, we’ll share a tracking link on your email/WhatsApp. You can also check in the ‘My Orders’ section." },
    ],
  },
  {
    title: "Payment & Pricing",
    items: [
      { q: "What payment methods do you accept?", a: "Right now, we only accept Cash on Delivery (COD)." },
      { q: "Can I pay cash on delivery?", a: "Yes, all our orders are COD only. You can pay when the product is delivered." },
      { q: "Do you offer discounts or promo codes?", a: "Currently, we don’t have promo codes, but we do provide special festive offers and bundle deals. Keep checking our website for updates." },
      { q: "Do you have bulk order pricing?", a: "Yes! For weddings, festivals, or corporate gifting, we provide special bulk prices. Please contact us for details." },
    ],
  },
  {
    title: "Customization & Personalization",
    items: [
      { q: "Can I add a personal message with my gift?", a: "Of course! You can add a note during checkout, and we’ll include it with your gift." },
      { q: "Do you customize candles with names or designs?", a: "Yes, we can personalize candles with names, initials, or patterns. Great for return gifts!" },
      { q: "Can I create my own hamper?", a: "Yes, you can hand-pick your favorite items to design a hamper your way." },
      { q: "Do you offer corporate gifting?", a: "Yes, we provide bulk orders for companies, with customized branding and packaging." },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      { q: "What is your return policy?", a: "Returns are accepted if the product is damaged or defective. Please report within 48 hours of delivery." },
      { q: "How do I request a refund?", a: "Contact our support team with your order ID. Refunds will be processed within 5–7 working days." },
      { q: "Can I exchange a product?", a: "Yes, exchanges are possible for certain products. Reach out to our support team for help." },
    ],
  },
  {
    title: "Support & Help",
    items: [
      { q: "How can I contact customer support?", a: "You can reach us through live chat, WhatsApp, or email. We’re always here to help." },
      { q: "Do you have a WhatsApp number?", a: "Yes! You can directly chat with us on WhatsApp for quick support and order updates." },
      { q: "Can I talk to a human agent?", a: "Yes, if our bot can’t solve your issue, we’ll connect you to a real person." },
    ],
  },
  {
    title: "Multilanguage & Accessibility",
    items: [
      { q: "Can I change the language?", a: "Yes! Our chatbot supports multiple languages. Just select your preferred one from the menu." },
      { q: "Do you provide customer support in Hindi/Telugu/etc.?", a: "Yes, our team can assist you in English, Hindi, Telugu, and more." },
    ],
  },
];

type Message = { role: "user" | "bot"; text: string };

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function findAnswer(input: string): { answer: string; suggestions: string[] } {
  const qn = normalize(input);
  let best: { score: number; qa?: QA } = { score: 0 };

  SECTIONS.forEach((sec) => {
    sec.items.forEach((qa) => {
      const nQ = normalize(qa.q);
      // simple scoring: exact includes + token overlap
      let score = 0;
      if (nQ.includes(qn) || qn.includes(nQ)) score += 3;
      const qTokens = new Set(nQ.split(" "));
      const inTokens = new Set(qn.split(" "));
      let overlap = 0;
      inTokens.forEach((t) => {
        if (qTokens.has(t)) overlap += 1;
      });
      score += overlap;
      if (score > best.score) best = { score, qa };
    });
  });

  if (best.qa && best.score >= 2) {
    return { answer: best.qa.a, suggestions: [] };
  }

  // fallback: suggest 3 closest questions by substring match
  const allQ = SECTIONS.flatMap((s) => s.items.map((i) => i.q));
  const suggestions = allQ
    .map((q) => ({ q, n: normalize(q) }))
    .map(({ q, n }) => ({ q, score: qn ? (n.includes(qn) || qn.includes(n) ? 2 : 0) + n.split(" ").filter((t) => qn.includes(t)).length : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.q);

  return {
    answer: "I couldn’t find an exact answer. Try one of these:",
    suggestions,
  };
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I’m here to help. Ask me about products, delivery, payments, or returns." },
  ]);
  const viewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: content }]);
    const { answer, suggestions } = findAnswer(content);
    const reply = suggestions.length > 0 ? `${answer}\n\n• ${suggestions.join("\n• ")}` : answer;
    setMessages((m) => [...m, { role: "bot", text: reply }]);
  };

  const quickQuestions = useMemo(() => {
    return [
      "What products do you sell?",
      "Do you have hand-crafted candles?",
      "How do I place an order?",
      "What is the delivery time?",
      "What payment methods do you accept?",
    ];
  }, []);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0 w-[420px] max-w-[92vw] z-50">
          <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
            <SheetTitle className="text-left">Chat with us</SheetTitle>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>

          <div className="p-4 pt-3">
            <div className="flex gap-2 flex-wrap mb-3">
              {quickQuestions.map((q) => (
                <Button key={q} variant="secondary" size="sm" onClick={() => handleSend(q)}>
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-2">
            <ScrollArea className="h-[56vh] pr-4" viewportRef={viewRef}>
              <div className="space-y-3">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      } rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={() => handleSend()} disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Chatbot;


