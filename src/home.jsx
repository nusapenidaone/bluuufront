import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './home.css';
import { useSiteContacts } from './hooks/useSiteContacts';
const MEDIA = 'https://bluuu.tours/storage/app/media/bluuu';
const imgPoster   = 'https://bluuu.tours/storage/app/media/poster.webp';
const imgPosterMd = 'https://bluuu.tours/storage/app/media/poster-md.webp';
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
import { CloudSavingDone01Icon, Invoice01Icon, FavouriteIcon, CheckmarkCircle02Icon, Tick02Icon, Shield01Icon, HeartCheckIcon, Certificate01Icon, AnchorIcon, UserGroupIcon, CheckmarkBadge01Icon, Add01Icon, Shield02Icon, BoatIcon } from '@hugeicons/core-free-icons';

const TripAdvisorIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M55.1965 110.393C85.6806 110.393 110.393 85.6806 110.393 55.1965C110.393 24.7123 85.6806 0 55.1965 0C24.7123 0 0 24.7123 0 55.1965C0 85.6806 24.7123 110.393 55.1965 110.393Z" fill="#34E0A1"/><path d="M89.2887 44.4287L95.9493 37.1822H81.1788C73.7844 32.1312 64.8542 29.1895 55.1964 29.1895C45.5507 29.1895 36.6455 32.1375 29.2632 37.1822H14.4558L21.1164 44.4287C17.0338 48.1536 14.4744 53.5192 14.4744 59.4767C14.4744 70.7196 23.5896 79.8346 34.8324 79.8346C40.1733 79.8346 45.0391 77.7748 48.6716 74.4075L55.1965 81.5121L61.7214 74.4137C65.354 77.781 70.2136 79.8346 75.5544 79.8346C86.7972 79.8346 95.9247 70.7196 95.9247 59.4767C95.9307 53.513 93.3715 48.1476 89.2887 44.4287ZM34.8385 73.2542C27.228 73.2542 21.061 67.0872 21.061 59.4767C21.061 51.8663 27.2282 45.6991 34.8385 45.6991C42.4487 45.6991 48.6159 51.8663 48.6159 59.4767C48.6159 67.0872 42.4487 73.2542 34.8385 73.2542ZM55.2026 59.0759C55.2026 50.01 48.6099 42.227 39.9079 38.9028C44.6134 36.9354 49.7754 35.8439 55.1964 35.8439C60.6173 35.8439 65.7853 36.9354 70.491 38.9028C61.7954 42.2332 55.2026 50.0101 55.2026 59.0759ZM75.5606 73.2542C67.9502 73.2542 61.783 67.0872 61.783 59.4767C61.783 51.8663 67.9502 45.6991 75.5606 45.6991C83.171 45.6991 89.3381 51.8663 89.3381 59.4767C89.3381 67.0872 83.1709 73.2542 75.5606 73.2542ZM75.5606 52.2486C71.5704 52.2486 68.3387 55.4803 68.3387 59.4706C68.3387 63.4607 71.5704 66.6923 75.5606 66.6923C79.5507 66.6923 82.7824 63.4607 82.7824 59.4706C82.7822 55.4865 79.5507 52.2486 75.5606 52.2486ZM42.0602 59.4767C42.0602 63.4668 38.8286 66.6985 34.8385 66.6985C30.8484 66.6985 27.6167 63.4668 27.6167 59.4767C27.6167 55.4865 30.8484 52.2548 34.8385 52.2548C38.8286 52.2486 42.0602 55.4865 42.0602 59.4767Z" fill="#000"/></svg>
);

