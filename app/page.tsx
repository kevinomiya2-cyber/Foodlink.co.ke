"use client";

import { useState } from "react";

const services = [
  { number: "01", title: "Order great food", description: "Discover meals from local chefs, restaurants, and independent food businesses.", icon: "🍲" },
  { number: "02", title: "Find a chef", description: "Connect with culinary professionals for private dining, events, and catering.", icon: "👨🏽‍🍳" },
  { number: "03", title: "Source supplies", description: "Help food businesses connect with reliable ingredient and product suppliers.", icon: "🥬" },
  { number: "04", title: "Deliver with care", description: "Bring customers, food providers, and delivery partners together in one network.", icon: "🛵" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main>
      <nav className="nav wrap">
        <a className="brand" href="/" aria-label="FoodLink home"><span className="brand-mark">F</span><span>food<span className="brand-accent">link</span><small>ONE NETWORK. EVERY PLATE.</small></span></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "✕" : "☰"} <span>{menuOpen ? "Close" : "Menu"}</span></button><div className={`nav-links ${menuOpen ? "mobile-open" : ""}`}><a onClick={() => setMenuOpen(false)} href="/menu">Menu</a><a onClick={() => setMenuOpen(false)} href="/marketplace">Marketplace</a><a onClick={() => setMenuOpen(false)} href="#how-it-works">How it works</a><a onClick={() => setMenuOpen(false)} href="#ecosystem">Our network</a><a onClick={() => setMenuOpen(false)} href="/contact">Contact</a><a onClick={() => setMenuOpen(false)} href="/login">Sign in</a><a className="nav-cta" onClick={() => setMenuOpen(false)} href="/login">Create account <span>↗</span></a></div>
      </nav>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> BUILT FOR KENYA'S FOOD ECONOMY</div>
          <h1>Every plate has a story.<br /><em>Let's connect it.</em></h1>
          <p className="hero-text">FoodLink brings customers, chefs, food businesses, suppliers, and delivery partners into one connected food ecosystem.</p>
          <div className="hero-actions"><a className="button button-gold" href="/login">Create your account <span>↗</span></a><a className="text-link" href="/menu">Explore the menu <span>↗</span></a></div>
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
        <div className="service-grid">{services.map((service) => <article className="service-card" key={service.number}><div className="service-top"><span className="service-number">{service.number}</span><span className="service-icon">{service.icon}</span></div><h3>{service.title}</h3><p>{service.description}</p><a href={service.number === "01" ? "/marketplace" : "/login"} aria-label={service.number === "01" ? "Browse the marketplace" : "Create a FoodLink account"}>{service.number === "01" ? "Browse meals" : "Join FoodLink"} <span>↗</span></a></article>)}</div>
      </section>

      <section id="how-it-works" className="statement"><div className="wrap statement-inner"><div className="eyebrow">A BETTER WAY TO FEED THE FUTURE</div><h2>Less friction behind the scenes.<br /><em>More goodness on the plate.</em></h2><p>We believe a stronger food economy starts when the people who grow, prepare, serve, and deliver food can find each other more easily.</p><a className="button button-light" href="/login">Join the network <span>↗</span></a></div><div className="statement-orbit orbit-a"></div><div className="statement-orbit orbit-b"></div></section>

      <section id="early-access" className="early wrap"><div className="early-copy"><div className="eyebrow">YOUR FOODLINK ACCOUNT</div><h2>Ready to get started?<br /><em>Come on in.</em></h2><p>Create an account to enter the FoodLink member space, or explore the marketplace before you join.</p><div className="early-points"><span>✓ Create an account</span><span>✓ Browse available food</span><span>✓ Join as a customer first</span></div><div className="hero-actions"><a className="button button-gold" href="/login">Create account <span>↗</span></a><a className="text-link" href="/menu">Explore the menu <span>↗</span></a></div></div><div className="signup"><div className="signup-icon">↗</div><h3>Start here</h3><p>No email app, waitlist, or detour. Use the account page to register or sign in.</p><a className="button button-gold signup-button" href="/login">Go to sign in / sign up <span>↗</span></a><small>New accounts begin as customers. Partner roles are approved separately.</small></div></section>

      <section id="contact" className="section wrap">
        <div className="section-heading"><div><div className="eyebrow">QUESTIONS OR PARTNERSHIPS?</div><h2>Good food starts<br /><em>with a conversation.</em></h2></div><p>Need help with an order, want to join as a chef or supplier, or have a partnership idea? Talk directly to the FoodLink team.</p></div>
        <div className="hero-actions"><a className="button button-gold" href="https://wa.me/254768395450?text=Hello%20FoodLink%2C%20I%20have%20a%20question." target="_blank" rel="noreferrer">WhatsApp 0768 395 450 <span>↗</span></a><a className="text-link" href="tel:+254768395450">Call FoodLink <span>↗</span></a><a className="text-link" href="/contact">Contact & payment information <span>↗</span></a></div>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><a className="brand brand-footer" href="/"><span className="brand-mark">F</span><span>food<span className="brand-accent">link</span><small>ONE NETWORK. EVERY PLATE.</small></span></a><p>Connecting the people behind every meal. <a href="https://wa.me/254768395450?text=Hello%20FoodLink%2C%20I%20have%20a%20question." target="_blank" rel="noreferrer">WhatsApp: 0768 395 450</a> · <a href="/menu">View menu</a></p><span className="copyright">© {new Date().getFullYear()} FoodLink Kenya</span></div></footer>
    </main>
  );
}
