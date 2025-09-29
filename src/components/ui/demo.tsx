"use client"

import { useState, FormEvent, useMemo } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

export function ExpandableChatDemo() {
  // Q&A dataset
  const SECTIONS = useMemo(() => ([
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
        { q: "How can I contact customer support?", a: "You can reach us through live chat, WhatsApp (+91 9000630794), email (utsavika.store@gmail.com), or Instagram (@utsavika_store). We're always here to help 💬." },
        { q: "Do you have a WhatsApp number?", a: "Yes! You can directly chat with us on WhatsApp (+91 9000630794) for quick support and order updates." },
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
  ]), []);

  function normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function findAnswer(input: string): { answer: string; suggestions: string[] } {
    const qn = normalize(input);
    let best: { score: number; qa?: { q: string; a: string } } = { score: 0 };
    SECTIONS.forEach((sec) =>
      sec.items.forEach((qa) => {
        const nQ = normalize(qa.q);
        let score = 0;
        if (nQ.includes(qn) || qn.includes(nQ)) score += 3;
        const qTokens = new Set(nQ.split(" "));
        const inTokens = new Set(qn.split(" "));
        let overlap = 0;
        inTokens.forEach((t) => { if (qTokens.has(t)) overlap += 1; });
        score += overlap;
        if (score > best.score) best = { score, qa };
      })
    );
    if (best.qa && best.score >= 2) return { answer: best.qa.a, suggestions: [] };
    const allQ = SECTIONS.flatMap((s) => s.items.map((i) => i.q));
    const suggestions = allQ
      .map((q) => ({ q, n: normalize(q) }))
      .map(({ q, n }) => ({ q, score: qn ? (n.includes(qn) || qn.includes(n) ? 2 : 0) + n.split(" ").filter((t) => qn.includes(t)).length : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.q);
    return { answer: "I couldn’t find an exact answer. Try one of these:", suggestions };
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! How can I help you today?",
      sender: "ai",
    },
    {
      id: 2,
      content: "I have a question about the component library.",
      sender: "user",
    },
    {
      id: 3,
      content: "Sure! I'd be happy to help. What would you like to know?",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)
    const { answer, suggestions } = findAnswer(input)
    const reply = suggestions.length > 0 ? `${answer}\n\n• ${suggestions.join("\n• ")}` : answer
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: reply, sender: "ai" },
      ])
      setIsLoading(false)
    }, 300)
  }

  const handleAttachFile = () => {}
  const handleMicrophoneClick = () => {}

  return (
    <div className="h-[600px] relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={<Bot className="h-6 w-6" />}
      >
        <ExpandableChatHeader className="flex-col text-center justify-center">
          <h1 className="text-xl font-semibold">Chat with Utsavika ✨</h1>
          <p className="text-sm text-muted-foreground">
            Ask me anything about the components
          </p>
        </ExpandableChatHeader>

        <ExpandableChatBody>
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            {SECTIONS.flatMap((s) => s.items.map((i) => i.q)).slice(0, 8).map((q) => (
              <Button key={q} size="sm" variant="secondary" onClick={() => setInput(q)}>
                {q}
              </Button>
            ))}
          </div>
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.sender === "user"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                  }
                  fallback={message.sender === "user" ? "US" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleAttachFile}
                >
                  <Paperclip className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleMicrophoneClick}
                >
                  <Mic className="size-4" />
                </Button>
              </div>
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  )
}


