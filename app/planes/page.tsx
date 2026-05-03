"use client";

import { useState } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Planes/planes.css";

// ── Datos de planes ──────────────────────────────────────────────────────────
const PLANES = [
  {
    id: "modelo",
    name: "Acceso al Modelo",
    desc: "Accede a nuestro modelo de diagnóstico de estabilidad laboral y obtén un análisis completo de tu perfil profesional.",
    price: "25.000",
    period: "pago único",
    note: "Sin cargos recurrentes — paga una vez, usa siempre.",
    icon: "🧠",
    iconClass: "plan-card__icon--basic",
    popular: false,
    features: [
      { text: "Diagnóstico de estabilidad laboral con IA", included: true },
      { text: "Análisis de habilidades vs. mercado colombiano", included: true },
      { text: "Recomendaciones personalizadas de mejora", included: true },
      { text: "Informe descargable en PDF", included: true },
      { text: "Acceso a la bolsa de empleo UCC", included: false },
      { text: "Alertas de vacantes por correo", included: false },
      { text: "Postulación directa a empresas aliadas", included: false },
    ],
    cta: "Adquirir acceso",
    ctaClass: "plan-card__cta--outline",
  },
  {
    id: "completo",
    name: "Plan Completo",
    desc: "Todo el poder del modelo de IA más acceso completo a la bolsa de empleo, vacantes y red de empresas aliadas UCC.",
    price: "45.000",
    period: "/ mes",
    note: "Cancela cuando quieras. Sin permanencia.",
    icon: "🚀",
    iconClass: "plan-card__icon--pro",
    popular: true,
    features: [
      { text: "Diagnóstico de estabilidad laboral con IA", included: true },
      { text: "Análisis de habilidades vs. mercado colombiano", included: true },
      { text: "Recomendaciones personalizadas de mejora", included: true },
      { text: "Informe descargable en PDF", included: true },
      { text: "Acceso completo a la bolsa de empleo UCC", included: true },
      { text: "Alertas de vacantes por correo", included: true },
      { text: "Postulación directa a empresas aliadas", included: true },
    ],
    cta: "Suscribirme ahora",
    ctaClass: "plan-card__cta--red",
  },
];

const COMPARATIVA = [
  { feature: "Diagnóstico con IA", modelo: true, completo: true },
  { feature: "Análisis de perfil profesional", modelo: true, completo: true },
  { feature: "Recomendaciones personalizadas", modelo: true, completo: true },
  { feature: "Informe descargable (PDF)", modelo: true, completo: true },
  { feature: "Acceso a la bolsa de empleo", modelo: false, completo: true },
  { feature: "Alertas de vacantes", modelo: false, completo: true },
  { feature: "Postulación a empresas aliadas", modelo: false, completo: true },
  { feature: "Soporte prioritario", modelo: false, completo: true },
  { feature: "Tipo de cobro", modelo: "Único", completo: "Mensual" },
];

const FAQS = [
  {
    q: "¿Soy egresado de la UCC, necesito pagar?",
    a: "¡No! Los egresados de la Universidad Cooperativa de Colombia tienen acceso gratuito a todas las funcionalidades del portal, incluyendo el modelo de diagnóstico y la bolsa de empleo. Simplemente regístrate con tu correo institucional.",
  },
  {
    q: "¿Qué incluye el pago único del modelo?",
    a: "Con el pago único obtienes acceso permanente al modelo de diagnóstico de estabilidad laboral con IA. Esto incluye tu análisis completo, comparación con el mercado colombiano, recomendaciones personalizadas y un informe descargable en PDF.",
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
        <span className="planes-hero__badge">💎 Para usuarios externos</span>
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
              <span className="plan-card__badge">Más popular</span>
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
                    {f.included ? "✓" : "✕"}
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
              <th>Acceso al Modelo</th>
              <th>Plan Completo</th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVA.map((row, i) => (
              <tr key={i}>
                <td>{row.feature}</td>
                <td>
                  {typeof row.modelo === "boolean" ? (
                    row.modelo ? (
                      <span className="compare-check">✓</span>
                    ) : (
                      <span className="compare-cross">✕</span>
                    )
                  ) : (
                    <span>{row.modelo}</span>
                  )}
                </td>
                <td>
                  {typeof row.completo === "boolean" ? (
                    row.completo ? (
                      <span className="compare-check">✓</span>
                    ) : (
                      <span className="compare-cross">✕</span>
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
              <span
                className={`faq-item__arrow ${
                  openIndex === i ? "faq-item__arrow--open" : ""
                }`}
              >
                ▾
              </span>
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
            Registrarme gratis →
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
