"use client";

import { useState } from "react";

const services = [
  { number: "01", title: "Order great food", description: "Discover meals from local chefs, restaurants, and independent food businesses.", icon: "🍲" },
  { number: "02", title: "Find a chef", description: "Connect with culinary professionals for private dining, events, and catering.", icon: "👨🏽‍🍳" },
  { number: "03", title: "Source supplies", description: "Help food businesses connect with reliable ingredient and product suppliers.", icon: "🥬" },
  { number: "04", title: "Deliver with care", description: "Bring customers, food providers, and delivery partners together in one network.", icon: "🛵" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Customer");
  const [submitted, setSubmitted] = useState(false);

  function joinWaitlist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    const subject = encodeURIComponent("FoodLink early access request");
    const body = encodeURIComponent("Please contact me about FoodLink early access.\nEmail: " + email + "\nI am a: " + role);
    window.location.href = "mailto:hello@foodlink.co.ke?subject=" + subject + "&body=" + body;
    setSubmitted(true);
  }

  return (
    <main>
      <nav className="nav wrap">
        <a className="brand" href="#" aria-label="FoodLink home"><span className="brand-mark">F</span><span>food<span className="brand-accent">link</span><small>ONE NETWORK. EVERY PLATE.</small></span></a>
        <div className="nav-links"><a href="#how-it-works">How it works</a><a href="#ecosystem">Our network</a><a className="nav-cta" href="#early-access">Get early access <span>↗</span></a></div>
      </nav>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> BUILT FOR KENYA'S FOOD ECONOMY</div>
          <h1>Every plate has a story.<br /><em>Let's connect it.</em></h1>
          <p className="hero-text">FoodLink brings customers, chefs, food businesses, suppliers, and delivery partners into one connected food ecosystem.</p>
          <div className="hero-actions"><a className="button button-gold" href="#early-access">Join the early access list <span>↗</span></a><a className="text-link" href="#ecosystem">Explore the network <span>↓</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>K</span><span>🍳</span><span>🥑</span><span>+</span></div><p><strong>Made for the people behind every meal.</strong><br />Starting in Nairobi and Kiambu, Kenya.</p></div>
        </div>
        <div className="hero-art" role="img" aria-label="Illustration of a beautifully prepared meal">
          <div className="art-glow"></div><div className="food-card card-top"><span className="mini-icon">✦</span><span><strong>Good food, closer</strong><small>Discover local talent</small></span></div>
          <div className="plate"><div className="plate-inner"><div className="meal-rice"></div><div className="meal-greens"></div><div className="meal-protein"></div><div className="meal-tomato"></div><div className="meal-herb">✳</div></div></div>
          <div className="food-card card-bottom"><span className="check-icon">✓</span><span><strong>One connected network</strong><small>From sourcing to serving</small></span></div>
          <span className="spark spark-one">✳</span><span className="spark spark-two">✦</span>
        </div>
      </section>

      <section className="ticker"><div className="ticker-inner"><span>DISCOVER</span><b>✳</b><span>CONNECT</span><b>✳</b><span>ORDER</span><b>✳</b><span>SOURCE</span><b>✳</b><span>DELIVER</span><b>✳</b><span>GROW TOGETHER</span></div></section>

      <section id="ecosystem" className="section wrap">
        <div className="section-heading"><div><div className="eyebrow">MORE THAN A FOOD APP</div><h2>The whole food world,<br /><em>working together.</em></h2></div><p>FoodLink is designed to make the food industry more connected, discoverable, and easier to work in, whether you're ordering lunch or running a kitchen.</p></div>
        <div className="service-grid">{services.map((service) => <article className="service-card" key={service.number}><div className="service-top"><span className="service-number">{service.number}</span><span className="service-icon">{service.icon}</span></div><h3>{service.title}</h3><p>{service.description}</p><a href="#early-access" aria-label={"Join early access for " + service.title}>Learn more <span>↗</span></a></article>)}</div>
      </section>

      <section id="how-it-works" className="statement"><div className="wrap statement-inner"><div className="eyebrow">A BETTER WAY TO FEED THE FUTURE</div><h2>Less friction behind the scenes.<br /><em>More goodness on the plate.</em></h2><p>We believe a stronger food economy starts when the people who grow, prepare, serve, and deliver food can find each other more easily.</p><a className="button button-light" href="#early-access">Be part of the network <span>↗</span></a></div><div className="statement-orbit orbit-a"></div><div className="statement-orbit orbit-b"></div></section>

      <section id="early-access" className="early wrap"><div className="early-copy"><div className="eyebrow">THE FIRST SERVING</div><h2>FoodLink is getting ready.<br /><em>Get in early.</em></h2><p>Join the early access list and be among the first to hear when FoodLink opens to customers and food industry partners in Kenya.</p><div className="early-points"><span>✓ For customers</span><span>✓ For chefs & vendors</span><span>✓ For suppliers & riders</span></div></div>
        <form className="signup" onSubmit={joinWaitlist}><div className="signup-icon">✉</div><h3>Stay in the loop</h3><p>Get launch updates and early access news.</p><label htmlFor="role">I am joining as</label><select id="role" value={role} onChange={(e) => setRole(e.target.value)}><option>Customer</option><option>Chef or food business</option><option>Supplier</option><option>Delivery partner</option></select><label htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /><button className="button button-gold signup-button" type="submit">Request early access <span>↗</span></button>{submitted && <p className="form-note">Your email app should open with a pre-filled request. Send it to complete your signup.</p>}<small>No spam. Just useful updates as we build.</small></form>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><a className="brand brand-footer" href="#"><span className="brand-mark">F</span><span>food<span className="brand-accent">link</span><small>ONE NETWORK. EVERY PLATE.</small></span></a><p>Connecting the people behind every meal.</p><span className="copyright">© {new Date().getFullYear()} FoodLink Kenya</span></div></footer>
    </main>
  );
}