const GoogleIcon = ({ size = 20 }) => {
  const uid = useId();
  const a = `${uid}-a`;
  const b = `${uid}-b`;
  const c = `${uid}-c`;
  const d = `${uid}-d`;
  const e = `${uid}-e`;
  const f = `${uid}-f`;
  const g = `${uid}-g`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill={`url(#${a})`} d="M6.592 13.918a6.04 6.04 0 0 1-.307-1.909H2.208c0 1.517.343 2.946.947 4.227l.124.254v.01a10.063 10.063 0 0 0 1.889 2.604l4.47-1.674a6.12 6.12 0 0 1-3.046-3.512Z"/><path fill={`url(#${b})`} d="M18.883 4.619C17.148 3 14.896 2.01 12.198 2.01c-.531 1.11-.62 2.771 0 3.981 1.472 0 2.78.51 3.824 1.491l2.86-2.863Z"/><path fill={`url(#${c})`} d="M12.198 5.991h.095l-.095-3.981a9.936 9.936 0 0 0-7.645 3.577c.257 1.483.97 2.435 3.12 2.586 1.084-1.324 2.71-2.182 4.525-2.182Z"/><path fill={`url(#${d})`} d="M15.568 17.073c-.89.6-2.026.963-3.37.963-.784 1.262-1.31 2.562 0 3.972 2.53 0 4.675-.783 6.295-2.14l.318-.278c1.482-1.37 2.473-3.244 2.83-5.46.098-.607.148-1.24.148-1.894l-2.265.3-1.912 1.35-.037.177a4.596 4.596 0 0 1-1.813 2.871l-.194.139Z"/><path fill="#3086FF" d="M12.207 10.195v3.864l5.368.004a7.211 7.211 0 0 1-.013.067h4.08a11.894 11.894 0 0 0-.034-3.94h-6.902v.005h-2.499Z"/><path fill={`url(#${e})`} d="m6.532 10.336.072-.227a6.136 6.136 0 0 1 1.719-2.616c-.93-.157-3.263-1.525-3.567-2.14a10.066 10.066 0 0 0-1.477 2.174 9.885 9.885 0 0 0-1.07 4.694c.723.313 3.082.37 4.08 0a5.926 5.926 0 0 1 .243-1.885Z"/><path fill={`url(#${f})`} d="M8.24 2.828 9.954 6.45c-.754.322-1.43.8-1.99 1.392l-3.77-1.798A10.016 10.016 0 0 1 8.24 2.828Z"/><path fill={`url(#${g})`} d="M12.198 18.036a5.733 5.733 0 0 1-3.046-.879l-1.562-.043c-1.839.489-2.372.882-2.538 1.872a9.935 9.935 0 0 0 7.146 3.022v-3.972Z"/><defs><radialGradient id={a} cx="0" cy="0" r="1" gradientTransform="matrix(-.39758 -10.0212 14.2947 -.60136 9.548 18.953)" gradientUnits="userSpaceOnUse"><stop offset=".142" stopColor="#1ABD4D"/><stop offset=".54" stopColor="#EBCB03"/><stop offset=".861" stopColor="#FFCE0A"/></radialGradient><radialGradient id={b} cx="0" cy="0" r="1" gradientTransform="matrix(6.98058 -.00002 -.00001 8.69619 18.606 7.276)" gradientUnits="userSpaceOnUse"><stop offset=".408" stopColor="#FB4E5A"/><stop offset="1" stopColor="#FF4540"/></radialGradient><radialGradient id={c} cx="0" cy="0" r="1" gradientTransform="matrix(-9.69141 5.2869 7.2839 12.9533 14.943 .736)" gradientUnits="userSpaceOnUse"><stop offset=".231" stopColor="#FF4541"/><stop offset="1" stopColor="#FF8C18"/></radialGradient><radialGradient id={d} cx="0" cy="0" r="1" gradientTransform="matrix(-17.1723 -22.6195 -8.27448 6.39613 12.433 20.73)" gradientUnits="userSpaceOnUse"><stop offset=".132" stopColor="#0CBA65"/><stop offset=".801" stopColor="#3086FF"/></radialGradient><radialGradient id={e} cx="0" cy="0" r="1" gradientTransform="matrix(-1.20393 10.4774 14.3481 1.68074 11.206 4)" gradientUnits="userSpaceOnUse"><stop offset=".366" stopColor="#FF4E3A"/><stop offset=".771" stopColor="#FFCD0A"/></radialGradient><radialGradient id={f} cx="0" cy="0" r="1" gradientTransform="matrix(-3.50908 3.94959 -10.9464 -10.0725 9.582 3.782)" gradientUnits="userSpaceOnUse"><stop offset=".316" stopColor="#FF4C3C"/><stop offset="1" stopColor="#FF9F13"/></radialGradient><radialGradient id={g} cx="0" cy="0" r="1" gradientTransform="matrix(-9.59942 -5.20588 7.21476 -12.7547 14.895 23.203)" gradientUnits="userSpaceOnUse"><stop offset=".231" stopColor="#0FBC5F"/><stop offset="1" stopColor="#86C504"/></radialGradient></defs></svg>
  );
};

const AirbnbIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#FF385C" fillRule="evenodd" d="M21.157 16.214c-.101-.24-.203-.5-.304-.72-.162-.36-.325-.701-.467-1.021l-.02-.02a208.116 208.116 0 0 0-4.488-9.05l-.061-.12c-.162-.3-.325-.62-.488-.94-.203-.36-.405-.741-.73-1.102A3.298 3.298 0 0 0 12.02 2c-1.015 0-1.929.44-2.6 1.202-.304.36-.527.74-.73 1.1-.163.32-.325.641-.487.942l-.062.12a233.985 233.985 0 0 0-4.487 9.048l-.02.04c-.142.32-.305.661-.467 1.022-.102.22-.203.46-.305.72-.264.74-.345 1.442-.243 2.162a4.264 4.264 0 0 0 2.639 3.323A4.208 4.208 0 0 0 6.903 22a5.422 5.422 0 0 0 2.559-.72c.832-.461 1.624-1.122 2.517-2.083.894.961 1.706 1.622 2.518 2.082a5.42 5.42 0 0 0 2.559.721c.568 0 1.137-.1 1.644-.32a4.257 4.257 0 0 0 2.64-3.324c.162-.7.082-1.4-.183-2.142ZM12 17.255c-1.096-1.361-1.806-2.642-2.05-3.723-.102-.461-.122-.861-.062-1.222.041-.32.163-.6.325-.84.386-.541 1.036-.881 1.787-.881.752 0 1.422.32 1.787.88.163.24.285.521.325.841.061.36.041.78-.06 1.222-.244 1.06-.955 2.342-2.052 3.723Zm8.102.941a2.98 2.98 0 0 1-1.847 2.342 3.11 3.11 0 0 1-1.544.2 4.02 4.02 0 0 1-1.543-.52c-.73-.4-1.462-1.02-2.315-1.942 1.34-1.622 2.153-3.103 2.457-4.424a4.95 4.95 0 0 0 .102-1.702 3.24 3.24 0 0 0-.548-1.361c-.63-.901-1.685-1.422-2.864-1.422-1.177 0-2.233.541-2.862 1.422-.285.4-.468.86-.549 1.361a4.092 4.092 0 0 0 .102 1.702c.304 1.321 1.137 2.823 2.457 4.444-.833.921-1.584 1.542-2.315 1.942-.528.3-1.036.46-1.543.52a3.297 3.297 0 0 1-1.543-.2 2.983 2.983 0 0 1-1.849-2.342c-.06-.5-.02-1 .183-1.562.062-.2.163-.4.265-.64.142-.32.304-.66.466-1l.02-.041A217.999 217.999 0 0 1 9.3 5.984l.061-.12c.162-.3.325-.62.487-.921.163-.32.346-.62.569-.88a2.134 2.134 0 0 1 1.624-.742c.63 0 1.198.261 1.625.741.223.26.406.56.568.881.163.3.325.62.488.921l.06.12a263.89 263.89 0 0 1 4.447 9.01v.02c.162.32.305.68.467 1 .102.24.203.44.264.64.163.52.224 1.022.142 1.542Z" clipRule="evenodd"/></svg>
);

