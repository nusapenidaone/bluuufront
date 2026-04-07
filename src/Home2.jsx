import React, { useState, useEffect, useRef } from 'react';

const Home2 = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const heroVideoRef = useRef(null);

  // Navbar scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force video autoplay
  useEffect(() => {
    if (heroVideoRef.current) {
      const playVideo = () => {
        heroVideoRef.current.play().catch(() => {
          const startPlay = () => {
             heroVideoRef.current.play();
             document.removeEventListener('touchstart', startPlay);
             document.removeEventListener('click', startPlay);
          };
          document.addEventListener('touchstart', startPlay, { once: true });
          document.addEventListener('click', startPlay, { once: true });
        });
      };
      playVideo();
    }
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const animatedElements = document.querySelectorAll('.animate-in');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('hero-', '');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHeroFormSubmit = () => {
    const { name, email, whatsapp } = formData;
    if (!name || !email || !whatsapp) {
      alert('Please fill in all fields.');
      return;
    }

    setFormSubmitted(true);

    const msg = encodeURIComponent(
      `Hi Bluuu! I'd like to book a tour.\n\nName: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}`
    );
    window.open(`https://wa.me/6281370262777?text=${msg}`, '_blank');
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="font-body text-secondary-600 bg-white">
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 left-0 right-0 h-16 z-100 flex items-center px-6 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto w-full flex items-center justify-between">
          <a href="https://bluuu.tours" className="flex items-center">
            <svg width="140" height="30" viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#navLogoClip)">
                <path d="M8.55478 6.47086C5.92052 4.49424 1.1896 2.89157 0.571354 6.47086C0.221911 8.47419 -0.0468934 12.561 0.00686701 16.7279C0.114388 26.9315 0.275669 28.1335 1.21648 28.8547C1.4584 29.0417 1.7272 29.1753 2.02288 29.2821C6.80757 30.8581 11.431 23.4057 12.8556 20.2805C14.9523 15.7129 13.0438 9.83645 8.55478 6.47086Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M29.711 3.6661C25.9477 -0.0734532 21.5394 0.0868102 15.2763 0.00667695C11.1636 0.00667695 5.57252 -0.0200325 2.7501 0.0333897C0.196474 0.00667858 0.357756 0.460767 2.34689 1.23539C2.64258 1.34223 2.93825 1.47579 3.20706 1.60934C5.30371 2.62436 7.61542 3.98663 9.55079 5.50916C12.5614 7.7796 15.3032 11.0918 18.2869 12.7479C21.1093 14.3505 25.0876 15.1519 28.0444 14.0567C32.5334 12.6143 32.8291 6.63103 29.711 3.6661Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M22.5062 16.7003C18.1785 18.116 13.9314 21.0275 11.8078 24.9006C8.66289 31.1243 19.7644 30.1627 23.6352 29.5483C28.3661 28.8004 32.2906 26.6101 33.4464 22.3363C34.8711 15.9257 28.2586 14.5901 22.5062 16.7003Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M62.6931 13.8691C66.5101 10.8507 64.9241 3.47852 58.0697 3.47852H41.2695V24.1796C41.2695 25.2213 42.1028 26.0761 43.1243 26.0761H59.0105C67.424 26.1028 69.1712 16.3265 62.6931 13.8691ZM45.194 7.32492H58.0428C61.4297 7.32492 61.1609 12.7472 58.0697 12.7472H45.194V7.32492ZM59.0105 22.2564H45.194V16.1395H58.8492C63.7145 16.1663 63.4188 22.2564 59.0105 22.2564Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M68.418 5.40172V26.1829H70.4878C71.5092 26.1829 72.3425 25.3282 72.3425 24.2864V3.47852H70.2727C69.2513 3.50523 68.418 4.33328 68.418 5.40172Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M95.2169 21.3484V8.04624L93.0127 8.07296C92.0451 8.07296 91.2655 8.84758 91.2655 9.80918V19.9861C91.2655 20.2265 91.1849 20.4402 91.0505 20.6272C90.1634 21.8559 88.5506 22.7908 85.9701 22.7908C82.2875 22.7908 78.8737 21.562 78.8737 17.9828V8.01953H76.6964C75.7287 8.01953 74.9492 8.79415 74.9492 9.75575V17.9828C74.9492 24.34 80.0833 26.5036 85.7551 26.5036C90.271 26.5036 93.0127 24.2064 93.6847 23.5921C94.4374 22.9243 95.2438 22.2832 95.2169 21.3484Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M136.101 8.04624V18.0095C136.101 21.5888 132.66 22.8175 129.005 22.8175C126.424 22.8175 124.838 21.8826 123.924 20.6539C123.79 20.4669 123.709 20.2532 123.709 20.0128V9.83588C123.709 8.87428 122.93 8.09966 121.962 8.09966L119.758 8.01953V21.3216C119.758 22.2565 120.537 22.9243 121.263 23.5921C121.935 24.2064 124.677 26.5036 129.193 26.5036C134.864 26.5036 139.999 24.34 139.999 17.9828V9.75575C139.999 8.79415 139.219 8.01953 138.251 8.01953L136.101 8.04624Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
                <path d="M117.691 21.3484V8.01953L115.487 8.04624C114.519 8.04624 113.739 8.82087 113.739 9.78246V19.906C113.739 20.1731 113.659 20.4135 113.471 20.6272C112.691 21.5353 111.105 22.7908 107.449 22.7908C104.358 22.7908 102.342 21.5888 101.482 20.6539C101.294 20.4669 101.213 20.1998 101.213 19.9327V9.78246C101.213 8.82087 100.434 8.04624 99.4659 8.04624L97.2617 8.01953V21.3216C97.2617 22.0161 97.9337 23.0312 98.7133 23.5654C100.944 25.1146 102.96 26.1831 105.89 26.3967C106.939 26.5036 107.396 26.4769 108.551 26.4235C108.551 26.4235 113.39 26.2365 116.159 23.5654C116.938 22.9243 117.691 22.0161 117.691 21.3484Z" fill={isScrolled ? "#2E53D9" : "#FFFFFF"} />
              </g>
              <defs><clipPath id="navLogoClip"><rect width="140" height="30" fill="white" /></clipPath></defs>
            </svg>
          </a>
          <div className="flex items-center gap-3">
            <a href="#faq" className="text-sm font-semibold opacity-80 transition-opacity hover:opacity-100" style={{ color: isScrolled ? 'var(--secondary-900)' : 'white' }}>FAQ</a>
            <a href="#hero" className="text-sm font-semibold opacity-80 transition-opacity hover:opacity-100" style={{ color: isScrolled ? 'var(--secondary-900)' : 'white' }}>Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[100dvh] flex flex-col overflow-hidden" id="hero">
        <video 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          ref={heroVideoRef} autoPlay muted loop playsInline disablePictureInPicture preload="auto" poster="https://bluuu.tours/storage/app/media/images/hero-poster.jpg"
        >
          <source src="https://bluuu.tours/storage/app/media/video-xl.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/70 z-10"></div>

        <div className="relative z-20 flex-1 flex flex-col lg:flex-row items-center lg:items-end gap-12 max-w-screen-xl mx-auto w-full px-6 pt-24 lg:pt-0 pb-10">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2" style={{ minHeight: '40px' }}>
              <div className="elfsight-app-59bf9aa3-92ce-4654-aa87-9f5050b2af3a flex items-center" data-elfsight-app-lazy />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold font-heading leading-tight lg:leading-[56px] tracking-tight lg:tracking-[-1.8px] text-white max-w-[560px] mb-5">
              The best day of your Bali trip doesn't happen <span className="text-primary-300">in Bali.</span>
            </h1>

            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                9,000+ reviews
              </div>
              <span className="w-0.75 h-0.75 rounded-full bg-white/35 shrink-0 hidden sm:block"></span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" /><line x1="12" y1="16" x2="12" y2="8" /></svg>
                TripAdvisor Travelers' Choice
              </div>
              <span className="w-0.75 h-0.75 rounded-full bg-white/35 shrink-0 hidden sm:block"></span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Licensed & Insured
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[380px] shrink-0 bg-white/95 backdrop-blur-2xl rounded-4xl p-7 shadow-2xl animate-in" id="heroFormCard">
            {!formSubmitted ? (
               <div id="heroFormInner" className="flex flex-col">
                 <h3 className="text-lg font-bold text-secondary-900 mb-1">Plan your adventure</h3>
                 <p className="text-xs text-secondary-500 mb-5 leading-relaxed">Leave your details — we'll reply on WhatsApp within 30 minutes.</p>
                 <div className="mb-3.5">
                   <label htmlFor="hero-name" className="block text-xs font-semibold text-secondary-900 mb-1.5">Full Name</label>
                   <input 
                    type="text" id="hero-name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Sarah Mitchell" autoComplete="name"
                    className="w-full h-11 px-3.5 text-sm font-body text-secondary-900 bg-neutral-50 border border-neutral-200 rounded-lg outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-600/10 placeholder:text-neutral-400"
                   />
                 </div>
                 <div className="mb-3.5">
                   <label htmlFor="hero-email" className="block text-xs font-semibold text-secondary-900 mb-1.5">Email</label>
                   <input 
                    type="email" id="hero-email" value={formData.email} onChange={handleInputChange} placeholder="e.g. sarah@email.com" autoComplete="email"
                    className="w-full h-11 px-3.5 text-sm font-body text-secondary-900 bg-neutral-50 border border-neutral-200 rounded-lg outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-600/10 placeholder:text-neutral-400"
                   />
                 </div>
                 <div className="mb-3.5">
                   <label htmlFor="hero-whatsapp" className="block text-xs font-semibold text-secondary-900 mb-1.5">WhatsApp Number</label>
                   <input 
                    type="tel" id="hero-whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="e.g. +1 555 123 4567" autoComplete="tel"
                    className="w-full h-11 px-3.5 text-sm font-body text-secondary-900 bg-neutral-50 border border-neutral-200 rounded-lg outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-600/10 placeholder:text-neutral-400"
                   />
                 </div>
                 <button 
                  type="button" onClick={handleHeroFormSubmit}
                  className="w-full flex items-center justify-center gap-1.5 h-12 bg-primary-600 text-white text-[15px] font-bold rounded-full transition-colors hover:bg-primary-700 mt-1"
                 >
                   Send my inquiry &rarr;
                 </button>
                 <p className="text-[12px] text-secondary-400 text-center mt-2.5">No spam. No payment required.</p>
               </div>
            ) : (
               <div className="text-center py-8 flex flex-col items-center">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                 <h3 className="text-[17px] font-bold text-secondary-900 mt-3">Thanks! We'll be in touch.</h3>
                 <p className="text-sm text-secondary-500 mt-1">Check your WhatsApp shortly.</p>
               </div>
            )}
          </div>
        </div>

        {/* Value props strip */}
        <div className="relative z-20 bg-white py-8 shrink-0 border-b border-neutral-200 hidden lg:block">
          <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-3 gap-0">
            <div className="flex items-start gap-3.5 px-6 border-r border-neutral-200 first:pl-0">
              <div className="w-9 h-9 flex items-center justify-center text-primary-600 shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-secondary-900 leading-tight mb-0.5">Best Price Guaranteed</h4>
                <p className="text-[13px] text-secondary-500 leading-relaxed">We match or beat any OTA price</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5 px-6 border-r border-neutral-200">
              <div className="w-9 h-9 flex items-center justify-center text-primary-600 shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-secondary-900 leading-tight mb-0.5">No hidden fees</h4>
                <p className="text-[13px] text-secondary-500 leading-relaxed">What you see is what you pay</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5 px-6 border-none last:pr-0">
              <div className="w-9 h-9 flex items-center justify-center text-primary-600 shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-secondary-900 leading-tight mb-0.5">Website-exclusive perks</h4>
                <p className="text-[13px] text-secondary-500 leading-relaxed">Free extras not available on OTAs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-in">
            <div className="text-xs font-bold tracking-widest uppercase text-primary-600 mb-3">INCLUDED</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900 mb-3">Everything you want is already <span className="text-primary-600">covered</span></h2>
            <p className="text-lg text-secondary-500">Simple, transparent inclusions — so you can focus on the day, not the fine print.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
            {[
               { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-600"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>, title: "Comfort yacht", desc: "Premium boats with shade, cushions, and a smooth ride" },
               { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-600"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>, title: "Curated lunch", desc: "Clifftop restaurant with ocean views and local cuisine" },
               { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, title: "Land highlights", desc: "Kelingking Cliff, Angel's Billabong, and more photo stops" },
               { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-600"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>, title: "Underwater GoPro", desc: "Capture every moment underwater with a rental GoPro" },
               { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-600"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, title: "Snorkeling equipment", desc: "Full gear provided — mask, fins, and life jacket" },
               { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-600"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>, title: "All entrance tickets", desc: "Every fee handled — nothing extra to pay on the day" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-start gap-3.5 p-8 bg-white border-r border-b border-neutral-200 hover:bg-neutral-50 transition-colors animate-in last:border-b-0 md:last:border-b-0 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(n+4)]:border-b-0">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">{item.icon}</div>
                <div>
                  <h4 className="text-base font-bold text-secondary-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-secondary-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOUR OPTIONS */}
      <section className="py-20 bg-neutral-100" id="tours">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-in">
            <div className="text-xs font-bold tracking-widest uppercase text-primary-600 mb-3">TWO WAYS TO EXPLORE</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900 mb-3">Choose your <span className="text-primary-600">tour type</span></h2>
            <p className="text-lg text-secondary-500">Same island, same iconic spots, different experience. Pick the format that fits your group best.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shared Tour */}
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow animate-in">
              <div className="flex items-center justify-center gap-1.5 py-2.5 bg-secondary-900 text-white text-[12px] font-bold tracking-widest uppercase">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                BEST VALUE
              </div>
              <img className="w-full h-[220px] object-cover" src="https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp" alt="Shared speedboat tour" loading="lazy" />
              <div className="p-7 md:p-8">
                <div className="text-[12px] font-bold tracking-widest uppercase text-secondary-500 mb-2">JOIN A SMALL GROUP</div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">Shared Tour</h3>
                <p className="text-sm md:text-base text-secondary-500 mb-5 leading-relaxed">Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and smooth from pickup to drop-off.</p>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-5 flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5 text-sm text-secondary-900 leading-snug">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    One shared speedboat for up to <strong>10 guests</strong>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-secondary-900 leading-snug">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <strong>Fixed departure time</strong> with fellow travellers onboard
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm text-secondary-500">from</span>
                    <span className="text-3xl font-bold text-secondary-900 tracking-tight">$77</span>
                    <span className="text-sm text-secondary-500">/ person</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-success ml-auto">ALL INCLUSIVE</span>
                  </div>
                  <div className="text-[13px] text-secondary-500 leading-relaxed italic">Lunch, snorkeling gear, guide, and boat ride included. No hidden fees.</div>
                </div>
                <a href="https://bluuu.tours/new/shared" className="flex items-center justify-center w-full h-12 border border-primary-200 text-primary-600 text-[15px] font-bold rounded-xl transition-colors hover:bg-primary-50">See tour details &rarr;</a>
                <div className="text-center text-[10px] font-bold tracking-widest uppercase text-secondary-400 mt-2.5">NO PAYMENT REQUIRED TO VIEW OPTIONS</div>
              </div>
            </div>

            {/* Private Charter */}
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 text-white text-[12px] font-bold tracking-widest uppercase">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                MOST POPULAR
              </div>
              <img className="w-full h-[220px] object-cover" src="https://bluuu.tours/storage/app/media/image-30-1.jpg" alt="Private yacht charter" loading="lazy" />
              <div className="p-7 md:p-8">
                <div className="text-[12px] font-bold tracking-widest uppercase text-primary-600 mb-2">YOUR BOAT, YOUR RULES</div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">Private Charter</h3>
                <p className="text-sm md:text-base text-secondary-500 mb-5 leading-relaxed">The entire boat is yours. Choose the timing, adjust the stops, and set the pace for your group.</p>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-5 flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5 text-sm text-secondary-900 leading-snug">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                    <strong>20+ boats</strong> — speedboats to luxury yachts
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-secondary-900 leading-snug">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <strong>2–45 guests</strong> — pick the right boat for your group
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm text-secondary-500">from</span>
                    <span className="text-3xl font-bold text-secondary-900 tracking-tight">$859</span>
                    <span className="text-sm text-secondary-500">/ entire boat</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-[13px] text-secondary-400">=</span>
                    <span className="text-2xl font-bold text-primary-600 tracking-tight">$107</span>
                    <span className="text-sm text-secondary-500">/ person for 8 guests</span>
                  </div>
                </div>
                <a href="https://bluuu.tours/new/private" className="flex items-center justify-center w-full h-12 bg-primary-600 text-white text-[15px] font-bold rounded-xl transition-colors hover:bg-primary-700">Browse 20+ boats &rarr;</a>
                <div className="text-center text-[10px] font-bold tracking-widest uppercase text-secondary-400 mt-2.5">FROM SPEEDBOATS TO LUXURY YACHTS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 animate-in">
            <div className="text-xs font-bold tracking-widest uppercase text-primary-600 mb-3">TRUSTED BY TRAVELERS</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">A premium tour with <span className="text-primary-600">seamless flow</span></h2>
          </div>
          <div className="animate-in" style={{ marginBottom: '40px' }}>
            <div className="elfsight-app-1f614ea8-8602-4273-83b3-ab40c213a3d7" data-elfsight-app-lazy />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-white" id="faq">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-in">
            <div className="text-xs font-bold tracking-widest uppercase text-primary-600 mb-3">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-[820px] mx-auto bg-white border border-neutral-200 rounded-3xl p-2 px-8 pb-6 shadow-sm animate-in">
            <div className="flex flex-col">
              {[
                { q: "How to book your Nusa Penida tour?", a: "Choose your tour type (shared or private), select your comfort level and date, and complete your booking online. No upfront payment required to check availability — just pick your dates and we'll confirm within minutes." },
                { q: "Why we are more expensive than other companies?", a: "We invest in premium boats, certified senior guides, smaller group sizes, and all-inclusive packages so you don't worry about hidden costs. Our 4.9 rating across 10,000+ reviews reflects the experience quality." },
                { q: "Can I cancel or reschedule my tour?", a: "Yes! Free cancellation up to 24 hours before departure. If conditions are bad on the day (weather, tides), we'll reschedule at no cost or provide a full refund." }
              ].map((item, i) => (
                <div key={i} className={`border-b border-neutral-200 last:border-0`}>
                  <button className="w-full flex items-center justify-between py-[22px] bg-transparent text-[16px] font-semibold text-secondary-900 text-left gap-4 transition-colors hover:text-primary-600 group" onClick={() => toggleFaq(i)}>
                    <span className="flex-1">{item.q}</span>
                    <svg className={`shrink-0 transition-transform duration-300 text-secondary-400 ${openFaqIndex === i ? 'rotate-45' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-350 ease-in-out ${openFaqIndex === i ? 'max-h-[200px]' : 'max-h-0'}`}>
                    <p className="text-[15px] leading-relaxed text-secondary-500 pb-5">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <a href="https://bluuu.tours/new/faq" className="inline-flex items-center gap-1.5 bg-transparent text-primary-600 text-[15px] font-bold transition-opacity hover:opacity-80">See all questions &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-20 border-t border-neutral-200">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="flex flex-col">
              <div className="mb-4">
                 <svg width="120" height="26" viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <g clipPath="url(#footLogoClip)">
                     <path d="M8.55478 6.47086C5.92052 4.49424 1.1896 2.89157 0.571354 6.47086C0.221911 8.47419 -0.0468934 12.561 0.00686701 16.7279C0.114388 26.9315 0.275669 28.1335 1.21648 28.8547C1.4584 29.0417 1.7272 29.1753 2.02288 29.2821C6.80757 30.8581 11.431 23.4057 12.8556 20.2805C14.9523 15.7129 13.0438 9.83645 8.55478 6.47086Z" fill="#2E53D9" />
                     <path d="M29.711 3.6661C25.9477 -0.0734532 21.5394 0.0868102 15.2763 0.00667695C11.1636 0.00667695 5.57252 -0.0200325 2.7501 0.0333897C0.196474 0.00667858 0.357756 0.460767 2.34689 1.23539C2.64258 1.34223 2.93825 1.47579 3.20706 1.60934C5.30371 2.62436 7.61542 3.98663 9.55079 5.50916C12.5614 7.7796 15.3032 11.0918 18.2869 12.7479C21.1093 14.3505 25.0876 15.1519 28.0444 14.0567C32.5334 12.6143 32.8291 6.63103 29.711 3.6661Z" fill="#2E53D9" />
                     <path d="M22.5062 16.7003C18.1785 18.116 13.9314 21.0275 11.8078 24.9006C8.66289 31.1243 19.7644 30.1627 23.6352 29.5483C28.3661 28.8004 32.2906 26.6101 33.4464 22.3363C34.8711 15.9257 28.2586 14.5901 22.5062 16.7003Z" fill="#2E53D9" />
                     <path d="M62.6931 13.8691C66.5101 10.8507 64.9241 3.47852 58.0697 3.47852H41.2695V24.1796C41.2695 25.2213 42.1028 26.0761 43.1243 26.0761H59.0105C67.424 26.1028 69.1712 16.3265 62.6931 13.8691ZM45.194 7.32492H58.0428C61.4297 7.32492 61.1609 12.7472 58.0697 12.7472H45.194V7.32492ZM59.0105 22.2564H45.194V16.1395H58.8492C63.7145 16.1663 63.4188 22.2564 59.0105 22.2564Z" fill="#2E53D9" />
                     <path d="M68.418 5.40172V26.1829H70.4878C71.5092 26.1829 72.3425 25.3282 72.3425 24.2864V3.47852H70.2727C69.2513 3.50523 68.418 4.33328 68.418 5.40172Z" fill="#2E53D9" />
                     <path d="M95.2169 21.3484V8.04624L93.0127 8.07296C92.0451 8.07296 91.2655 8.84758 91.2655 9.80918V19.9861C91.2655 20.2265 91.1849 20.4402 91.0505 20.6272C90.1634 21.8559 88.5506 22.7908 85.9701 22.7908C82.2875 22.7908 78.8737 21.562 78.8737 17.9828V8.01953H76.6964C75.7287 8.01953 74.9492 8.79415 74.9492 9.75575V17.9828C74.9492 24.34 80.0833 26.5036 85.7551 26.5036C90.271 26.5036 93.0127 24.2064 93.6847 23.5921C94.4374 22.9243 95.2438 22.2832 95.2169 21.3484Z" fill="#2E53D9" />
                     <path d="M136.101 8.04624V18.0095C136.101 21.5888 132.66 22.8175 129.005 22.8175C126.424 22.8175 124.838 21.8826 123.924 20.6539C123.79 20.4669 123.709 20.2532 123.709 20.0128V9.83588C123.709 8.87428 122.93 8.09966 121.962 8.09966L119.758 8.01953V21.3216C119.758 22.2565 120.537 22.9243 121.263 23.5921C121.935 24.2064 124.677 26.5036 129.193 26.5036C134.864 26.5036 139.999 24.34 139.999 17.9828V9.75575C139.999 8.79415 139.219 8.01953 138.251 8.01953L136.101 8.04624Z" fill="#2E53D9" />
                     <path d="M117.691 21.3484V8.01953L115.487 8.04624C114.519 8.04624 113.739 8.82087 113.739 9.78246V19.906C113.739 20.1731 113.659 20.4135 113.471 20.6272C112.691 21.5353 111.105 22.7908 107.449 22.7908C104.358 22.7908 102.342 21.5888 101.482 20.6539C101.294 20.4669 101.213 20.1998 101.213 19.9327V9.78246C101.213 8.82087 100.434 8.04624 99.4659 8.04624L97.2617 8.01953V21.3216C97.2617 22.0161 97.9337 23.0312 98.7133 23.5654C100.944 25.1146 102.96 26.1831 105.89 26.3967C106.939 26.5036 107.396 26.4769 108.551 26.4235C108.551 26.4235 113.39 26.2365 116.159 23.5654C116.938 22.9243 117.691 22.0161 117.691 21.3484Z" fill="#2E53D9" />
                   </g>
                   <defs><clipPath id="footLogoClip"><rect width="140" height="30" fill="white" /></clipPath></defs>
                 </svg>
              </div>
              <p className="text-sm text-secondary-500 leading-relaxed mb-4">Award-winning Nusa Penida day tours from Bali. Comfort-first boats, certified guides, and all-inclusive packages.</p>
              <p className="text-sm text-secondary-500 leading-relaxed">Jl. Tukad Punggawa No.238, Serangan, Denpasar Selatan, Bali 80228</p>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold text-secondary-900 tracking-wider uppercase mb-4">Tours</h4>
              <a href="https://bluuu.tours/new/private" className="text-sm text-secondary-500 py-1 transition-colors hover:text-primary-600">Private tour</a>
              <a href="https://bluuu.tours/new/shared" className="text-sm text-secondary-500 py-1 transition-colors hover:text-primary-600">Shared tour</a>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold text-secondary-900 tracking-wider uppercase mb-4">Legal</h4>
              <a href="#" className="text-sm text-secondary-500 py-1 transition-colors hover:text-primary-600">Privacy Policy</a>
              <a href="#" className="text-sm text-secondary-500 py-1 transition-colors hover:text-primary-600">Cancellation Policy</a>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold text-secondary-900 tracking-wider uppercase mb-4">Connect</h4>
              <a href="https://wa.me/6281370262777" target="_blank" rel="noopener" className="text-sm text-secondary-500 py-1 transition-colors hover:text-primary-600">WhatsApp</a>
              <a href="mailto:info@bluuu.tours" className="text-sm text-secondary-500 py-1 transition-colors hover:text-primary-600">info@bluuu.tours</a>
            </div>
          </div>
          <div className="pt-6 pb-6 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
            <p className="text-[13px] text-secondary-400">&copy; 2026 Bluuu Inc. All rights reserved.</p>
            <p className="text-[13px] text-secondary-400">USD</p>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a 
        href="https://wa.me/6281370262777?text=Hi%20Bluuu!%20I%20saw%20your%20ad%20and%20want%20to%20book%20a%20tour" 
        className="fixed bottom-6 right-6 z-99 flex items-center gap-2.5 bg-[#25D366] text-white text-[15px] font-semibold px-5.5 py-3.5 rounded-full shadow-2xl transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/20"
        target="_blank" rel="noopener"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        <span className="hidden sm:inline">Chat with us</span>
      </a>

      {/* Scoped CSS for Scroll Animations */}
      <style>{`
        .animate-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity, transform;
        }
        .animate-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default Home2;
