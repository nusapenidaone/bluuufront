import{r as b,j as e,a as se,D as ve,R as je}from"./vendor-datepicker-DXD6OlhH.js";import{Q as ke,M as z,X as $,R as Ne,V as _e,Y as Ce,Z as Se,_ as De,f as K,J as Te,u as B,v as P,C as H,$ as Z,O as Me,i as Ie,n as Le,G as Ee,L as ie,a as oe,U,m as le,W as Pe,o as Re,B as ce,s as Ae,p as ze,F as $e,q as de,t as Y,r as me,S as Q,b as pe,E as Be,A as Fe}from"./vendor-icons-CYAkB8c7.js";import{Y as Oe}from"./vendor-phone-DFCs6RI7.js";import{q as ue}from"./index-CyvpR_b8.js";import{u as We,a as qe,A as he,m as A}from"./vendor-motion-DF4vK5ss.js";import"./fancybox-2yj6-1wp.js";let R=null;function G(){return R||(window.google?.maps?.places?(R=Promise.resolve(window.google),R):(R=new Promise((t,r)=>{const a=document.createElement("script");a.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC_RrKc9v7DS51etBhBRzRopKknc9jHhbs&libraries=places&loading=async",a.async=!0,a.onload=()=>t(window.google),a.onerror=()=>r(new Error("Google Maps failed to load")),document.head.appendChild(a)}),R))}const O={south:-9,west:114.4,north:-7.9,east:116},Ge={lat:-8.719,lng:115.169};function ft({value:t,onChange:r,placeholder:a,className:i}){const n=b.useRef(null),l=b.useRef(null),c=b.useRef(null),m=b.useRef(null),h=b.useRef(null),[f,p]=b.useState([]),[o,d]=b.useState(!1),[k,N]=b.useState(null),[g,S]=b.useState(!1),[v,C]=b.useState(null);b.useEffect(()=>{n.current&&document.activeElement!==n.current&&(n.current.value=t??"")},[t]);const _=b.useCallback(async x=>{if(!x||x.length<2){p([]);return}try{const y=await G(),s=new y.maps.LatLngBounds(new y.maps.LatLng(O.south,O.west),new y.maps.LatLng(O.north,O.east)),{suggestions:u}=await y.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({input:x,locationBias:s});p(u??[]),n.current&&C(n.current.getBoundingClientRect()),d(!0)}catch{p([])}},[]),w=x=>{const y=x.target.value;r(y),clearTimeout(h.current),h.current=setTimeout(()=>_(y),250)},T=async x=>{const y=x.placePrediction.mainText?.text??"",s=x.placePrediction.secondaryText?.text??"",u=s?`${y}, ${s}`:y;r(u),n.current&&(n.current.value=u),p([]),d(!1);try{const j=x.placePrediction.toPlace();await j.fetchFields({fields:["location"]});const L=j.location;L&&N({lat:L.lat(),lng:L.lng()})}catch{}},M=b.useCallback(async x=>{const y=await G(),s=new y.maps.Geocoder,{results:u}=await s.geocode({location:x});if(u?.[0]){const j=u[0].formatted_address;r(j),n.current&&(n.current.value=j)}},[r]);return b.useEffect(()=>{if(!g||!l.current)return;const x=k??Ge;G().then(y=>{c.current?(c.current.setCenter(x),k&&m.current&&m.current.setPosition(x)):(c.current=new y.maps.Map(l.current,{zoom:k?15:11,center:x,disableDefaultUI:!0,zoomControl:!0,gestureHandling:"cooperative",clickableIcons:!1}),c.current.addListener("click",s=>{const u={lat:s.latLng.lat(),lng:s.latLng.lng()};N(u),m.current?m.current.setPosition(u):(m.current=new y.maps.Marker({position:u,map:c.current,draggable:!0}),m.current.addListener("dragend",j=>{const L={lat:j.latLng.lat(),lng:j.latLng.lng()};N(L),M(L)})),M(u)}),k&&(m.current=new y.maps.Marker({position:x,map:c.current,draggable:!0}),m.current.addListener("dragend",s=>{const u={lat:s.latLng.lat(),lng:s.latLng.lng()};N(u),M(u)})))})},[g,k,M]),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("input",{ref:n,type:"text",defaultValue:t,onChange:w,onBlur:()=>{clearTimeout(h.current),setTimeout(()=>d(!1),150)},placeholder:a,className:i,autoComplete:"off"}),e.jsx("button",{type:"button",onClick:()=>S(x=>!x),title:g?"Hide map":"Show on map",className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-secondary-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",children:e.jsx(ke,{className:"h-4 w-4"})})]}),o&&f.length>0&&v&&se.createPortal(e.jsx("ul",{style:{position:"fixed",top:v.bottom+4,left:v.left,width:v.width,zIndex:9999},className:"overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg",children:f.map((x,y)=>{const s=x.placePrediction.mainText?.text??"",u=x.placePrediction.secondaryText?.text??"";return e.jsxs("li",{onMouseDown:()=>T(x),className:"flex cursor-pointer items-start gap-2 px-3 py-2.5 hover:bg-neutral-50",children:[e.jsx(z,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary-600"}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate font-medium text-secondary-900",children:s}),u&&e.jsx("div",{className:"truncate text-xs text-secondary-400",children:u})]})]},y)})}),document.body),g&&e.jsxs("div",{className:"mt-2 overflow-hidden rounded-lg border border-neutral-200",children:[e.jsx("div",{ref:l,className:"h-52 w-full"}),e.jsxs("div",{className:"flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 text-xs text-secondary-400",children:[e.jsx(z,{className:"h-3 w-3 shrink-0"}),"Нажмите на карту чтобы поставить точку, или перетащите маркер"]})]})]})}function D(...t){return t.filter(Boolean).join(" ")}const V=({isOpen:t,open:r,onClose:a,children:i,title:n,subTitle:l,subtitle:c,className:m="",maxWidth:h="max-w-xl",bodyClassName:f="",showClose:p=!0,closeOnBackdrop:o=!0,dark:d=!1,hideDragHandle:k=!1,footer:N})=>{const g=t??r,S=l??c,v=We(0),C=qe(v,[0,300],[1,0]);return b.useEffect(()=>{if(!g||typeof document>"u")return;const _=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=_}},[g]),b.useEffect(()=>{if(!g)return;const _=w=>{w.key==="Escape"&&(w.preventDefault(),a?.())};return window.addEventListener("keydown",_),()=>window.removeEventListener("keydown",_)},[g,a]),typeof document>"u"?null:se.createPortal(e.jsx(he,{children:g?e.jsxs(A.div,{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},children:[e.jsx(A.div,{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:C},onClick:o?a:void 0}),e.jsxs(A.div,{className:D("relative flex w-full flex-col overflow-hidden shadow-2xl",d?"bg-[#111d35] border border-white/10":"bg-white","rounded-t-3xl rounded-b-none max-h-[92dvh]","sm:rounded-3xl sm:max-h-[calc(100dvh-48px)]",h,m),style:{y:v},drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},dragListener:!1,onDragEnd:(_,w)=>{w.offset.y>80||w.velocity.y>500?a?.():v.set(0)},initial:{opacity:0,y:60},animate:{opacity:1,y:0},exit:{opacity:0,y:60},transition:{type:"spring",bounce:.15,duration:.4},children:[e.jsx(A.div,{className:D("flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden",k&&"hidden"),drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},style:{y:v,touchAction:"none"},onDragEnd:(_,w)=>{w.offset.y>80||w.velocity.y>500?a?.():v.set(0)},children:e.jsx("div",{className:D("h-1 w-10 rounded-full",d?"bg-white/20":"bg-neutral-300")})}),n||S||p?e.jsxs("div",{className:D("flex shrink-0 items-center justify-between gap-4 px-6 py-4 border-b",d?"bg-transparent border-white/10":"bg-white border-neutral-100"),children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[n?e.jsx("h3",{className:D("text-xl font-bold leading-tight",d?"text-white":"text-secondary-900"),children:n}):null,S?e.jsx("p",{className:D("mt-1 text-sm font-medium",d?"text-white/50":"text-secondary-500"),children:S}):null]}),p?e.jsx("button",{type:"button",onClick:a,className:D("ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all",d?"border-white/10 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white":"border-neutral-200/60 bg-white/90 text-secondary-500 hover:bg-white hover:text-secondary-900"),"aria-label":"Close modal",children:e.jsx($,{className:"h-4.5 w-4.5"})}):null]}):null,e.jsx("div",{className:D("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",f||"p-6"),children:i}),N&&e.jsx("div",{className:D("shrink-0 border-t px-6 py-4",d?"border-white/10 bg-[#111d35]":"border-neutral-100 bg-white"),children:N})]})]}):null}),document.body)},E=t=>t===!0||t===1||t==="1",bt=t=>{const r=t||{};return[{label:E(r.shade)?"Shade + flybridge":"Partial shade",present:!0,Icon:Ne},{label:E(r.cabin)?"Cabin":"No cabin",present:E(r.cabin),Icon:_e},{label:E(r.ac)?"AC":"No AC",present:E(r.ac),Icon:Ce},{label:E(r.sound)?"Sound system":"JBL Speaker",present:!0,Icon:Se},{label:E(r.toilet)?"Toilet":"No toilet",present:E(r.toilet),Icon:De}]},gt="https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",yt="https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg",He=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),Ue=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),l=He(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?l.replace(/\s+1$/,"").trim():l},Ke=t=>{if(!t||typeof t!="object")return"";const r=t.description||t.short_description||t.shortDescription||t.description_text||t.descriptionText||t.subtitle||t.helper||t.note||t.notes||t.details||t.desc||t.text||"";return Ue(r,{stripTrailingOne:!0})},Ye=t=>{if(!t||typeof t!="object")return"";const r=t.images_with_thumbs?.[0]||{},i=[t.image,t.image_url,t.imageUrl,t.thumb,t.thumbnail,t.cover,t.photo,r.thumb1,r.thumb,r.original,t.images?.[0],t.gallery?.[0]].find(n=>typeof n=="string"&&n.trim().length>0);return i?i.trim():""},wt=(t,{extraDescription:r="",fallbackDescription:a="Detailed information is available on request.",fallbackImage:i=""}={})=>({description:[Ke(t),r].filter(Boolean).join(`

`).trim()||a,image:Ye(t)||i}),vt=t=>t.size?t.size:t.length?t.length:"";let xe=(t,r)=>`IDR ${Number(t).toLocaleString()}`;const jt=t=>{xe=t};function kt(t){return xe(t,{fromCurrency:"IDR"})}function ee(t){if(!t)return"";const r=new Date(t);return Number.isNaN(r.getTime())?t:r.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function Nt(t,r){return!t||!r?"":`${ee(t)} - ${ee(r)}`}function Qe(t,r,a,i){if(!t||!i?.length)return null;const n=i.find(o=>Number(o.id)===Number(t));if(!n)return null;let l=r;r instanceof Date?l=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(l=new Date(r.startDate).toISOString().split("T")[0]);let c=n.packages?.pricelist||n.package?.pricelist||n.pricelist||[],m=Number(n.boat_price)||0;if(l&&n.pricesbydates?.length){const o=n.pricesbydates.find(d=>{const k=d.date_start,N=d.date_end;return l>=k&&l<=N});if(o){const d=o.packages||o.package;d?.pricelist&&(c=d.pricelist),o.boat_price!==void 0&&o.boat_price!==null&&(m=Number(o.boat_price))}}if(!c.length)return null;const h=String(a);let f=c.find(o=>String(o.members_count)===h);if(!f){const o=[...c].sort((d,k)=>Number(d.members_count)-Number(k.members_count));f=o.reverse().find(d=>Number(d.members_count)<=a)||o[0]}const p=Number(n.classes_id)===9||Number(n.classes_id)===10;return f?Number(f.price)+(p?0:m):null}function _t(t,r,a){if(!t||!r||!a?.length)return!1;const i=a.find(l=>Number(l.id)===Number(t));if(!i?.pricesbydates?.length)return!1;let n=r;return r instanceof Date?n=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(n=new Date(r.startDate).toISOString().split("T")[0]),i.pricesbydates.some(l=>l.flash_sale&&n>=l.date_start&&n<=l.date_end)}function Ct(t,r,a,i){return b.useMemo(()=>Qe(t,r,a,i),[t,r,a,i])}function St(t,r=600){const[a,i]=b.useState(!1),n=Array.isArray(t)?t.join(","):"";return b.useEffect(()=>{if(!t||!t.length){i(!0);return}let l=!1;const c=[...new Set(t.filter(Boolean))];let m=0,h=!1,f=!1;const p=()=>{!l&&h&&f&&i(!0)},o=()=>{m+=1,m>=c.length&&(h=!0,p())};c.forEach(N=>{const g=new Image;g.onload=o,g.onerror=o,g.src=N});const d=setTimeout(()=>{f=!0,p()},r),k=setTimeout(()=>{l||i(!0)},5e3);return()=>{l=!0,clearTimeout(d),clearTimeout(k)}},[n,r]),a}function Dt({images:t,alt:r,className:a,onOpenGallery:i,isLocked:n=!1,startIndex:l=0,alwaysShowControls:c=!1,maximizeLeft:m=!1}){const h=t?.length?t:[],f=h.length,p=Math.min(Math.max(l||0,0),Math.max(f-1,0)),[o,d]=b.useState(p),[k,N]=b.useState(()=>{const s=new Set;return s.add(p),p>0&&s.add(p-1),p<f-1&&s.add(p+1),s}),g=b.useRef(null),S=b.useRef(p),v=b.useRef(null),C=b.useRef(!1);b.useEffect(()=>{const s=g.current;s&&p>0&&(s.scrollLeft=p*s.offsetWidth)},[]);const _=b.useCallback(s=>{N(u=>{const j=new Set(u);return j.add(s),s>0&&j.add(s-1),s<f-1&&j.add(s+1),j})},[f]),w=b.useCallback(s=>{const u=g.current;if(!u||f<=1)return;const j=Math.max(0,Math.min(f-1,o+s));j!==o&&(u.scrollTo({left:j*u.offsetWidth,behavior:"smooth"}),_(j))},[o,f,_]),T=b.useCallback(()=>{const s=g.current;if(!s)return;const u=Math.round(s.scrollLeft/s.offsetWidth);u!==S.current&&u>=0&&u<f&&(S.current=u,d(u),_(u))},[f,_]);if(!f)return e.jsxs("div",{className:D("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400",a),children:[e.jsx(K,{className:"h-8 w-8 opacity-40"}),e.jsx("span",{className:"text-sm font-medium",children:"No photos yet"})]});const M=c?"absolute top-1/2 z-20 flex -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30":"absolute top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100",x=m?"left-3":"right-3",y=c?`absolute ${x} top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60`:`absolute ${x} top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60 opacity-0 group-hover:opacity-100`;return e.jsxs("div",{className:D("group relative w-full rounded-xl",!n&&"cursor-pointer"),onPointerDown:s=>{v.current={x:s.clientX},C.current=!1},onPointerMove:s=>{v.current&&Math.abs(s.clientX-v.current.x)>8&&(C.current=!0)},onClick:()=>{!n&&!C.current&&i?.(o)},children:[e.jsx("div",{ref:g,className:D("flex snap-x snap-mandatory rounded-xl",a),style:{overflowX:"scroll",scrollbarWidth:"none",msOverflowStyle:"none"},onScroll:n?void 0:T,children:h.map((s,u)=>{const j=s?.thumb||s?.path||s,L=s?.thumb_small||null;return e.jsx("div",{className:"flex-[0_0_100%] snap-center relative shrink-0 overflow-hidden",children:k.has(u)?e.jsx("img",{src:j,srcSet:L?`${L} 300w, ${j} 600w`:void 0,sizes:"(max-width: 640px) 100vw, 50vw",alt:u===o?r:"",className:D("absolute inset-0 h-full w-full object-cover transition-transform duration-500",u===o&&"group-hover:scale-[1.03]"),loading:"lazy",decoding:"async"}):e.jsx("div",{className:"absolute inset-0 bg-neutral-100 animate-pulse"})},u)})}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10 rounded-xl"}),!n&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:y,onClick:s=>{s.stopPropagation(),i?.(o)},"aria-label":"Expand Gallery",children:e.jsx(Te,{className:"h-4 w-4"})}),f>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:s=>{s.stopPropagation(),w(-1)},className:D(M,"left-2"),"aria-label":"Previous photo",children:e.jsx(B,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:s=>{s.stopPropagation(),w(1)},className:D(M,"right-2"),"aria-label":"Next photo",children:e.jsx(P,{className:"h-4 w-4"})})]})]})]})}function Tt({mode:t="single",selected:r,onSelect:a,minDate:i=(()=>{const o=new Date;return o.setHours(0,0,0,0),o})(),filterDate:n,onMonthChange:l,renderDayContents:c,className:m,inline:h=!1,fixedRangeDays:f=0,maxRangeDays:p=0}){const o=t==="range",[d,k]=b.useState(!1),[N,g]=b.useState(!1),[S,v]=b.useState(null);b.useEffect(()=>{const x=()=>{k(window.innerWidth<=768)};return x(),window.addEventListener("resize",x),()=>window.removeEventListener("resize",x)},[]);const C=x=>{if(o&&f>0){const[y]=x;if(y){const s=new Date(y);s.setDate(s.getDate()+f-1),a({from:y,to:s}),h||setTimeout(()=>g(!1),100)}}else if(o){const[y,s]=x;v(y&&!s?y:null);let u=s;if(s&&y&&p>0){const j=new Date(y.getTime()+(p-1)*24*60*60*1e3);s>j&&(u=j)}a({from:y,to:u}),u&&!h&&setTimeout(()=>g(!1),100)}else a(x),h||setTimeout(()=>g(!1),100)};let _=null,w=null;o?(r?.from&&(_=r.from instanceof Date?r.from:new Date(r.from)),r?.to&&(w=r.to instanceof Date?r.to:new Date(r.to))):r&&(_=r instanceof Date?r:new Date(r));const T=o&&p>0&&S&&!w?new Date(S.getTime()+(p-1)*24*60*60*1e3):void 0,M=d?1:o?2:1;return e.jsxs("div",{className:`premium-datepicker-wrapper${c?" has-custom-days":""}${h?" inline-mode":""}`,children:[e.jsx("style",{children:`
        .premium-datepicker-wrapper {
          position: relative;
          width: 100%;
        }

        .premium-datepicker-wrapper .react-datepicker-wrapper {
          width: 100%;
        }

        .premium-datepicker-wrapper .react-datepicker__input-container {
          width: 100%;
        }

        .premium-datepicker-wrapper .react-datepicker__input-container input {
          width: 100%;
          height: 56px;
          padding: 0 16px 0 48px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--secondary-900);
          background: white;
          border: 2px solid var(--neutral-100);
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        /* Mobile input adjustments */
        @media (max-width: 768px) {
          .premium-datepicker-wrapper .react-datepicker__input-container input {
            font-size: 0.8125rem;
            padding: 0 10px 0 40px;
          }
        }

        .premium-datepicker-wrapper .react-datepicker__input-container input:hover {
          border-color: var(--primary-200);
        }

        .premium-datepicker-wrapper .react-datepicker__input-container input:focus {
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px var(--primary-50);
        }

        .premium-datepicker-wrapper .date-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          z-index: 1;
        }

        .react-datepicker-popper {
          z-index: 999 !important;
        }

        .premium-datepicker-wrapper .react-datepicker {
          border: none;
          font-family: inherit;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.25);
          padding: 8px;
        }

        .premium-datepicker-wrapper.inline-mode .react-datepicker,
        .premium-datepicker-wrapper.inline-mode .react-datepicker__month-container {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }

        .premium-datepicker-wrapper.inline-mode .react-datepicker__header {
          background: transparent !important;
        }

        .premium-datepicker-wrapper .react-datepicker--inline {
          box-shadow: none !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          width: 100% !important;
          max-width: none !important;
        }

        .premium-datepicker-wrapper .react-datepicker--inline .react-datepicker {
          box-shadow: none !important;
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          max-width: none !important;
        }

        /* Mobile: reduce overall calendar size */
        @media (max-width: 768px) {
          .premium-datepicker-wrapper .react-datepicker {
            padding: 4px;
            border-radius: 12px;
          }
        }

        .premium-datepicker-wrapper .react-datepicker__header {
          background: white;
          border-bottom: none;
          padding-top: 20px;
        }

        .premium-datepicker-wrapper .react-datepicker__current-month {
          font-size: 1rem;
          font-weight: 800;
          color: var(--secondary-900);
          margin-bottom: 12px;
        }

        .premium-datepicker-wrapper .react-datepicker__day-name {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--secondary-300);
          width: 44px;
        }

        .premium-datepicker-wrapper .react-datepicker__day {
          width: 44px;
          height: 44px;
          line-height: 44px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--secondary-600);
          border-radius: 50%;
          margin: 2px;
          transition: all 0.2s;
        }

        .premium-datepicker-wrapper.has-custom-days .react-datepicker__day {
          height: 54px;
          line-height: normal;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px 0;
          gap: 1px;
        }

        .premium-datepicker-wrapper .day-number {
          line-height: 1;
          font-size: 0.9375rem;
          font-weight: 600;
        }

        .premium-datepicker-wrapper .day-sub {
          font-size: 0.5625rem;
          font-weight: 700;
          line-height: 1;
          opacity: 0.65;
        }

        .premium-datepicker-wrapper .react-datepicker__day:hover {
          background-color: var(--primary-50) !important;
          color: var(--primary-600) !important;
          border-radius: 50% !important;
        }

        .premium-datepicker-wrapper .react-datepicker__month {
          overflow: hidden;
        }

        .premium-datepicker-wrapper .react-datepicker__day--selected,
        .premium-datepicker-wrapper .react-datepicker__day--range-start,
        .premium-datepicker-wrapper .react-datepicker__day--range-end {
          background-color: var(--primary-600) !important;
          color: white !important;
          font-weight: 800;
          border-radius: 50% !important;
          position: relative;
          z-index: 1;
          transform: none !important;
        }

        .premium-datepicker-wrapper .react-datepicker__day--in-range {
          background-color: var(--primary-50);
          color: var(--primary-700);
          border-radius: 50%;
        }

        .premium-datepicker-wrapper .react-datepicker__day--in-range.react-datepicker__day--range-start,
        .premium-datepicker-wrapper .react-datepicker__day--in-range.react-datepicker__day--range-end {
          border-radius: 50% !important;
        }

        /* Hide outside-month days that bleed into range */
        .premium-datepicker-wrapper .react-datepicker__day--outside-month {
          visibility: hidden !important;
          pointer-events: none !important;
        }

        .premium-datepicker-wrapper .react-datepicker__day--keyboard-selected {
          background: none;
          border: none;
          outline: 2px solid var(--primary-600);
          outline-offset: -2px;
        }

        .premium-datepicker-wrapper .react-datepicker__day--disabled {
          opacity: 0.2;
          text-decoration: line-through;
        }

        .premium-datepicker-wrapper .react-datepicker__navigation {
          top: 24px;
        }

        .premium-datepicker-wrapper .react-datepicker__month-container {
          padding: 0 10px;
        }

        .premium-datepicker-wrapper .react-datepicker__triangle {
          display: none;
        }

        /* Responsive month layout */
        .premium-datepicker-wrapper .react-datepicker__month-wrapper {
          display: flex;
        }

        .premium-datepicker-wrapper .react-datepicker {
          display: flex;
        }

        .premium-datepicker-wrapper .react-datepicker__month-container {
          flex: 1;
        }

        /* Mobile: stack vertically */
        @media (max-width: 768px) {
          .premium-datepicker-wrapper .react-datepicker {
            flex-direction: column;
            width: 100% !important;
            max-width: 100%;
          }
          
          .premium-datepicker-wrapper .react-datepicker__month-container {
            width: 100%;
            padding: 0 4px;
          }

          .premium-datepicker-wrapper .react-datepicker__header {
            padding-top: 12px;
          }

          .premium-datepicker-wrapper .react-datepicker__current-month {
            font-size: 0.9375rem;
            margin-bottom: 8px;
          }

          .premium-datepicker-wrapper .react-datepicker__day-name {
            width: 42px;
            font-size: 0.6875rem;
          }

          .premium-datepicker-wrapper .react-datepicker__day {
            width: 42px;
            height: 42px;
            line-height: 42px;
            font-size: 0.875rem;
            margin: 1px;
          }

          .premium-datepicker-wrapper.has-custom-days .react-datepicker__day {
            height: 42px;
            line-height: normal;
          }

          .premium-datepicker-wrapper .day-number {
            font-size: 0.75rem;
          }

          .premium-datepicker-wrapper .day-sub {
            font-size: 0.5rem;
          }
        }

        /* Desktop: side by side */
        @media (min-width: 769px) {
          .premium-datepicker-wrapper .react-datepicker {
            flex-direction: row;
            gap: 1rem;
          }
        }
      `}),!h&&e.jsx(H,{className:"date-icon h-5 w-5 text-secondary-300"}),e.jsx(ve,{selected:_,startDate:_,endDate:w,onChange:C,minDate:i,maxDate:T,filterDate:n,onMonthChange:l,renderDayContents:c,selectsRange:o,monthsShown:M,dateFormat:"MMM d, yyyy",placeholderText:o?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:x=>x.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:h,open:h?void 0:N,openToDate:_||new Date,onInputClick:h?void 0:()=>g(!0),onClickOutside:h?void 0:()=>g(!1),onCalendarClose:h?void 0:()=>g(!1),renderCustomHeader:({monthDate:x,decreaseMonth:y,increaseMonth:s,prevMonthButtonDisabled:u,nextMonthButtonDisabled:j})=>e.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[e.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:x.toLocaleString("en-US",{month:"long",year:"numeric"})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:y,disabled:u,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(B,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:s,disabled:j,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(P,{className:"h-4 w-4"})})]})]})})]})}const Ve=`
.react-international-phone-input-container {
  width: 100%;
  display: flex;
}
.react-international-phone-input-container .react-international-phone-input {
  height: 2.625rem;
  width: 100%;
  border-radius: 0 0.5rem 0.5rem 0;
  border: 1px solid #e5e5e5;
  border-left: none;
  background: #fafafa;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #1a1a2e;
  padding: 0.625rem 0.75rem;
  outline: none;
  box-shadow: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.react-international-phone-input-container .react-international-phone-input:focus {
  border-color: var(--color-primary-600, #2563eb);
  box-shadow: 0 0 0 1px var(--color-primary-600, #2563eb);
}
.react-international-phone-input-container .react-international-phone-country-selector-button {
  height: 2.625rem;
  border-radius: 0.5rem 0 0 0.5rem;
  border: 1px solid #e5e5e5;
  border-right: 1px solid #e5e5e5;
  background: #fafafa;
  padding: 0 0.5rem 0 0.75rem;
  transition: background 0.15s;
}
.react-international-phone-input-container .react-international-phone-country-selector-button:hover {
  background: #f0f0f0;
}
.react-international-phone-input-container .react-international-phone-country-selector-button--active {
  border-color: var(--color-primary-600, #2563eb);
  box-shadow: 0 0 0 1px var(--color-primary-600, #2563eb);
}
.react-international-phone-input-container .react-international-phone-country-selector-dropdown {
  border-radius: 0.5rem;
  border: 1px solid #e5e5e5;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
  z-index: 50;
}
`;let te=!1;function Mt({value:t,onChange:r}){if(!te&&typeof document<"u"){const a=document.createElement("style");a.textContent=Ve,document.head.appendChild(a),te=!0}return e.jsx(Oe,{value:t,onChange:r,disableDialCodePrefill:!0})}function It(){const[t,r]=b.useState(null),{getPolicy:a}=ue(),i=b.useCallback(c=>{r(c)},[]),n=b.useCallback(()=>{r(null)},[]),l=t?a(t):null;return b.useEffect(()=>{const c=m=>i(m.detail);return window.addEventListener("open-policy",c),()=>window.removeEventListener("open-policy",c)},[i]),{activePolicyKey:t,activePolicy:l,openPolicy:i,closePolicy:n}}function Lt({activePolicyKey:t,activePolicy:r,onClose:a}){const{loading:i}=ue(),n=!!t,l=!!r?.html?.trim();return e.jsx(V,{isOpen:n,onClose:a,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:l?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"text-lg font-semibold text-secondary-900",children:r.title}),e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:r.subtitle})]}),e.jsx("button",{type:"button",onClick:a,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx($,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-secondary-600",children:e.jsx("div",{className:"policy-rich-content",dangerouslySetInnerHTML:{__html:r.html}})})]}):i?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0 animate-pulse space-y-2",children:[e.jsx("div",{className:"h-5 w-40 rounded bg-neutral-200"}),e.jsx("div",{className:"h-4 w-56 rounded bg-neutral-100"})]}),e.jsx("button",{type:"button",onClick:a,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx($,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5",children:e.jsx("div",{className:"animate-pulse space-y-3",children:Array.from({length:9}).map((c,m)=>e.jsx("div",{className:"h-4 rounded bg-neutral-100",style:{width:`${96-m%3*12}%`}},m))})})]}):e.jsx("div",{className:"px-6 py-6 text-sm text-secondary-500",children:"Policy not found."})})}function Et({restaurantData:t,onClose:r}){const a=t,i=a?.name||a?.title||a?.restaurant_name||"",n=a?.image||a?.images_with_thumbs?.[0]?.thumb||null,l=a?.description||"",c=a?.menu||"";return e.jsxs(V,{open:!!t,onClose:r,maxWidth:"max-w-2xl",showClose:!1,title:null,bodyClassName:"p-0",children:[e.jsxs("div",{className:"relative",children:[n?e.jsxs("div",{className:"relative h-52 sm:h-64 w-full overflow-hidden rounded-t-2xl",children:[e.jsx("img",{src:n,alt:i||"Restaurant",className:"h-full w-full object-cover",loading:"lazy",decoding:"async"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"}),e.jsxs("div",{className:"absolute bottom-0 left-0 right-0 p-5 sm:p-6",children:[e.jsx("h3",{className:"text-xl font-bold text-white sm:text-2xl",children:i}),e.jsxs("div",{className:"mt-1 flex items-center gap-1.5",children:[e.jsx(Z,{className:"h-3.5 w-3.5 text-white/70"}),e.jsx("span",{className:"text-sm font-medium text-white/80",children:"Included lunch"})]})]})]}):e.jsxs("div",{className:"px-5 pt-5 sm:px-6 sm:pt-6",children:[e.jsx("h3",{className:"text-xl font-bold text-secondary-900",children:i}),e.jsxs("div",{className:"mt-1 flex items-center gap-1.5 text-secondary-400",children:[e.jsx(Z,{className:"h-3.5 w-3.5"}),e.jsx("span",{className:"text-sm font-medium",children:"Included lunch"})]})]}),e.jsx("button",{type:"button",onClick:r,className:"absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition hover:bg-white/40","aria-label":"Close",children:e.jsx($,{className:"h-4 w-4"})})]}),e.jsxs("div",{className:"p-5 sm:p-6 space-y-4",children:[l&&e.jsx("p",{className:"text-sm leading-relaxed text-secondary-500",dangerouslySetInnerHTML:{__html:l}}),c&&e.jsx("div",{className:"restaurant-menu",dangerouslySetInnerHTML:{__html:c}})]})]})}const Xe={Clock:pe,MapPin:z,Ship:Q,Waves:me,UtensilsCrossed:Y,Anchor:de,Camera:K,Fish:$e,Sun:ze,Shield:Ae,BadgeCheck:ce,Coffee:Re,Wine:Pe,Star:le,Users:U,Sparkles:oe,LifeBuoy:ie,Globe:Ee,Ticket:Le,Car:Ie,Compass:Me},Je=t=>Xe[t]||null,Ze=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),W=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),l=Ze(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?l.replace(/\s+1$/,"").trim():l},re=t=>!t||typeof t!="object"?"":W(t.name||t.title||t.restaurant_name||t.restaurantName||"",{stripTrailingOne:!0}),ae=t=>!t||typeof t!="object"?"":W(t.description||t.short_description||t.shortDescription||t.details||t.menu||"",{stripTrailingOne:!0}),et=(t,r=null,a=null)=>{const i=W(t?.details,{stripTrailingOne:!0}),n=r&&typeof r=="object"?r:null,l=a&&typeof a=="object"?a:null,c=i&&(i.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||i.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",m=re(n)||re(l)||c,h=ae(n)||ae(l),f=i&&i!==String(t?.title||"").trim()&&i!==m?i:"",p=h||f,o=m||p?{...n||{},...l||{},name:m,description:p}:null;return{title:m?`Lunch at ${m}`:t?.title||"Lunch",description:p,popupRestaurant:o}},tt=(t="")=>{const r=String(t).toLowerCase();return r.includes("meet")||r.includes("pick")?z:r.includes("depart")||r.includes("boat")?Q:r.includes("snorkeling")||r.includes("swim")||r.includes("manta")?me:r.includes("lunch")||r.includes("food")?Y:r.includes("return")||r.includes("back")?de:r.includes("photo")?K:pe};function fe({item:t,onRestaurantClick:r,restaurant:a}){const i=t.icon_name&&Je(t.icon_name)||tt(t.title),n=W(t.details,{stripTrailingOne:!0}),l=/lunch/i.test(t.title),c=l?et(t):null,m=c?.title||t.title,h=l?c?.description:n,f=t.highlight==="premium"||t.highlight==="first-class"?t.highlight:t.is_premium==1||t.is_premium===!0?"premium":null,p=f==="premium",o=f==="first-class",d=t.time?t.time.replace(/\./g,":"):"";return e.jsxs("div",{className:`flex items-center gap-3 py-2.5 sm:py-3 min-h-[56px] ${p?"rounded-xl bg-indigo-50/60 px-2 -mx-2":o?"rounded-xl bg-emerald-50/60 px-2 -mx-2":""}`,children:[e.jsx("div",{className:`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${p?"bg-indigo-100 text-indigo-600":o?"bg-emerald-100 text-emerald-600":"bg-neutral-100 text-primary-600"}`,children:t.icon_svg?e.jsx("span",{className:"h-3.5 w-3.5 sm:h-4 sm:w-4 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current",dangerouslySetInnerHTML:{__html:t.icon_svg}}):e.jsx(i,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4",strokeWidth:1.5})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[e.jsx("span",{className:"text-base font-semibold text-secondary-900",children:m}),f&&e.jsxs("span",{className:`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none border ${p?"bg-indigo-500/15 text-indigo-600 border-indigo-300/50":"bg-emerald-500/15 text-emerald-600 border-emerald-300/50"}`,children:[e.jsx(oe,{className:"h-2 w-2"}),p?"Premium":"First Class"]})]}),h&&e.jsx("div",{className:"text-xs leading-normal text-secondary-500",children:h}),l&&a&&r&&e.jsx("button",{type:"button",onClick:()=>r(a),className:"mt-0.5 text-xs font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-2",children:"View menu"})]}),d&&e.jsx("div",{className:"shrink-0 text-right",children:e.jsx("div",{className:`text-sm font-bold tabular-nums ${p?"text-indigo-600":o?"text-emerald-600":"text-secondary-700"}`,children:d})})]})}function be({restaurant:t,onClick:r}){const a=t?.name||t?.title||t?.restaurant_name||t?.restaurantName||"";if(!a)return null;const i=t.image||t.images_with_thumbs?.[0]?.thumb||null;return e.jsxs("button",{type:"button",onClick:()=>r?.(t),className:"w-full min-h-[64px] flex items-center gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-neutral-300 hover:bg-white",children:[i?e.jsx("div",{className:"h-16 w-16 shrink-0",children:e.jsx("img",{src:i,alt:t.name,className:"h-full w-full object-cover"})}):e.jsx("div",{className:"h-16 w-16 shrink-0 bg-primary-50 flex items-center justify-center",children:e.jsx(Y,{className:"h-5 w-5 text-primary-300"})}),e.jsx("div",{className:"flex-1 min-w-0 px-3 py-2",children:e.jsx("div",{className:"text-sm font-bold text-secondary-900 truncate",children:a})}),e.jsxs("div",{className:"shrink-0 pr-3 text-sm font-semibold text-primary-600 flex items-center gap-1",children:["View menu",e.jsx(Be,{className:"h-3.5 w-3.5 text-primary-400"})]})]})}function Pt({isOpen:t,onClose:r,title:a,subtitle:i="Morning plan is similar for all styles. Afternoon changes by style.",note:n,schedule:l,isLoading:c=!1,restaurantData:m=null,routeRestaurant:h=null,onRestaurantClick:f,sectionLabels:p={beforeLunch:"Morning",afterLunch:"Afternoon"},allBoats:o=[],currentBoatId:d,onSwitchBoat:k}){const N=[{label:p.beforeLunch,items:l?.beforeLunch||[]},{label:p.afterLunch,items:l?.afterLunch||[]}].filter(w=>w.items.length>0),g=l?.footerNotes||[],S=o.findIndex(w=>w.id===d),v=o.length>1?o[(S-1+o.length)%o.length]:null,C=o.length>1?o[(S+1)%o.length]:null,_=(v||C)&&k;return e.jsx(V,{isOpen:t,onClose:r,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:e.jsxs("div",{className:"flex w-full flex-col overflow-hidden bg-white p-0 max-h-[85vh]",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-lg font-bold text-secondary-900",children:a?`${a} itinerary`:"Itinerary"}),i&&e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:i})]}),e.jsx("button",{type:"button",onClick:r,className:"p-2 hover:bg-neutral-100 rounded-full transition-colors -mr-2 -mt-2","aria-label":"Close",children:e.jsx($,{className:"w-5 h-5 text-secondary-500"})})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",children:c?e.jsx("div",{className:"flex items-center justify-center h-48",children:e.jsx("div",{className:"h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"})}):e.jsxs("div",{className:"grid gap-3 grid-cols-1",children:[n&&e.jsx("div",{className:"mb-1 rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm text-primary-600 font-medium",children:n}),N.map((w,T)=>e.jsxs(je.Fragment,{children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:w.label}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:w.items.map((M,x)=>e.jsx(fe,{item:M},`${w.label}-${x}`))})]}),T===0&&e.jsx(be,{restaurant:m,onClick:f})]},w.label)),g.length>0&&e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:g.map((w,T)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:w},T))})]})}),_&&e.jsxs("div",{className:"shrink-0 border-t border-neutral-100 bg-neutral-50/60 px-6 py-5 flex items-center justify-between",children:[v?e.jsxs("button",{type:"button",onClick:()=>k(v),className:"inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700",children:[e.jsx(B,{className:"h-4 w-4"}),v.name]}):e.jsx("span",{}),C?e.jsxs("button",{type:"button",onClick:()=>k(C),className:"inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700",children:[C.name,e.jsx(P,{className:"h-4 w-4"})]}):e.jsx("span",{})]})]})})}const ne=t=>t;function Rt({sectionTitle:t,style:r,schedule:a,note:i,restaurant:n,prevLabel:l,nextLabel:c,onPrev:m,onNext:h,infoTabs:f,infoContent:p,includedChips:o,isUnavailable:d,unavailableReason:k,onChangeParams:N,onReserve:g,priceDisplay:S,dateDisplay:v,guestsDisplay:C,capacityLabel:_,scheduleExtrasSlot:w,reserveLabel:T,extrasCatalog:M,allExtrasCatalog:x,selectedExtras:y,onChangeExtraQty:s,formatPrice:u,onOpenExtra:j,hideTierBadges:L,totalGuests:ot=1}){const[lt,ct]=b.useState(!1),X=/first.class/i.test(t||"")?"tier-first-class":/premium/i.test(t||"")?"tier-premium":"tier-classic";if(b.useEffect(()=>{const I=document.getElementById("tour-details-section");if(I)return I.classList.add("tour-section-light"),I.classList.remove("tier-classic","tier-premium","tier-first-class"),I.classList.add(X),()=>{I.classList.remove("tour-section-light","tier-classic","tier-premium","tier-first-class")}},[X]),!r)return null;const J=a?[{label:"Morning",items:a.beforeLunch||[]},{label:"Midday & Afternoon",items:a.afterLunch||[]}].filter(I=>I.items.length>0):[],q=m||h;return e.jsx(e.Fragment,{children:e.jsx("div",{className:"tour-details-light transition-colors duration-300",children:e.jsxs("div",{children:[e.jsx(he,{mode:"wait",children:e.jsxs(A.div,{initial:{opacity:0,x:30},animate:{opacity:1,x:0},exit:{opacity:0,x:-30},transition:{duration:.25,ease:"easeInOut"},children:[e.jsxs("div",{className:"pb-1 sm:pb-2",children:[e.jsx("div",{className:"hidden sm:block",children:e.jsxs("div",{className:"flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[t&&e.jsxs("h2",{className:"text-2xl font-bold text-white",children:[t," Details"]}),i&&e.jsx("div",{className:"mt-1",children:e.jsx("span",{className:"inline-flex items-center rounded-full border border-primary-200 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-primary-600",children:i})})]}),e.jsxs("div",{className:"shrink-0 flex flex-col items-end gap-1.5",children:[e.jsx("span",{className:D("text-2xl font-black tracking-tight",d?"text-primary-500/50":"text-primary-500"),children:ne(S)}),d?e.jsx("div",{className:"rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5",children:e.jsx("p",{className:"text-xs font-semibold text-red-400",children:"Not available on selected date"})}):e.jsxs("div",{className:"flex items-center gap-2",children:[v&&e.jsxs("div",{className:"inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white/70",children:[e.jsx(H,{className:"h-3.5 w-3.5 text-primary-500"}),v]}),C&&e.jsxs("div",{className:"inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white/70",children:[e.jsx(U,{className:"h-3.5 w-3.5 text-primary-500"}),C]})]})]})]})}),e.jsxs("div",{className:"sm:hidden",children:[t&&e.jsx("h2",{className:"text-xl font-bold text-white truncate",children:t}),e.jsxs("div",{className:"mt-2 flex items-center justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[d?e.jsx("div",{className:"rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1",children:e.jsx("p",{className:"text-2xs font-semibold text-red-400",children:"Not available for selected dates"})}):v?e.jsxs("div",{className:"inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-2xs font-semibold text-white/70",children:[e.jsx(H,{className:"h-3 w-3 text-primary-500"}),v]}):null,C&&e.jsxs("div",{className:"inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-2xs font-semibold text-white/70",children:[e.jsx(U,{className:"h-3 w-3 text-primary-500"}),C]})]}),e.jsx("div",{className:"flex items-baseline gap-1 shrink-0",children:e.jsx("span",{className:D("text-lg font-black tracking-tight",d?"text-primary-500/50":"text-primary-500"),children:ne(S)})})]}),i&&e.jsx("div",{className:"mt-1 inline-flex items-center rounded-lg border border-primary-200 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-primary-600 leading-snug",children:i})]})]}),e.jsxs("div",{className:"mt-2 sm:mt-1 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6","data-tier-block":!0,children:[J.length>0?e.jsx("div",{className:"grid gap-3",children:J.map((I,ge)=>e.jsxs("div",{children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:I.label}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:I.items.map((ye,we)=>e.jsx(fe,{item:ye},we))}),ge===0&&n&&e.jsx("div",{className:"mt-3",children:e.jsx(be,{restaurant:n})})]},I.label))}):e.jsxs("div",{className:"flex flex-col items-center justify-center py-16 gap-4",children:[e.jsx(Q,{className:"h-12 w-12 text-neutral-300",strokeWidth:1}),e.jsx("p",{className:"text-sm font-semibold text-secondary-500",children:"Itinerary not available yet"})]}),w]})]},t)}),q&&e.jsxs("div",{className:"sm:hidden flex items-center justify-between py-4",children:[m?e.jsxs("button",{type:"button",onClick:m,className:"inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors",children:[e.jsx(B,{className:"h-4 w-4"}),l]}):e.jsx("span",{}),h?e.jsxs("button",{type:"button",onClick:h,className:"inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors",children:[c,e.jsx(P,{className:"h-4 w-4"})]}):e.jsx("span",{})]}),e.jsxs("div",{className:"py-5 hidden sm:flex items-center justify-between",children:[q&&m?e.jsxs("button",{type:"button",onClick:m,className:"inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors",children:[e.jsx(B,{className:"h-4 w-4"}),l]}):e.jsx("span",{}),d?N&&e.jsxs("button",{type:"button",onClick:N,className:"hidden sm:inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-bold text-white/80 transition-all hover:bg-white/10 hover:border-white/20",children:["Try another date ",e.jsx(P,{className:"h-4 w-4"})]}):g&&e.jsxs("button",{type:"button",onClick:g,"data-cta":"primary",className:"hidden sm:inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] hover:bg-primary-700 transition-all",children:[T||`Reserve ${t||"Tour"}`," ",e.jsx(P,{className:"h-4 w-4"})]}),q&&h?e.jsxs("button",{type:"button",onClick:h,className:"inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors",children:[c,e.jsx(P,{className:"h-4 w-4"})]}):e.jsx("span",{})]}),e.jsx("div",{className:"sm:hidden pb-4 flex justify-center",children:d?N&&e.jsx("button",{type:"button",onClick:N,className:"w-full h-12 rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white/80 transition-all hover:bg-white/10",children:"Try another date"}):g&&e.jsxs("button",{type:"button",onClick:g,"data-cta":"primary",className:"inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] hover:bg-primary-700 transition-all",children:[T||`Reserve ${t||"Tour"}`," ",e.jsx(Fe,{className:"ml-2 h-4 w-4"})]})})]})})})}const At=({children:t,className:r="",containerClassName:a="",size:i="md",id:n,backgroundClassName:l="",title:c,subtitle:m,kicker:h,titleAddon:f,titleClassName:p="",subtitleClassName:o="",centered:d=!1,...k})=>{const N={none:"py-0",sm:"py-8 sm:py-12",md:"py-12 sm:py-16",lg:"py-16 sm:py-24"};return e.jsx("section",{id:n,className:`${N[i]} ${l} ${r}`,...k,children:e.jsxs("div",{className:`container ${a}`,children:[(c||h||m)&&e.jsxs("div",{className:`mb-8 flex flex-col sm:mb-10 ${d?"items-center text-center":"items-start text-left"}`,children:[h&&e.jsx("div",{className:"mb-2 text-xs font-black uppercase tracking-widest text-primary-600",children:h}),e.jsxs("div",{className:`flex w-full flex-wrap gap-4 ${d?"justify-center":"items-end justify-between"}`,children:[e.jsxs("div",{className:`w-full ${d?"max-w-[880px]":"max-w-[880px] flex-1"}`,children:[c&&e.jsx("h2",{className:`text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl ${p}`,children:c}),m&&e.jsx("p",{className:`mt-2 text-lg text-secondary-600 ${d?"mx-auto":""} ${o}`,children:m})]}),!d&&f&&e.jsx("div",{className:"ml-auto",children:f})]})]}),t]})})},rt={name:"Bluuu",product:"Nusa Penida shared speedboat day tour",reviewCount:"8,595",reviewLabel:"reviews",rating:"4.9",ratingLabel:"avg rating",badges:[{icon:"Star",label:"Customer choice"},{icon:"MapPin",label:"Free Bluuu Bus shuttle"},{icon:"BadgeCheck",label:"Safety first"},{icon:"LifeBuoy",label:"24/7 support"}]},at=[{id:"included",label:"Included"},{id:"pickup",label:"Pickup"},{id:"safety",label:"Safety"},{id:"cancellation",label:"Cancelation"},{id:"weather",label:"Weather guarantee"},{id:"faq",label:"FAQ"}],nt=[{id:"hero",label:"Home"},{id:"social",label:"Reviews"},{id:"included",label:"Included"},{id:"gallery",label:"Gallery"},{id:"extras",label:"Add extras"},{id:"faq",label:"FAQ"},{id:"booking",label:"Book"}],zt={cancellationCards:[{id:"full-refund",icon:"CheckCircle2",title:"Cancel 24h+ before departure -> Full refund",text:"Cancel at least 24 hours before your scheduled start time and receive a full refund.",accent:"border-l-emerald-500",iconColor:"text-emerald-600",bg:"border-emerald-100 bg-emerald-50"},{id:"no-refund",icon:"AlertTriangle",title:"Cancel within 24h -> No refund",text:"Cancellations made less than 24 hours before departure are non-refundable.",accent:"border-l-rose-500",iconColor:"text-rose-600",bg:"border-rose-100 bg-rose-50"},{id:"weather-refund",icon:"CloudRain",title:"Weather cancellation (by us) -> Full refund",text:"If we cancel due to unsafe sea conditions, you can reschedule or receive a full refund.",accent:"border-l-sky-500",iconColor:"text-sky-600",bg:"border-sky-100 bg-sky-50"}],weatherGuarantee:[{icon:"Calendar",title:"Free reschedule",text:"Move your trip to the next available safe date with no additional fee."},{icon:"CheckCircle2",title:"Full refund option",text:"Choose a full refund if you prefer not to reschedule."},{icon:"MessageCircle",title:"Fast notification",text:"We contact you quickly on WhatsApp when weather affects operations."}],includedSections:[{title:"Essentials",items:[{icon:"Ship",label:"Shared boat",helper:"Join other guests on a scheduled tour."},{icon:"BadgeCheck",label:"Certified guides",helper:"Experienced crew on every tour."},{icon:"Fish",label:"Snorkeling equipment",helper:"Masks, fins, and safety gear."},{icon:"Coffee",label:"Drinking water",helper:"Cold bottled water onboard."}]},{title:"Comfort",items:[{icon:"Waves",label:"Towels",helper:"Fresh towels for each guest."}]},{title:"Tickets & coverage",items:[{icon:"Ticket",label:"All entrance tickets",helper:"No extra fees on the day."},{icon:"Shield",label:"Health insurance",helper:"Coverage for on-trip activities."}]},{title:"Media",items:[]}]},$t=[{icon:"BadgeCheck",q:"Whats included",a:"Premium boat, lunch, land tour, snorkel gear, tickets, photographer + Prosecco moment."},{icon:"Users",q:"Kids?",a:"Private tours are perfect for families with children, including younger kids."},{icon:"CloudRain",q:"Rain?",a:"Weather guarantee: if we cancel due to unsafe conditions, reschedule or receive a full refund."},{icon:"Clock",q:"Start/finish time",a:"Private tours let guests choose the start time  any time between 08:00 and 11:00. Exact timing confirmed after booking."},{icon:"Sparkles",q:"Showers",a:"Post-tour showers are available."},{icon:"Waves",q:"Seasickness?",a:"Upgraded comfort yacht for a smoother ride. If youre prone, bring motion-sickness tablets."}],F={brand:rt,infoDrawerTabs:at,sections:nt},st={Star:le,MapPin:z,BadgeCheck:ce,LifeBuoy:ie},it={...F.brand,badges:F.brand.badges.map(t=>({...t,icon:st[t.icon]}))},Bt=35e4;parseInt(String(it.reviewCount).replace(/[^0-9]/g,""),10);const Ft=F.infoDrawerTabs,Ot=F.sections,Wt=F.sectionBackgrounds??{white:"bg-transparent",ocean:"bg-transparent",lagoon:"bg-transparent",mist:"bg-transparent"};export{ft as A,it as B,Tt as C,Bt as G,Ft as I,V as M,Lt as P,Et as R,Wt as S,Rt as T,It as a,St as b,D as c,At as d,Dt as e,ee as f,vt as g,Pt as h,Qe as i,Nt as j,kt as k,Mt as l,_t as m,bt as n,wt as o,gt as p,jt as q,$t as r,Ue as s,zt as t,Ct as u,E as v,Ot as w,tt as x,yt as y};