const AnimatedCounter = ({ target, duration = 2000, formatter }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{formatter ? formatter(count) : count}</span>;
};

const Home3 = () => {
  const contacts = useSiteContacts();
  const waLink = contacts?.whatsapp?.link || 'https://wa.me/6281547483381';
  const [isScrolled, setIsScrolled] = useState(false);
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
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroVideoRef = useRef(null);
  const scrollToContactForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };


  // Navbar scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Read captured UTM data (captureUtm() already ran in main.jsx)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('bluuu_utm');
      if (stored) utmRef.current = JSON.parse(stored);
    } catch { /* ignore */ }
  }, []);


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('hero-', '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeroFormSubmit = async () => {
    const phoneVal = whatsapp.trim();
    const isPhoneValid = phoneVal.replace(/[^0-9]/g, "").length > 6;

    if (!name.trim() || !email.trim() || !isPhoneValid) {
      alert('Please enter your name, a valid email, and a valid phone number / WhatsApp.');
      return;
    }
    setFormSubmitted(true);
    try {
      await fetch('/submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp, groupSize, utm: utmRef.current }),
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
        <div className="form-field">
          <input aria-label="Full Name" type="text" id={`${idPrefix}-name`} placeholder="Full Name" autoComplete="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-field">
          <input aria-label="Email" type="email" id={`${idPrefix}-email`} placeholder="Email Address" autoComplete="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-whatsapp`}>Phone Number / WhatsApp</label>
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
        <button type="button" className="hero-form-btn" onClick={handleHeroFormSubmit}>
          Get my tour details {'->'}
        </button>
        <p className="form-disclaimer">No spam. No payment required.</p>
      </div>
      <div className="form-success" style={{display: formSubmitted ? 'block' : 'none'}}>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} color="var(--success)" />
        <h3>Thanks! We'll be in touch.</h3>
        <p className="form-success-sub">Check your WhatsApp shortly.</p>
      </div>
    </>
  );

  return (
    <div className="home2-wrapper">


{/* ═══════════════════════════════════════
     NAVBAR
     ═══════════════════════════════════════ */}
<nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
  <div className="inner">
    <a href="https://bluuu.tours" className="logo" aria-label="Bluuu Tours">
      <svg width="140" height="30" viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#navClip)">
          <path d="M8.55478 6.47086C5.92052 4.49424 1.1896 2.89157 0.571354 6.47086C0.221911 8.47419 -0.0468934 12.561 0.00686701 16.7279C0.114388 26.9315 0.275669 28.1335 1.21648 28.8547C1.4584 29.0417 1.7272 29.1753 2.02288 29.2821C6.80757 30.8581 11.431 23.4057 12.8556 20.2805C14.9523 15.7129 13.0438 9.83645 8.55478 6.47086Z" fill="#2E53D9"/>
          <path d="M29.711 3.6661C25.9477 -0.0734532 21.5394 0.0868102 15.2763 0.00667695C11.1636 0.00667695 5.57252 -0.0200325 2.7501 0.0333897C0.196474 0.00667858 0.357756 0.460767 2.34689 1.23539C2.64258 1.34223 2.93825 1.47579 3.20706 1.60934C5.30371 2.62436 7.61542 3.98663 9.55079 5.50916C12.5614 7.7796 15.3032 11.0918 18.2869 12.7479C21.1093 14.3505 25.0876 15.1519 28.0444 14.0567C32.5334 12.6143 32.8291 6.63103 29.711 3.6661Z" fill="#2E53D9"/>
          <path d="M22.5062 16.7003C18.1785 18.116 13.9314 21.0275 11.8078 24.9006C8.66289 31.1243 19.7644 30.1627 23.6352 29.5483C28.3661 28.8004 32.2906 26.6101 33.4464 22.3363C34.8711 15.9257 28.2586 14.5901 22.5062 16.7003Z" fill="#2E53D9"/>
          <path d="M62.6931 13.8691C66.5101 10.8507 64.9241 3.47852 58.0697 3.47852H41.2695V24.1796C41.2695 25.2213 42.1028 26.0761 43.1243 26.0761H59.0105C67.424 26.1028 69.1712 16.3265 62.6931 13.8691ZM45.194 7.32492H58.0428C61.4297 7.32492 61.1609 12.7472 58.0697 12.7472H45.194V7.32492ZM59.0105 22.2564H45.194V16.1395H58.8492C63.7145 16.1663 63.4188 22.2564 59.0105 22.2564Z" fill="#2E53D9"/>
          <path d="M68.418 5.40172V26.1829H70.4878C71.5092 26.1829 72.3425 25.3282 72.3425 24.2864V3.47852H70.2727C69.2513 3.50523 68.418 4.33328 68.418 5.40172Z" fill="#2E53D9"/>
          <path d="M95.2169 21.3484V8.04624L93.0127 8.07296C92.0451 8.07296 91.2655 8.84758 91.2655 9.80918V19.9861C91.2655 20.2265 91.1849 20.4402 91.0505 20.6272C90.1634 21.8559 88.5506 22.7908 85.9701 22.7908C82.2875 22.7908 78.8737 21.562 78.8737 17.9828V8.01953H76.6964C75.7287 8.01953 74.9492 8.79415 74.9492 9.75575V17.9828C74.9492 24.34 80.0833 26.5036 85.7551 26.5036C90.271 26.5036 93.0127 24.2064 93.6847 23.5921C94.4374 22.9243 95.2438 22.2832 95.2169 21.3484Z" fill="#2E53D9"/>
          <path d="M136.101 8.04624V18.0095C136.101 21.5888 132.66 22.8175 129.005 22.8175C126.424 22.8175 124.838 21.8826 123.924 20.6539C123.79 20.4669 123.709 20.2532 123.709 20.0128V9.83588C123.709 8.87428 122.93 8.09966 121.962 8.09966L119.758 8.01953V21.3216C119.758 22.2565 120.537 22.9243 121.263 23.5921C121.935 24.2064 124.677 26.5036 129.193 26.5036C134.864 26.5036 139.999 24.34 139.999 17.9828V9.75575C139.999 8.79415 139.219 8.01953 138.251 8.01953L136.101 8.04624Z" fill="#2E53D9"/>
          <path d="M117.691 21.3484V8.01953L115.487 8.04624C114.519 8.04624 113.739 8.82087 113.739 9.78246V19.906C113.739 20.1731 113.659 20.4135 113.471 20.6272C112.691 21.5353 111.105 22.7908 107.449 22.7908C104.358 22.7908 102.342 21.5888 101.482 20.6539C101.294 20.4669 101.213 20.1998 101.213 19.9327V9.78246C101.213 8.82087 100.434 8.04624 99.4659 8.04624L97.2617 8.01953V21.3216C97.2617 22.0161 97.9337 23.0312 98.7133 23.5654C100.944 25.1146 102.96 26.1831 105.89 26.3967C106.939 26.5036 107.396 26.4769 108.551 26.4235C108.551 26.4235 113.39 26.2365 116.159 23.5654C116.938 22.9243 117.691 22.0161 117.691 21.3484Z" fill="#2E53D9"/>
        </g>
        <defs><clipPath id="navClip"><rect width="140" height="30" fill="white"/></clipPath></defs>
      </svg>
    </a>
    <div className={`nav-right ${mobileMenuOpen ? 'is-open' : ''}`}>
      <a href="#tours" className="nav-link-faq" onClick={() => setMobileMenuOpen(false)}>Tours</a>
      <a href="#faq" className="nav-link-faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
    </div>
    <button
      type="button"
      className={`nav-burger ${mobileMenuOpen ? 'is-open' : ''}`}
      aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      onClick={() => setMobileMenuOpen((v) => !v)}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>


{/* ═══════════════════════════════════════
     HERO - Cinematic bottom-left
     ═══════════════════════════════════════ */}
<section className="hero" id="hero">
  <picture>
    <source media="(max-width: 768px)" srcSet={imgPosterMd} />
    <img src={imgPoster} alt="" className="hero-poster" aria-hidden="true" fetchPriority="high" />
  </picture>
  <video className="hero-video" id="heroVideo" muted loop playsInline disablePictureInPicture preload="none" ref={heroVideoRef} />
  <div className="hero-overlay"></div>

  <div className="hero-content hero-content--centered">

      <div className="hero-pills-row hero-pills-row--center">
        <div className="hero-pill hero-pill--metric-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Best Price Guaranteed</span>
        </div>
      </div>

      <h1>Discover <span className="accent">Nusa Penida</span></h1>

      <p className="hero-subtitle">
        Manta rays, snorkeling, diving, and a land tour – all in one unforgettable day from Bali.
      </p>

      <p className="hero-pricing">
        From <strong>$80</strong>/person&nbsp; ·&nbsp; Private boats from <strong>$750</strong>
      </p>

      <div className="hero-cta-row">
<a href="#tours" className="hero-cta hero-cta--outline">Explore Tours</a>
      </div>

      <div className="hero-ratings-bar">
        <div className="hero-rating-col">
          <span className="hero-rating-score">4.9</span>
          <span className="hero-rating-stars">★★★★★</span>
          <span className="hero-rating-label">Google</span>
        </div>
        <div className="hero-rating-col">
          <span className="hero-rating-score">4.9</span>
          <span className="hero-rating-stars">★★★★★</span>
          <span className="hero-rating-label">TripAdvisor</span>
        </div>
        <div className="hero-rating-col">
          <span className="hero-rating-score">4.9</span>
          <span className="hero-rating-stars">★★★★★</span>
          <span className="hero-rating-label">Airbnb</span>
        </div>
        <div className="hero-rating-divider"></div>
        <div className="hero-rating-col hero-rating-col--total">
          <span className="hero-rating-score hero-rating-score--big">10,000+</span>
          <span className="hero-rating-label">Total Reviews</span>
        </div>
      </div>

      <div className="hero-explore-cue">
        <div className="hero-explore-line"></div>
        <span className="hero-explore-text">Explore</span>
      </div>

  </div>
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

    <div className="sku-grid sku-grid--minimal">
      {/* Shared Tour */}
      <a href={utmUrl("/shared-tour-to-nusa-penida")} id="shared-tour-card" className="sku-minimal animate-in">
        <img className="sku-minimal__img" src={imgShared} alt="Shared yacht tour" loading="lazy" />
        <div className="sku-minimal__overlay"></div>
        <span className="sku-minimal__badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Best Value</span>
        <div className="sku-minimal__content">
          <h3 className="sku-minimal__title">Shared Tour</h3>
          <p className="sku-minimal__desc">Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and smooth from pickup to drop-off.</p>
          <div className="sku-minimal__separator"></div>
          <div className="sku-minimal__footer">
            <div className="sku-minimal__meta">
              <span>Up to 13 guests</span>
              <span>Fixed departure</span>
            </div>
            <div className="sku-minimal__price">from <strong>$80</strong> <span>/ person</span></div>
          </div>
        </div>
      </a>

      {/* Private Charter */}
      <a href={utmUrl("/private-tour-to-nusa-penida")} id="private-charter-card" className="sku-minimal sku-minimal--delay animate-in">
        <img className="sku-minimal__img" src={imgPrivate} alt="Private yacht charter" loading="lazy" />
        <div className="sku-minimal__overlay"></div>
        <span className="sku-minimal__badge sku-minimal__badge--blue"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg> Most Popular</span>
        <div className="sku-minimal__content">
          <h3 className="sku-minimal__title">Private Charter</h3>
          <p className="sku-minimal__desc">The entire boat is yours. Choose the timing, adjust the stops, and set the pace for your group or family.</p>
          <div className="sku-minimal__separator"></div>
          <div className="sku-minimal__footer">
            <div className="sku-minimal__meta">
              <span>2-45 guests</span>
              <span>Flexible routing</span>
            </div>
            <div className="sku-minimal__price">from <strong>$750</strong> <span>/boat</span></div>
          </div>
        </div>
      </a>
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
        <a href={utmUrl("/gallery")} className="gallery-show-all-btn">
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
        <div className="count">10,000+ reviews</div>
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
        <a href={utmUrl("/faq")} className="btn-ghost">See all questions →</a>
      </div>
    </div>
  </div>
</section>



{/* ═══════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════ */}
<footer className="footer">
  <div className="container">
    <div className="footer-grid">
      <div className="footer-col">
        <div className="footer-logo">
          <svg width="120" height="26" viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#footClip)">
              <path d="M8.55478 6.47086C5.92052 4.49424 1.1896 2.89157 0.571354 6.47086C0.221911 8.47419 -0.0468934 12.561 0.00686701 16.7279C0.114388 26.9315 0.275669 28.1335 1.21648 28.8547C1.4584 29.0417 1.7272 29.1753 2.02288 29.2821C6.80757 30.8581 11.431 23.4057 12.8556 20.2805C14.9523 15.7129 13.0438 9.83645 8.55478 6.47086Z" fill="#2E53D9"/>
              <path d="M29.711 3.6661C25.9477 -0.0734532 21.5394 0.0868102 15.2763 0.00667695C11.1636 0.00667695 5.57252 -0.0200325 2.7501 0.0333897C0.196474 0.00667858 0.357756 0.460767 2.34689 1.23539C2.64258 1.34223 2.93825 1.47579 3.20706 1.60934C5.30371 2.62436 7.61542 3.98663 9.55079 5.50916C12.5614 7.7796 15.3032 11.0918 18.2869 12.7479C21.1093 14.3505 25.0876 15.1519 28.0444 14.0567C32.5334 12.6143 32.8291 6.63103 29.711 3.6661Z" fill="#2E53D9"/>
              <path d="M22.5062 16.7003C18.1785 18.116 13.9314 21.0275 11.8078 24.9006C8.66289 31.1243 19.7644 30.1627 23.6352 29.5483C28.3661 28.8004 32.2906 26.6101 33.4464 22.3363C34.8711 15.9257 28.2586 14.5901 22.5062 16.7003Z" fill="#2E53D9"/>
              <path d="M62.6931 13.8691C66.5101 10.8507 64.9241 3.47852 58.0697 3.47852H41.2695V24.1796C41.2695 25.2213 42.1028 26.0761 43.1243 26.0761H59.0105C67.424 26.1028 69.1712 16.3265 62.6931 13.8691ZM45.194 7.32492H58.0428C61.4297 7.32492 61.1609 12.7472 58.0697 12.7472H45.194V7.32492ZM59.0105 22.2564H45.194V16.1395H58.8492C63.7145 16.1663 63.4188 22.2564 59.0105 22.2564Z" fill="#2E53D9"/>
              <path d="M68.418 5.40172V26.1829H70.4878C71.5092 26.1829 72.3425 25.3282 72.3425 24.2864V3.47852H70.2727C69.2513 3.50523 68.418 4.33328 68.418 5.40172Z" fill="#2E53D9"/>
              <path d="M95.2169 21.3484V8.04624L93.0127 8.07296C92.0451 8.07296 91.2655 8.84758 91.2655 9.80918V19.9861C91.2655 20.2265 91.1849 20.4402 91.0505 20.6272C90.1634 21.8559 88.5506 22.7908 85.9701 22.7908C82.2875 22.7908 78.8737 21.562 78.8737 17.9828V8.01953H76.6964C75.7287 8.01953 74.9492 8.79415 74.9492 9.75575V17.9828C74.9492 24.34 80.0833 26.5036 85.7551 26.5036C90.271 26.5036 93.0127 24.2064 93.6847 23.5921C94.4374 22.9243 95.2438 22.2832 95.2169 21.3484Z" fill="#2E53D9"/>
              <path d="M136.101 8.04624V18.0095C136.101 21.5888 132.66 22.8175 129.005 22.8175C126.424 22.8175 124.838 21.8826 123.924 20.6539C123.79 20.4669 123.709 20.2532 123.709 20.0128V9.83588C123.709 8.87428 122.93 8.09966 121.962 8.09966L119.758 8.01953V21.3216C119.758 22.2565 120.537 22.9243 121.263 23.5921C121.935 24.2064 124.677 26.5036 129.193 26.5036C134.864 26.5036 139.999 24.34 139.999 17.9828V9.75575C139.999 8.79415 139.219 8.01953 138.251 8.01953L136.101 8.04624Z" fill="#2E53D9"/>
              <path d="M117.691 21.3484V8.01953L115.487 8.04624C114.519 8.04624 113.739 8.82087 113.739 9.78246V19.906C113.739 20.1731 113.659 20.4135 113.471 20.6272C112.691 21.5353 111.105 22.7908 107.449 22.7908C104.358 22.7908 102.342 21.5888 101.482 20.6539C101.294 20.4669 101.213 20.1998 101.213 19.9327V9.78246C101.213 8.82087 100.434 8.04624 99.4659 8.04624L97.2617 8.01953V21.3216C97.2617 22.0161 97.9337 23.0312 98.7133 23.5654C100.944 25.1146 102.96 26.1831 105.89 26.3967C106.939 26.5036 107.396 26.4769 108.551 26.4235C108.551 26.4235 113.39 26.2365 116.159 23.5654C116.938 22.9243 117.691 22.0161 117.691 21.3484Z" fill="#2E53D9"/>
            </g>
            <defs><clipPath id="footClip"><rect width="140" height="30" fill="white"/></clipPath></defs>
          </svg>
        </div>
        <p>Award-winning Nusa Penida day tours from Bali. Comfort-first boats, certified guides, and all-inclusive packages.</p>
        <p>Jl. Tukad Punggawa No.238, Serangan, Denpasar Selatan, Bali 80228</p>
      </div>
      <div className="footer-col">
        <p className="footer-col-title">Tours</p>
        <a href={utmUrl("/private-tour-to-nusa-penida")}>Private tour</a>
        <a href={utmUrl("/shared-tour-to-nusa-penida")}>Shared tour</a>
        <a href={utmUrl("/reviews")}>Reviews</a>
        <a href={utmUrl("/faq")}>FAQ</a>
      </div>
      <div className="footer-col">
        <p className="footer-col-title">Legal</p>
        <a href={utmUrl("/policy/privacy")}>Privacy Policy</a>
        <a href={utmUrl("/policy/payment")}>Payment Policy</a>
        <a href={utmUrl("/policy/cancellation")}>Cancellation Policy</a>
        <a href={utmUrl("/policy/health")}>Health &amp; Safety</a>
      </div>
      <div className="footer-col">
        <p className="footer-col-title">Connect</p>
        <a href={waLink} target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://www.instagram.com/bluuu.tours/" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@bluuu_tours" target="_blank" rel="noopener">YouTube</a>

      </div>
    </div>

    <div className="footer-bottom">
      <p>© 2026 Bluuu Inc. All rights reserved.</p>
      <p>USD</p>
    </div>
  </div>
</footer>


{/* ═══════════════════════════════════════
     FLOATING WHATSAPP
     ═══════════════════════════════════════ */}
<a href={waLink} className="float-wa" target="_blank" rel="noopener" id="floatWa" aria-label="Chat with us on WhatsApp">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  <span>Chat with us</span>
</a>


{/* ═══════════════════════════════════════
     SCRIPTS
     ═══════════════════════════════════════ */}

    </div>
  );
};

export default Home3;
