import Script from "next/script";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqJsonLd } from "@/lib/seo";

interface Faq {
  question: string;
  answer: string;
}

export function FaqSection({ faqs, id = "faq" }: { faqs: Faq[]; id?: string }) {
  return (
    <section className="container py-8 pb-20" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl"
          >
            Frequently asked questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-8 space-y-3" id={id}>
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border bg-card px-5"
            >
              <AccordionTrigger className="text-base hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Script
        id={`ld-faq-${id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
    </section>
  );
}
