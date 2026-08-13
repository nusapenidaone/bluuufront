import { useState, useEffect, useRef, useId, useMemo } from 'react';
import 'react-phone-number-input/style.css';
import './Explore.css';
import { WA, WA_MSG, INSTAGRAM, YOUTUBE } from './lib/contacts';
import Footer from './components/common/Footer';
import HomeNavbar from './components/common/HomeNavbar';
const MEDIA = 'https://bluuu.tours/storage/app/media/bluuu';
const imgPoster   = `${MEDIA}/poster.webp`;
const imgShared   = `${MEDIA}/shared.webp`;
const imgPrivate  = `${MEDIA}/private.webp`;
const galPreviews = [1,2,3,4,5].map(n => `${MEDIA}/gal${n}.webp`);
const imgG1 = `${MEDIA}/g1.webp`;
const imgG2 = `${MEDIA}/g2.webp`;
const imgG3 = `${MEDIA}/g3.webp`;
const imgG4 = `${MEDIA}/g4.webp`;
const imgG5 = `${MEDIA}/g5.webp`;
const icon1 = `${MEDIA}/icon1.svg`;
const icon2 = `${MEDIA}/icon2.svg`;
const icon3 = `${MEDIA}/icon3.svg`;
const icon4 = `${MEDIA}/icon4.svg`;
const icon5 = `${MEDIA}/icon5.svg`;
const icon6 = `${MEDIA}/icon6.svg`;
import { HugeiconsIcon } from '@hugeicons/react';
import CloudSavingDone01Icon from '@hugeicons/core-free-icons/dist/esm/CloudSavingDone01Icon';
import Invoice01Icon from '@hugeicons/core-free-icons/dist/esm/Invoice01Icon';
import FavouriteIcon from '@hugeicons/core-free-icons/dist/esm/FavouriteIcon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/dist/esm/CheckmarkCircle02Icon';
import Tick02Icon from '@hugeicons/core-free-icons/dist/esm/Tick02Icon';
import Shield01Icon from '@hugeicons/core-free-icons/dist/esm/Shield01Icon';
import HeartCheckIcon from '@hugeicons/core-free-icons/dist/esm/HeartCheckIcon';
import Certificate01Icon from '@hugeicons/core-free-icons/dist/esm/Certificate01Icon';
import AnchorIcon from '@hugeicons/core-free-icons/dist/esm/AnchorIcon';
import UserGroupIcon from '@hugeicons/core-free-icons/dist/esm/UserGroupIcon';
import CheckmarkBadge01Icon from '@hugeicons/core-free-icons/dist/esm/CheckmarkBadge01Icon';
import Add01Icon from '@hugeicons/core-free-icons/dist/esm/Add01Icon';
import Shield02Icon from '@hugeicons/core-free-icons/dist/esm/Shield02Icon';
import BoatIcon from '@hugeicons/core-free-icons/dist/esm/BoatIcon';
import { 
  ComfortYachtIcon, 
  CuratedLunchIcon, 
  LandHighlightsIcon, 
  GoProIcon, 
  SnorkelingIcon, 
  SafetyIcon, 
  GoogleIcon, 
  TripAdvisorIcon, 
  AirbnbIcon, 
  WhatsAppIcon, 
  BluuuLogo 
} from './assets/Illustrations';

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

// ─── WhatsApp routing by utm_source ──────────────────────────────────────
const WA_NUMBERS  = { default: WA.tiktok,    google: WA.google,    meta: WA.meta,    tiktok: WA.tiktok    };
const WA_MESSAGES = { default: WA_MSG.tiktok, google: WA_MSG.google, meta: WA_MSG.meta, tiktok: WA_MSG.tiktok };
// ──────────────────────────────────────────────────────────────────────────


