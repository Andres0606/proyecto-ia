"use client";

import { useState } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Planes/planes.css";

// ── Iconos SVG ──────────────────────────────────────────────────────────────
const PlanIcons = {
  Seed: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10"/><path d="M10 20c0-3.5 1-6 2-10"/><path d="M12 10c1.5 0 3 1 3 3 0 1.5-1.5 3-3 3"/><path d="M12 10c-1.5 0-3 1-3 3 0 1.5 1.5 3 3 3"/><path d="M12 10V4"/>
    </svg>
  ),
  Zap: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Crown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
  ),
  Diamond: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Cross: ({ className }: { className?: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
};

// ... (PLANES and COMPARATIVA same as before)

// ── Datos de planes ──────────────────────────────────────────────────────────
const PLANES = [
  {
    id: "gratuito",
    name: "Gratuito",
    desc: "Comienza tu camino profesional con las herramientas básicas esenciales.",
    price: "0",
    period: "siempre gratis",
    note: "Perfil básico y acceso a vacantes en modo lectura.",
    icon: <PlanIcons.Seed />,
    iconClass: "plan-card__icon--free",
    popular: false,
    features: [
      { text: "Perfil Profesional y Hoja de Vida", included: true },
      { text: "Bolsa de Empleo UCC (Solo lectura)", included: true },
      { text: "Diagnóstico de estabilidad laboral con IA", included: false },
      { text: "Reporte PDF detallado de estabilidad", included: false },
      { text: "Postulación directa a vacantes", included: false },
    ],
    cta: "Registrarme gratis",
    ctaClass: "plan-card__cta--outline",
  },
  {
    id: "modelo",
    name: "Acceso al Modelo",
    desc: "Accede a nuestro modelo de diagnóstico de estabilidad laboral con IA y conoce tu nivel de empleabilidad.",
    price: "29.900",
    period: "pago único",
    note: "Sin cargos recurrentes — paga una vez, usa siempre.",
    icon: <PlanIcons.Zap />,
    iconClass: "plan-card__icon--basic",
    popular: false,
    features: [
      { text: "Perfil Profesional y Hoja de Vida", included: true },
      { text: "Bolsa de Empleo UCC (Solo lectura)", included: true },
      { text: "Diagnóstico de estabilidad laboral con IA", included: true },
      { text: "Reporte PDF detallado de estabilidad", included: true },
      { text: "Postulación directa a vacantes", included: false },
    ],
    cta: "Adquirir acceso",
    ctaClass: "plan-card__cta--outline",
  },
  {
    id: "completo",
    name: "Plan Completo",
    desc: "Todo el poder del modelo de IA más acceso completo a la bolsa de empleo, vacantes y red de empresas aliadas UCC.",
    price: "49.900",
    period: "/ mes",
    note: "Cancela cuando quieras. Sin permanencia.",
    icon: <PlanIcons.Crown />,
    iconClass: "plan-card__icon--pro",
    popular: true,
    features: [
      { text: "Perfil Profesional y Hoja de Vida", included: true },
      { text: "Bolsa de Empleo UCC (Acceso completo)", included: true },
      { text: "Diagnóstico de estabilidad laboral con IA", included: true },
      { text: "Reporte PDF detallado de estabilidad", included: true },
      { text: "Postulación directa a empresas aliadas", included: true },
    ],
    cta: "Suscribirme ahora",
    ctaClass: "plan-card__cta--red",
  },
];

const COMPARATIVA = [
  { feature: "Perfil Profesional y Hoja de Vida", gratuito: true, modelo: true, completo: true },
  { feature: "Bolsa de Empleo UCC (Lectura)", gratuito: true, modelo: true, completo: true },
  { feature: "Diagnóstico de estabilidad con IA", gratuito: false, modelo: true, completo: true },
  { feature: "Reporte PDF detallado", gratuito: false, modelo: true, completo: true },
  { feature: "Postulación directa a vacantes", gratuito: false, modelo: false, completo: true },
  { feature: "Tipo de cobro", gratuito: "Gratis", modelo: "Único", completo: "Mensual" },
];

const FAQS = [
  {
    q: "¿Soy egresado de la UCC, necesito pagar?",
    a: "¡No! Los egresados de la Universidad Cooperativa de Colombia tienen acceso gratuito a todas las funcionalidades del portal, incluyendo el modelo de diagnóstico y la bolsa de empleo. Simplemente regístrate con tu correo institucional.",
  },
  {
    q: "¿Qué incluye el pago único del modelo?",
    a: "Con el pago único obtienes acceso permanente al modelo de diagnóstico de estabilidad laboral con IA. Podrás conocer tu nivel de empleabilidad y estabilidad en el mercado laboral colombiano.",
  },
  {
    q: "¿Puedo cancelar la suscripción mensual en cualquier momento?",
    a: "Sí, puedes cancelar tu suscripción del Plan Completo cuando lo desees, sin penalizaciones ni cargos adicionales. Tu acceso se mantendrá activo hasta el final del período ya pagado.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias PSE y pagos en efectivo a través de puntos de recaudo autorizados como Efecty y Baloto.",
  },
  {
    q: "¿Puedo pasar del plan básico al completo?",
    a: "Por supuesto. Si ya adquiriste el acceso al modelo, puedes actualizar al Plan Completo en cualquier momento. Solo pagarás la diferencia correspondiente al primer mes de suscripción.",
  },
];

// ── Hero ──────────────────────────────────────────────────────────────────────
function PlanesHero() {
  return (
    <section className="planes-hero">
      <div className="planes-hero__bg-grid" />
      <div className="planes-hero__blob planes-hero__blob--1" />
      <div className="planes-hero__blob planes-hero__blob--2" />
      <div className="planes-hero__content">
        <span className="planes-hero__badge">
          <PlanIcons.Diamond />
          Para usuarios externos
        </span>
        <h1 className="planes-hero__title">
          Elige el plan que impulse
          <br />
          <span className="planes-hero__title-accent">tu carrera profesional</span>
        </h1>
        <p className="planes-hero__subtitle">
          Nuestros planes están diseñados para profesionales externos a la UCC
          que desean acceder a herramientas de diagnóstico laboral y la bolsa de
          empleo más grande de la comunidad universitaria.
        </p>
      </div>
    </section>
  );
}

// ── Pricing Cards ─────────────────────────────────────────────────────────────
function PricingCards() {
  return (
    <section className="planes-pricing" id="planes">
      <div className="planes-pricing__header">
        <span className="planes-pricing__tag">Planes y precios</span>
        <h2 className="planes-pricing__title">
          Dos opciones, un objetivo: tu crecimiento profesional
        </h2>
        <p className="planes-pricing__sub">
          Selecciona el plan que mejor se ajuste a tus necesidades. Si eres
          egresado UCC, todo es gratis.
        </p>
      </div>

      <div className="planes-pricing__grid">
        {PLANES.map((plan) => (
          <div
            className={`plan-card ${plan.popular ? "plan-card--popular" : ""}`}
            key={plan.id}
          >
            {plan.popular && (
              <span className="plan-card__badge" />
            )}

            <div className={`plan-card__icon ${plan.iconClass}`}>
              {plan.icon}
            </div>

            <h3 className="plan-card__name">{plan.name}</h3>
            <p className="plan-card__desc">{plan.desc}</p>

            <div className="plan-card__price-wrap">
              <span className="plan-card__currency">$</span>
              <span className="plan-card__price">{plan.price}</span>
              <span className="plan-card__period">{plan.period}</span>
            </div>
            <p className="plan-card__price-note">{plan.note}</p>

            <div className="plan-card__divider" />

            <ul className="plan-card__features">
              {plan.features.map((f, i) => (
                <li className="plan-card__feature" key={i}>
                  <span
                    className={`plan-card__check ${
                      f.included
                        ? "plan-card__check--green"
                        : "plan-card__check--red"
                    }`}
                  >
                    {f.included ? <PlanIcons.Check /> : <PlanIcons.Cross />}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <a href="/registro" className={`plan-card__cta ${plan.ctaClass}`}>
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Comparativa ───────────────────────────────────────────────────────────────
function Comparativa() {
  return (
    <section className="planes-compare">
      <div className="planes-compare__header">
        <span className="planes-compare__tag">Comparativa</span>
        <h2 className="planes-compare__title">
          Compara los planes en detalle
        </h2>
      </div>

      <div className="planes-compare__table-wrap">
        <table className="planes-compare__table">
          <thead>
            <tr>
              <th>Característica</th>
              <th>Gratuito</th>
              <th>Acceso al Modelo</th>
              <th>Plan Completo</th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVA.map((row: any, i) => (
              <tr key={i}>
                <td>{row.feature}</td>
                <td>
                  {typeof row.gratuito === "boolean" ? (
                    row.gratuito ? (
                      <PlanIcons.Check className="compare-check" />
                    ) : (
                      <PlanIcons.Cross className="compare-cross" />
                    )
                  ) : (
                    <span>{row.gratuito}</span>
                  )}
                </td>
                <td>
                  {typeof row.modelo === "boolean" ? (
                    row.modelo ? (
                      <PlanIcons.Check className="compare-check" />
                    ) : (
                      <PlanIcons.Cross className="compare-cross" />
                    )
                  ) : (
                    <span>{row.modelo}</span>
                  )}
                </td>
                <td>
                  {typeof row.completo === "boolean" ? (
                    row.completo ? (
                      <PlanIcons.Check className="compare-check" />
                    ) : (
                      <PlanIcons.Cross className="compare-cross" />
                    )
                  ) : (
                    <span>{row.completo}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="planes-faq">
      <div className="planes-faq__header">
        <span className="planes-faq__tag">Preguntas frecuentes</span>
        <h2 className="planes-faq__title">
          ¿Tienes dudas? Te ayudamos
        </h2>
      </div>

      <div className="planes-faq__list">
        {FAQS.map((faq, i) => (
          <div className="faq-item" key={i}>
            <button
              className="faq-item__question"
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
            >
              {faq.q}
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`faq-item__arrow ${
                  openIndex === i ? "faq-item__arrow--open" : ""
                }`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div
              className={`faq-item__answer ${
                openIndex === i ? "faq-item__answer--open" : ""
              }`}
            >
              <p>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA Final ─────────────────────────────────────────────────────────────────
function CTABottom() {
  return (
    <section className="planes-cta">
      <div className="planes-cta__blob" />
      <div className="planes-cta__content">
        <h2 className="planes-cta__title">
          ¿Eres egresado UCC? Todo esto es gratis para ti
        </h2>
        <p className="planes-cta__sub">
          Los egresados de la Universidad Cooperativa de Colombia acceden sin
          costo a todas las herramientas del portal. Regístrate con tu correo
          institucional y comienza ahora.
        </p>
        <div className="planes-cta__actions">
          <a href="/registro" className="planes-cta__btn planes-cta__btn--red">
            Registrarme gratis
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a href="/" className="planes-cta__btn planes-cta__btn--ghost">
            Volver al inicio
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlanesPage() {
  return (
    <div className="planes-page">
      <Header />
      <PlanesHero />
      <PricingCards />
      <Comparativa />
      <FAQ />
      <CTABottom />
      <Footer />
    </div>
  );
}
