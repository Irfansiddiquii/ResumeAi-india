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

export function FaqSection({
  faqs,
  id = "faq",
}: {
  faqs: Faq[];
  id?: string;
}) {
  return (
    <section className="container py-16 md:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <h2
          id="faq-heading"
          className="text-center text-2xl font-bold tracking-tight md:text-3xl"
        >
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-8" id={id}>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
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