const Home2 = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', groupSize: '' });
  const utmRef = useRef({});
  const utmQuery = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const out = new URLSearchParams();
    keys.forEach(k => { if (p.get(k)) out.set(k, p.get(k)); });
    return out.toString();
  }, []);
  const utmUrl = (base) => utmQuery ? `${base}?${utmQuery}` : base;
  const [waNumber, setWaNumber] = useState(WA_NUMBERS.tiktok);
  const [waMessage, setWaMessage] = useState(WA_MESSAGES.tiktok);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [formAlert, setFormAlert] = useState('');
  const [privateGuests, setPrivateGuests] = useState(8);
  const heroVideoRef = useRef(null);
  const scrollToContactForm = () => {
    const desk = document.getElementById('heroFormCard');
    const mob = document.getElementById('contact');
    const target = (desk && getComputedStyle(desk).display !== 'none') ? desk : mob;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const trackTikTokEvent = (event, payload = {}) => {
    window.ttq?.track?.(event, payload);
  };




  // Lazy-load video after page is interactive (avoids 3.6 MB download blocking LCP)
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    const loadAndPlay = () => {
      const size = window.innerWidth <= 768 ? 'md' : 'xl';
      const base = `${MEDIA}/video-${size}`;
      [['video/webm', `${base}.webm`], ['video/mp4', `${base}.mp4`]].forEach(([type, src]) => {
        const s = document.createElement('source');
        s.type = type; s.src = src;
        v.appendChild(s);
      });
      v.load();
      v.play().catch(() => {
        const startPlay = () => { v.play(); };
        document.addEventListener('touchstart', startPlay, { once: true });
        document.addEventListener('click', startPlay, { once: true });
      });
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadAndPlay, { timeout: 3000 });
    } else {
      setTimeout(loadAndPlay, 2500);
    }
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.home2-wrapper .animate-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Park floating WhatsApp button 40px above the USD currency row
  useEffect(() => {
    const stopRow = document.querySelector('.home2-wrapper .footer-bottom');
    const btn = document.querySelector('.home2-wrapper .float-wa');
    if (!stopRow || !btn) return;

    const handleScroll = () => {
      const stopTop = stopRow.getBoundingClientRect().top;
      // distance from viewport bottom to top of footer-bottom row
      const distance = window.innerHeight - stopTop;
      // We want button's bottom edge to be 40px above the currency row top.
      // Default position is 24px from viewport bottom.
      // Park when parking position would be greater than default.
      const parked = distance + 40;
      btn.style.bottom = parked > 24 ? `${parked}px` : '24px';
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Capture UTM params once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const captured = {};
    utmKeys.forEach((k) => { if (params.get(k)) captured[k] = params.get(k); });
    if (document.referrer) captured['utm_referrer'] = document.referrer;
    // Persist to sessionStorage so UTMs survive soft navigations
    if (Object.keys(captured).length) {
      sessionStorage.setItem('bluuu_utm', JSON.stringify(captured));
    }
    const stored = sessionStorage.getItem('bluuu_utm');
    if (stored) utmRef.current = JSON.parse(stored);
    const source = (utmRef.current['utm_source'] || '').toLowerCase();
    // Domain-based fallback: discover → meta, explore → tiktok
    const host = window.location.hostname;
    const domainSource = host.startsWith('discover') ? 'meta'
                       : host.startsWith('explore')  ? 'tiktok'
                       : 'default';
    const resolved = WA_NUMBERS[source] ? source : domainSource;
    setWaNumber(WA_NUMBERS[resolved] || WA_NUMBERS.default);
    setWaMessage(WA_MESSAGES[resolved] || WA_MESSAGES.default);
  }, []);


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('hero-', '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeroFormSubmit = async () => {
    const { name, email, whatsapp, groupSize } = formData;

    const phoneVal = (whatsapp || '').trim();
    const isPhoneValid = phoneVal.length > 3;

    if (!name.trim() || !email.trim() || !isPhoneValid) {
      setFormAlert('Please fill in your name, email and WhatsApp number.');
      setTimeout(() => setFormAlert(''), 4000);
      return;
    }
    setFormSubmitted(true);
    try {
      const response = await fetch('/api/new/marketing/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp, groupSize, utm: utmRef.current }),
      });
      if (!response.ok) {
        throw new Error('Submit failed');
      }
      trackTikTokEvent('Lead', {
        content_type: 'product',
        content_name: 'Nusa Penida Tour Inquiry',
      });
    } catch (_) {
      // silently ignore — lead is best-effort
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const renderPriceStrip = () => (
    <div className="price-strip-inner">
      <div className="price-strip-item">
        <div className="price-strip-icon">
          <HugeiconsIcon icon={CloudSavingDone01Icon} size={28} color="currentColor" strokeWidth={1.5} />
        </div>
        <div className="price-strip-text">
          <p className="price-strip-title">Weather Guarantee</p>
          <p>Bad weather? We reschedule or refund you in full</p>
        </div>
      </div>
      <div className="price-strip-item">
        <div className="price-strip-icon">
          <HugeiconsIcon icon={Invoice01Icon} size={28} color="currentColor" />
        </div>
        <div className="price-strip-text">
          <p className="price-strip-title">No hidden fees</p>
          <p>What you see is what you pay</p>
        </div>
      </div>
      <div className="price-strip-item">
        <div className="price-strip-icon">
          <HugeiconsIcon icon={FavouriteIcon} size={28} color="currentColor" />
        </div>
        <div className="price-strip-text">
          <p className="price-strip-title">Website-exclusive perks</p>
          <p>Free drone photos & hotel pickup when you book direct</p>
        </div>
      </div>
    </div>
  );

  const renderFormBody = (idPrefix) => (
    <>
      <div id={`${idPrefix}-inner`} style={{display: formSubmitted ? 'none' : 'block'}}>
        <h3>Plan your adventure</h3>
        <p className="form-subtitle">Leave your details - we'll reply within 5 minutes.</p>
        <form onSubmit={(e) => { e.preventDefault(); handleHeroFormSubmit(); }} autoComplete="on">
        <div className="form-field">
          <input aria-label="Full Name" type="text" name="name" id={`${idPrefix}-name`} placeholder="Full Name" autoComplete="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-field">
          <input aria-label="Email" type="email" name="email" id={`${idPrefix}-email`} placeholder="Email Address" autoComplete="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-whatsapp`}>WhatsApp or Phone</label>
          <PhoneInput
              defaultCountry="US"
              value={formData.whatsapp}
              onChange={(phone) => setFormData((prev) => ({ ...prev, whatsapp: phone ?? '' }))}
              id={`${idPrefix}-whatsapp`}
              autoComplete="tel"
              className="hero-phone-input"
            />
        </div>
        <div className="form-field">
          <input aria-label="Group Size" type="number" min="1" id={`${idPrefix}-group-size`} placeholder="Group Size (Optional)" inputMode="numeric" value={formData.groupSize} onChange={(e) => setFormData((p) => ({ ...p, groupSize: e.target.value }))} />
        </div>
        {formAlert && (
          <div className="form-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{formAlert}</span>
          </div>
        )}
        <button type="submit" className="hero-form-btn" disabled={!formData.name.trim() || !formData.email.trim() || !(formData.whatsapp && formData.whatsapp.length > 3)}>
          Get my tour details {'->'}
        </button>
        <p className="form-disclaimer">No spam. No payment required.</p>
        </form>
      </div>
      <div className="form-success" style={{display: formSubmitted ? 'block' : 'none'}}>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} color="var(--success)" />
        <h3>Thanks! We'll be in touch.</h3>
        <p className="form-success-sub">We'll reply via WhatsApp or email shortly.</p>
      </div>
    </>
  );

  return (
    <div className="home2-wrapper">


<HomeNavbar />


{/* ═══════════════════════════════════════
     HERO - Cinematic bottom-left
     ═══════════════════════════════════════ */}
<section className="hero" id="hero">
  <video className="hero-video" id="heroVideo" muted loop playsInline disablePictureInPicture preload="none" poster={imgPoster} ref={heroVideoRef} />
  <div className="hero-overlay"></div>

  <div className="hero-content">
    <div className="hero-left">

      <div className="hero-pills-row">
        <div className="hero-pill hero-pill--award">
          <span className="hero-pill__dot"></span>
          <span>Award-Winning Tours · Bali</span>
        </div>
        <div className="hero-pill hero-pill--green">
          <HugeiconsIcon icon={Shield02Icon} size={20} color="#FFFFFF" />
          <span>Best Price Guaranteed</span>
        </div>
        <div className="hero-pill hero-pill--metric">
          <span className="hero-pill__metric-icons">
            <TripAdvisorIcon size={14} />
            <GoogleIcon size={14} />
            <AirbnbIcon size={14} />
          </span>
          <strong>4.9</strong>
          <span className="hero-pill__stars">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
          <span className="hero-pill__count">10,692</span>
        </div>
      </div>

      <h1>Discover<br /><span className="accent">Nusa Penida</span></h1>
      <p className="hero-subtitle-mobile">From <strong>$80</strong>/person · Book direct</p>

      {/* Metric + Best Price pills — below subtitle */}
      <div className="hero-pills-row hero-pills-row--secondary">
        <div className="hero-pill hero-pill--metric">
          <span className="hero-pill__metric-icons">
            <TripAdvisorIcon size={14} />
            <GoogleIcon size={14} />
            <AirbnbIcon size={14} />
          </span>
          <strong>4.9</strong>
          <span className="hero-pill__stars">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
          <span className="hero-pill__count">10,692</span>
        </div>
        <div className="hero-pill hero-pill--green">
          <HugeiconsIcon icon={Shield02Icon} size={20} color="#FFFFFF" />
          <span>Best Price Guaranteed</span>
        </div>
      </div>

      <div className="hero-trust-row">
        <div className="hero-trust-item">
          <HugeiconsIcon icon={Certificate01Icon} size={20} color="currentColor" />
          TripAdvisor Travelers' Choice
        </div>
        <span className="hero-trust-sep"></span>
        <div className="hero-trust-item">
          <HugeiconsIcon icon={HeartCheckIcon} size={20} color="currentColor" />
          Insurance Included
        </div>
      </div>

      {/* CTA button – mobile only (styled like form card button) */}
      <div className="hero-cta-row hero-cta-row--mobile-only">
        <button type="button" className="hero-mobile-cta" onClick={scrollToContactForm}>Plan my Nusa Penida trip</button>
        <p className="hero-mobile-cta-note">No payment required. Reply in 5 min</p>
      </div>
    </div>

    <div className="hero-form hero-form--desktop" id="heroFormCard">
      {renderFormBody('hero')}
    </div>
  </div>


  {/* Value props strip - desktop, inside hero */}
  <div className="price-strip price-strip--desktop">
    {renderPriceStrip()}
  </div>
</section>

{/* Mobile-only Plan your adventure form (shown below hero on mobile) */}
<section className="mobile-form-section" id="contact">
  <div className="container">
    <div className="hero-form hero-form--mobile">
      {renderFormBody('mform')}
    </div>
  </div>
</section>

{/* Mobile-only price strip — below the form on mobile */}
<section className="price-strip price-strip--mobile">
  {renderPriceStrip()}
</section>


{/* ═══════════════════════════════════════
     WHAT'S INCLUDED - Redesigned with illustrations
     ═══════════════════════════════════════ */}
<section className="included-section included-section-gray section-padding">
  <div className="container">

    <div className="section-header section-header-center animate-in">
      <div className="h2-overline h2-overline-blue">INCLUDED</div>
      <h2 className="heading-dark">Everything you want is already <span className="accent-blue-italic">covered</span></h2>
      <p className="section-lede">Simple, transparent inclusions - so you can focus on the day, not the fine print.</p>
    </div>

    <div className="incl-card-grid">
      
      <div className="incl-card animate-in"
     
     >
        {/* accent line */}
        <div className="incl-accent"></div>
        {/* number */}
        <div className="incl-number">01</div>
        {/* icon */}
        <div className="incl-icon">
          <img src={icon1} alt="Comfort Yacht" width="128" height="128" />
        </div>
        {/* text */}
        <div className="incl-text">
          <div className="incl-title">Comfort Yacht</div>
          <div className="incl-body">Premium boats with shade, cushions, and a smooth ride all day.</div>
        </div>
      </div>
      <div className="incl-card animate-in"
     
     >
        {/* accent line */}
        <div className="incl-accent"></div>
        {/* number */}
        <div className="incl-number">02</div>
        {/* icon */}
        <div className="incl-icon">
          <img src={icon2} alt="Curated Lunch" width="128" height="128" />
        </div>
        {/* text */}
        <div className="incl-text">
          <div className="incl-title">Curated Lunch</div>
          <div className="incl-body">Clifftop restaurant with ocean views and local cuisine.</div>
        </div>
      </div>
      <div className="incl-card animate-in"
     
     >
        {/* accent line */}
        <div className="incl-accent"></div>
        {/* number */}
        <div className="incl-number">03</div>
        {/* icon */}
        <div className="incl-icon">
          <img src={icon3} alt="Land Highlights" width="128" height="128" />
        </div>
        {/* text */}
        <div className="incl-text">
          <div className="incl-title">Land Highlights</div>
          <div className="incl-body">Kelingking Cliff, Angel's Billabong, and more iconic photo stops.</div>
        </div>
      </div>
      <div className="incl-card animate-in"
     
     >
        {/* accent line */}
        <div className="incl-accent"></div>
        {/* number */}
        <div className="incl-number">04</div>
        {/* icon */}
        <div className="incl-icon">
          <img src={icon4} alt="Underwater GoPro" width="128" height="128" />
        </div>
        {/* text */}
        <div className="incl-text">
          <div className="incl-title">Underwater GoPro</div>
          <div className="incl-body">Capture every moment underwater with a rental GoPro.</div>
        </div>
      </div>
      <div className="incl-card animate-in"
     
     >
        {/* accent line */}
        <div className="incl-accent"></div>
        {/* number */}
        <div className="incl-number">05</div>
        {/* icon */}
        <div className="incl-icon">
          <img src={icon5} alt="Snorkeling Equipment" width="128" height="128" />
        </div>
        {/* text */}
        <div className="incl-text">
          <div className="incl-title">Snorkeling Equipment</div>
          <div className="incl-body">Full gear provided - mask, fins, and life jacket.</div>
        </div>
      </div>
      <div className="incl-card animate-in"
     
     >
        {/* accent line */}
        <div className="incl-accent"></div>
        {/* number */}
        <div className="incl-number">06</div>
        {/* icon */}
        <div className="incl-icon">
          <img src={icon6} alt="All Entrance Tickets" width="128" height="128" />
        </div>
        {/* text */}
        <div className="incl-text">
          <div className="incl-title">All Entrance Tickets</div>
          <div className="incl-body">Every fee handled - nothing extra to pay on the day.</div>
        </div>
      </div>
    </div>

  </div>
</section>


{/* ═══════════════════════════════════════
     SKU - Shared vs Private
     ═══════════════════════════════════════ */}
<section className="sku-section section-padding" id="tours">
  <div className="container">
    <div className="section-header animate-in">
      <div className="h2-overline">TWO WAYS TO EXPLORE</div>
      <h2>Choose your <span className="accent">tour type</span></h2>
      <p>Same island, same iconic spots, different experience. Pick the format that fits your group best.</p>
    </div>

    <div className="sku-grid">
      {/* Shared Tour */}
      <div className="sku-card animate-in">
        <div className="sku-img-wrap">
          <img className="sku-img sku-img-block" src={imgShared} alt="Shared yacht tour" loading="lazy" />
          <div className="sku-overlay-badge sku-overlay-badge--dark">⭐ Best Value</div>
        </div>
        <div className="sku-body">
          <div className="sku-label">JOIN A SMALL GROUP</div>
          <h3>Shared Tour</h3>
          <p>Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and smooth from pickup to drop-off.</p>

          <div className="sku-info">
            <div className="sku-info-row">
              <HugeiconsIcon icon={AnchorIcon} size={16} color="var(--text-muted)" className="sku-info-icon" />
              One shared yacht for up to <strong>13 guests</strong>
            </div>
            <div className="sku-info-row">
              <HugeiconsIcon icon={UserGroupIcon} size={16} color="var(--text-muted)" />
              <strong>Fixed departure time</strong> with fellow travellers onboard
            </div>
          </div>

          <div className="sku-price-box">
            <div className="sku-glass-pill sku-glass-pill--green">All Inclusive</div>
            <div className="sku-price-row">
              <span className="from">from</span>
              <span className="amount">$80</span>
              <span className="unit">/ person</span>
            </div>
            <div className="sku-price-note">Lunch, snorkeling gear, guide, and boat ride included. No hidden fees.</div>
          </div>

          <a
            href={utmUrl("https://bluuu.tours/new/shared")}
            className="sku-cta-outline"
            onClick={() => trackTikTokEvent('InitiateCheckout', {
              content_type: 'product',
              content_name: 'Shared Tour',
            })}
          >
            See tour details →
          </a>
          <div className="sku-cta-sub">NO PAYMENT REQUIRED TO VIEW OPTIONS</div>

          <div className="sku-checklist">
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Small group with up to 13 guests per boat
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Lunch at a clifftop restaurant included
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Snorkeling with manta rays and iconic reef spots
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Land highlights like Kelingking and Crystal Bay
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Safety gear, certified crew, and guide included
            </div>
          </div>
        </div>
      </div>

      {/* Private Charter */}
      <div className="sku-card sku-card--delay-1 animate-in">
        <div className="sku-img-wrap">
          <img className="sku-img sku-img-block" src={imgPrivate} alt="Private yacht charter" loading="lazy" />
          <div className="sku-overlay-badge sku-overlay-badge--blue">✦ Most Popular</div>
        </div>
        <div className="sku-body">
          <div className="sku-label blue">YOUR BOAT, YOUR RULES</div>
          <h3>Private Charter</h3>
          <p>The entire boat is yours. Choose the timing, adjust the stops, and set the pace for your group.</p>

          <div className="sku-info">
            <div className="sku-info-row">
              <HugeiconsIcon icon={AnchorIcon} size={16} color="var(--text-muted)" className="sku-info-icon" />
              <strong>20+ boats</strong> - premium yachts to luxury charters
            </div>
            <div className="sku-info-row">
              <HugeiconsIcon icon={UserGroupIcon} size={16} color="var(--text-muted)" />
              <strong>2-45 guests</strong> - pick the right boat for your group
            </div>
          </div>

          <div className="sku-price-box sku-price-box--slider">
            <div className="sku-price-row">
              <span className="from">from</span>
              <span className="amount">$750</span>
              <span className="unit">/ entire boat</span>
            </div>
            <div className="sku-slider-wrap">
              <div className="sku-slider-row">
                <span className="sku-slider-lbl">How many in your group?</span>
                <input
                  type="range"
                  className="sku-slider-track"
                  aria-label="Number of guests"
                  min="2" max="14" value={privateGuests}
                  onChange={e => setPrivateGuests(+e.target.value)}
                />
                <span className="sku-slider-num">{privateGuests}</span>
              </div>
              <div className="sku-slider-result">
                <span className="sku-slider-approx">&#8776;</span> <span className="sku-slider-amount">${Math.round(750 / privateGuests)}</span>&nbsp;<span className="sku-slider-per">/ person</span>&nbsp;
                {Math.round(750 / privateGuests) <= 80
                  ? <span className="sku-slider-tag sku-slider-tag--green">CHEAPER THAN SHARED!</span>
                  : Math.round(750 / privateGuests) <= 90
                  ? <span className="sku-slider-tag sku-slider-tag--green">SAME PRICE AS SHARED</span>
                  : privateGuests <= 8
                  ? <span className="sku-slider-tag sku-slider-tag--blue">MAXIMUM PRIVACY</span>
                  : null}
              </div>
            </div>
          </div>

          <a
            href={utmUrl("https://bluuu.tours/new/private")}
            className="sku-cta-filled"
            onClick={() => trackTikTokEvent('InitiateCheckout', {
              content_type: 'product',
              content_name: 'Private Charter',
            })}
          >
            Browse 20+ boats →
          </a>
          <div className="sku-cta-sub">FROM DAY YACHTS TO LUXURY CHARTERS</div>

          <div className="sku-checklist">
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Entire boat reserved only for your group
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Flexible departure and stop timing
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Custom route and optional add-ons on request
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Snorkeling and manta ray spots included
            </div>
            <div className="sku-check">
              <div className="sku-check-icon"><HugeiconsIcon icon={Tick02Icon} size={16} color="#FFF" strokeWidth={2.5} /></div>
              Great fit for families, birthdays, and friend groups
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


{/* ═══════════════════════════════════════
     PHOTO GALLERY - Captured by our guests
     ═══════════════════════════════════════ */}
<section className="gallery-section">
  <div className="container">
    <div className="section-header section-header-center-sm animate-in">
      <div className="h2-overline h2-overline-blue">FROM OUR GUESTS</div>
      <h2 className="heading-dark">Captured by <span className="accent-blue-italic">our guests</span></h2>
    </div>

    <div className="gallery-grid">
      {/* Big left photo */}
      <div className="gallery-tile gallery-tile--tall animate-in" style={{'--i': 0}}>
        <img src={galPreviews[0]} alt="Guests photo" className="gallery-img" loading="lazy" onLoad={e => e.currentTarget.classList.add('img-loaded')} />
      </div>
      {/* Top middle */}
      <div className="gallery-tile animate-in" style={{'--i': 1}}>
        <img src={galPreviews[1]} alt="Guests photo" className="gallery-img" loading="lazy" onLoad={e => e.currentTarget.classList.add('img-loaded')} />
      </div>
      {/* Top right */}
      <div className="gallery-tile animate-in" style={{'--i': 2}}>
        <img src={galPreviews[2]} alt="Guests photo" className="gallery-img gallery-img--top" loading="lazy" onLoad={e => e.currentTarget.classList.add('img-loaded')} />
      </div>
      {/* Bottom middle */}
      <div className="gallery-tile animate-in" style={{'--i': 3}}>
        <img src={galPreviews[3]} alt="Guests photo" className="gallery-img gallery-img--bottom" loading="lazy" onLoad={e => e.currentTarget.classList.add('img-loaded')} />
      </div>
      {/* Bottom right - with "Show all" button overlay */}
      <div className="gallery-tile gallery-tile--with-overlay animate-in" style={{'--i': 4}}>
        <img src={galPreviews[4]} alt="Guests photo" className="gallery-img gallery-img--center-60" loading="lazy" onLoad={e => e.currentTarget.classList.add('img-loaded')} />
        {/* Glass "Show all photos" button */}
        <a href={utmUrl("https://bluuu.tours/new/gallery")} className="gallery-show-all-btn">
            <span className="gallery-show-all-btn-border"></span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Show all photos
          </a>
      </div>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════
     SOCIAL PROOF
     ═══════════════════════════════════════ */}
<section className="social-proof section-padding">
  <div className="container">
    <div className="section-header animate-in">
      <div className="h2-overline">TRUSTED BY TRAVELERS</div>
      <h2>A premium tour with <span className="accent">seamless flow</span></h2>
    </div>

    <div className="rating-summary rating-summary-flex animate-in">
      <div className="rating-summary-row">
      <div className="rating-big">
        <div className="number">4.9</div>
        <div className="stars">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div className="count">10,692 reviews</div>
      </div>

      <div className="platform-ratings">
        <div className="platform-pill">
          <GoogleIcon size={20} />
          4.9 Google
        </div>
        <div className="platform-pill">
          <TripAdvisorIcon size={22} />
          4.9 TripAdvisor
        </div>
        <div className="platform-pill">
          <AirbnbIcon size={20} />
          4.9 Airbnb
        </div>
      </div>

    </div></div>

    <div className="reviews-grid">
      <div className="review-card animate-in">
        <div className="review-top">
          <div className="review-avatar">S</div>
          <div className="review-meta">
            <div className="name">Sarah M.</div>
            <div className="date">March 2026 · Google Reviews</div>
          </div>
        </div>
        <div className="review-stars">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div className="review-title">Best day of our Bali trip!</div>
        <div className="review-text">The crew was incredible, the boat was spotless, and swimming with mantas was a once-in-a-lifetime experience. Worth every penny.</div>
      </div>

      <div className="review-card review-card--delay-1 animate-in">
        <div className="review-top">
          <div className="review-avatar">J</div>
          <div className="review-meta">
            <div className="name">James K.</div>
            <div className="date">February 2026 · TripAdvisor</div>
          </div>
        </div>
        <div className="review-stars">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div className="review-title">Smooth from start to finish</div>
        <div className="review-text">Hotel pickup was on time, the boarding was seamless (no wading through water!), and the guides knew exactly where to go. Highly recommend the Premium tier.</div>
      </div>

      <div className="review-card review-card--delay-2 animate-in">
        <div className="review-top">
          <div className="review-avatar">L</div>
          <div className="review-meta">
            <div className="name">Lisa T.</div>
            <div className="date">January 2026 · Google Reviews</div>
          </div>
        </div>
        <div className="review-stars">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div className="review-title">Private charter was incredible</div>
        <div className="review-text">We took 12 friends on a private yacht - the flexibility to choose our own stops and timing made it feel like our own adventure. The sunset prosecco was the perfect ending.</div>
      </div>
    </div>

    {/* Crew avatars */}
    <div className="crew-cluster">
      <div className="crew-avatars">
        <img className="crew-avatar" src={imgG1} alt="Budi" loading="lazy" />
        <img className="crew-avatar" src={imgG2} alt="Nyoman" loading="lazy" />
        <img className="crew-avatar" src={imgG3} alt="Vicky" loading="lazy" />
        <img className="crew-avatar" src={imgG4} alt="Tim" loading="lazy" />
        <img className="crew-avatar" src={imgG5} alt="Jena" loading="lazy" />
      </div>
      <span className="crew-caption">Your crew: <strong>Budi, Nyoman, Vicky</strong> +12 guides</span>
    </div>
  </div>
</section>



{/* ═══════════════════════════════════════
     FAQ - Trimmed for paid ads (3 questions)
     ═══════════════════════════════════════ */}
<section className="faq-section section-padding" id="faq">
  <div className="container">
    <div className="section-header animate-in">
      <div className="h2-overline">FAQ</div>
      <h2>Frequently Asked Questions</h2>
    </div>

    <div className="faq-card animate-in">
      <div className="faq-list">
        <div className={`faq-item ${openFaqIndex === 0 ? 'open' : ''}`}>
          <button className="faq-question" onClick={() => toggleFaq(0)}>
            <span>How do I book a Nusa Penida tour?</span>
            <span className="faq-icon"><HugeiconsIcon icon={Add01Icon} size={20} color="currentColor" /></span>
          </button>
          <div className="faq-answer"><p>Choose your tour type (shared or private), select your comfort level and date, and complete your booking online. No upfront payment required to check availability - just pick your dates and we'll confirm within minutes.</p></div>
        </div>
        <div className={`faq-item ${openFaqIndex === 1 ? 'open' : ''}`}>
          <button className="faq-question" onClick={() => toggleFaq(1)}>
            <span>Why are we more expensive than other companies?</span>
            <span className="faq-icon"><HugeiconsIcon icon={Add01Icon} size={20} color="currentColor" /></span>
          </button>
          <div className="faq-answer"><p>We invest in premium boats, certified senior guides, smaller group sizes, and all-inclusive packages so you don't worry about hidden costs. Our 4.9 rating across 10,000+ reviews reflects the experience quality.</p></div>
        </div>
        <div className={`faq-item ${openFaqIndex === 2 ? 'open' : ''}`}>
          <button className="faq-question" onClick={() => toggleFaq(2)}>
            <span>Can I cancel or reschedule my tour?</span>
            <span className="faq-icon"><HugeiconsIcon icon={Add01Icon} size={20} color="currentColor" /></span>
          </button>
          <div className="faq-answer"><p>Yes! Free cancellation up to 24 hours before departure. If conditions are bad on the day (weather, tides), we'll reschedule at no cost or provide a full refund.</p></div>
        </div>
      </div>

      <div className="faq-see-all">
        <a href={utmUrl("https://bluuu.tours/new/faq")} className="btn-ghost">See all questions →</a>
      </div>
    </div>
  </div>
</section>


<Footer />


{/* ═══════════════════════════════════════
     FLOATING WHATSAPP
     ═══════════════════════════════════════ */}
<a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`} className="float-wa" target="_blank" rel="noopener" id="floatWa" aria-label="Chat with us on WhatsApp">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  <span>Chat with us</span>
</a>


{/* ═══════════════════════════════════════
     SCRIPTS
     ═══════════════════════════════════════ */}

    </div>
  );
};

export default Home2;
