const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["react-datepicker-B5U4kmJ6.css"])))=>i.map(i=>d[i]);
import{u as F,b as W,r as b,j as e,A as q,m as _,a as J}from"./vendor-motion-wRSbqP8r.js";import{c as N}from"./displayUtils-uQSt0XMN.js";import{r as H,D as ee}from"./vendor-datepicker-W3NaSmx4.js";import{X as D,p as te,k as A,u as re,I as ae,e as U,J as se,x as I,y as K,m as ne,M as G,c as ie,W as le,f as Y,a as oe,q as ce,H as de,A as me,L as ue,B as pe,S as he}from"./vendor-icons-Be2cyUGX.js";import{_ as xe,d as X}from"./index-1rT3aUYS.js";import{B as fe}from"./Footer-By_dXpac.js";const R=({isOpen:t,open:r,onClose:a,children:s,title:n,subTitle:i,subtitle:d,className:p="",maxWidth:o="max-w-xl",bodyClassName:c="",showClose:u=!0,closeOnBackdrop:l=!0})=>{const m=t??r,x=i??d,f=F(0),g=W(f,[0,300],[1,0]);return b.useEffect(()=>{if(!m||typeof document>"u")return;const v=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=v}},[m]),b.useEffect(()=>{if(!m)return;const v=w=>{w.key==="Escape"&&(w.preventDefault(),a?.())};return window.addEventListener("keydown",v),()=>window.removeEventListener("keydown",v)},[m,a]),typeof document>"u"?null:H.createPortal(e.jsx(q,{children:m?e.jsxs(_.div,{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},children:[e.jsx(_.div,{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:g},onClick:l?a:void 0}),e.jsxs(_.div,{className:N("relative flex w-full flex-col overflow-hidden bg-white shadow-2xl","rounded-t-2xl rounded-b-none max-h-[92dvh]","sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",o,p),style:{y:f},drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},dragListener:!1,onDragEnd:(v,w)=>{w.offset.y>80||w.velocity.y>500?a?.():f.set(0)},initial:{opacity:0,y:60},animate:{opacity:1,y:0},exit:{opacity:0,y:60},transition:{type:"spring",bounce:.15,duration:.4},children:[e.jsx(_.div,{className:"flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden",drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},style:{y:f,touchAction:"none"},onDragEnd:(v,w)=>{w.offset.y>80||w.velocity.y>500?a?.():f.set(0)},children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-neutral-300"})}),n||x||u?e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[n?e.jsx("h3",{className:"text-lg font-bold leading-tight text-secondary-900",children:n}):null,x?e.jsx("p",{className:"mt-1 text-sm font-medium text-secondary-500",dangerouslySetInnerHTML:{__html:x}}):null]}),u?e.jsx("button",{type:"button",onClick:a,className:"ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close modal",children:e.jsx(D,{className:"h-5 w-5 text-secondary-600"})}):null]}):null,e.jsx("div",{className:N("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",c||"p-6"),children:s})]})]}):null}),document.body)};function be({isOpen:t,open:r,onClose:a,children:s,title:n,subTitle:i,subtitle:d,className:p="",maxWidth:o="max-w-xl",bodyClassName:c="",showClose:u=!0,closeOnBackdrop:l=!0}){const m=t??r,x=i??d,f=!!(n||x||u),g=F(0),v=W(g,[0,300],[1,0]);return b.useEffect(()=>{if(!m||typeof document>"u")return;const w=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=w}},[m]),b.useEffect(()=>{if(!m)return;const w=y=>{y.key==="Escape"&&(y.preventDefault(),a?.())};return window.addEventListener("keydown",w),()=>window.removeEventListener("keydown",w)},[m,a]),typeof document>"u"?null:H.createPortal(e.jsx(q,{children:m?e.jsxs(_.div,{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},children:[e.jsx(_.div,{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:v},onClick:l?a:void 0}),e.jsxs(_.div,{className:N("relative flex w-full flex-col overflow-hidden bg-white shadow-2xl","rounded-t-2xl rounded-b-none max-h-[92dvh]","sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",o,p),style:{y:g},drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},dragListener:!1,onDragEnd:(w,y)=>{y.offset.y>80||y.velocity.y>500?a?.():g.set(0)},initial:{opacity:0,y:60},animate:{opacity:1,y:0},exit:{opacity:0,y:60},transition:{type:"spring",bounce:.15,duration:.4},children:[e.jsx(_.div,{className:"flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden",drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},style:{y:g,touchAction:"none"},onDragEnd:(w,y)=>{y.offset.y>80||y.velocity.y>500?a?.():g.set(0)},children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-neutral-300"})}),f?e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[n?e.jsx("h3",{className:"text-lg font-bold leading-tight text-secondary-900",children:n}):null,x?e.jsx("p",{className:"mt-1 text-sm font-medium text-secondary-500",dangerouslySetInnerHTML:{__html:x}}):null]}),u?e.jsx("button",{type:"button",onClick:a,className:"ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close modal",children:e.jsx(D,{className:"h-5 w-5 text-secondary-600"})}):null]}):null,e.jsx("div",{className:N("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",c||"p-6"),children:s})]})]}):null}),document.body)}function ge({data:t,onClose:r,maxWidth:a="max-w-3xl"}){return e.jsx(be,{open:!!t,onClose:r,title:t?.title||"Details",subtitle:t?.subtitle||"",maxWidth:a,children:t?e.jsx("div",{className:"pb-2",children:e.jsxs("div",{className:"flex flex-col gap-5 sm:flex-row sm:items-start",children:[t.image?e.jsx("div",{className:"w-full shrink-0 sm:w-2/5",children:e.jsx("div",{className:"aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200",children:e.jsx("img",{src:t.image,alt:t.title||"",className:"h-full w-full object-cover",loading:"lazy",decoding:"async"})})}):null,e.jsx("div",{className:"flex-1 overflow-y-auto",children:t.description?e.jsx("div",{className:"prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&>div]:[padding:0_!important] [&>div]:[background:none_!important]",dangerouslySetInnerHTML:{__html:t.description}}):null})]})}):null})}let Q=(t,r)=>`IDR ${Number(t).toLocaleString()}`;const We=t=>{Q=t};function qe(t){return Q(t,{fromCurrency:"IDR"})}function $(t){if(!t)return"";const r=new Date(t);return Number.isNaN(r.getTime())?t:r.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function He(t,r){return!t||!r?"":`${$(t)} - ${$(r)}`}function ye(t,r,a,s){if(!t||!s?.length)return null;const n=s.find(l=>Number(l.id)===Number(t));if(!n)return null;let i=r;r instanceof Date?i=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(i=new Date(r.startDate).toISOString().split("T")[0]);let d=n.packages?.pricelist||n.package?.pricelist||n.pricelist||[],p=Number(n.boat_price)||0;if(i&&n.pricesbydates?.length){const l=n.pricesbydates.find(m=>{const x=m.date_start,f=m.date_end;return i>=x&&i<=f});if(l){const m=l.packages||l.package;m?.pricelist&&(d=m.pricelist),l.boat_price!==void 0&&l.boat_price!==null&&(p=Number(l.boat_price))}}if(!d.length)return null;const o=String(a);let c=d.find(l=>String(l.members_count)===o);if(!c){const l=[...d].sort((m,x)=>Number(m.members_count)-Number(x.members_count));c=l.reverse().find(m=>Number(m.members_count)<=a)||l[0]}const u=Number(n.classes_id)===9||Number(n.classes_id)===10;return c?Number(c.price)+(u?0:p):null}function Ue(t,r,a,s){return b.useMemo(()=>ye(t,r,a,s),[t,r,a,s])}function Ke(t,r=600){const[a,s]=b.useState(!1),n=Array.isArray(t)?t.join(","):"";return b.useEffect(()=>{if(!t||!t.length){s(!0);return}let i=!1;const d=[...new Set(t.filter(Boolean))];let p=0,o=!1,c=!1;const u=()=>{!i&&o&&c&&s(!0)},l=()=>{p+=1,p>=d.length&&(o=!0,u())};d.forEach(f=>{const g=new Image;g.onload=l,g.onerror=l,g.src=f});const m=setTimeout(()=>{c=!0,u()},r),x=setTimeout(()=>{i||s(!0)},1500);return()=>{i=!0,clearTimeout(m),clearTimeout(x)}},[n,r]),a}const we=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),ve=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),i=we(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z?-??])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},je=t=>{if(!t||typeof t!="object")return"";const r=t.description||t.short_description||t.shortDescription||t.description_text||t.descriptionText||t.subtitle||t.helper||t.note||t.notes||t.details||t.desc||t.text||"";return ve(r,{stripTrailingOne:!0})},Ne=t=>{if(!t||typeof t!="object")return"";const r=t.images_with_thumbs?.[0]||{},s=[t.image,t.image_url,t.imageUrl,t.thumb,t.thumbnail,t.cover,t.photo,r.thumb1,r.thumb,r.original,t.images?.[0],t.gallery?.[0]].find(n=>typeof n=="string"&&n.trim().length>0);return s?s.trim():""},ke=(t,{extraDescription:r="",fallbackDescription:a="Detailed information is available on request.",fallbackImage:s=""}={})=>({description:[je(t),r].filter(Boolean).join(`

`).trim()||a,image:Ne(t)||s}),_e="https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";function Ge({covers:t,selectedCoverId:r,onSelectCoverId:a,priceLabel:s="per person",formatPrice:n=p=>`IDR ${Number(p).toLocaleString()}`,showHeader:i=!0,framed:d=!0}){const p=t?.find(l=>String(l.id)===String(r)),[o,c]=b.useState(null),u=e.jsxs("div",{className:"flex flex-col divide-y divide-neutral-100",children:[e.jsxs("label",{className:N("group flex items-center gap-4 px-5 py-3 sm:py-4 cursor-pointer transition-all",r?"hover:bg-neutral-50":"bg-primary-50/30"),children:[e.jsx("input",{type:"radio",name:"cover-selection-compact",className:"hidden",checked:!r,onChange:()=>a(null)}),e.jsxs("div",{className:"flex min-w-0 flex-1 items-center gap-4",children:[e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center",children:e.jsx(te,{className:N("h-5 w-5 sm:h-6 sm:w-6 transition-colors",r?"text-secondary-400":"text-primary-600")})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"text-sm font-bold text-secondary-900 sm:text-base",children:"No coverage"}),e.jsx("div",{className:"mt-1 text-sm font-medium text-secondary-500",children:"I have my own insurance"})]})]}),e.jsx("div",{className:"flex shrink-0 items-center justify-center",children:e.jsx("div",{className:N("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",r?"border-neutral-200 bg-white":"border-primary-600 bg-primary-600"),children:!r&&e.jsx(A,{className:"h-3 w-3 text-white"})})})]}),t&&t.map(l=>{const m=String(r)===String(l.id),x=Number(l.price),f=ke(l,{fallbackDescription:"Insurance terms and conditions will be confirmed before checkout.",fallbackImage:_e}),g=!!(f.description||f.image);return e.jsxs("label",{className:N("group flex items-center gap-4 px-5 py-3 sm:py-4 cursor-pointer transition-all",m?"bg-primary-50/30":"hover:bg-neutral-50"),children:[e.jsx("input",{type:"radio",name:"cover-selection-compact",className:"hidden",checked:m,onChange:()=>a(l.id)}),e.jsxs("div",{className:"flex min-w-0 flex-1 items-center gap-4",children:[e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center",children:e.jsx(re,{className:N("h-5 w-5 sm:h-6 sm:w-6 transition-colors",m?"text-primary-600":"text-secondary-400")})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"text-sm font-bold text-secondary-900 sm:text-base",children:l.name}),e.jsxs("div",{className:"mt-1 flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-semibold text-secondary-900 tabular-nums sm:text-base",children:n(x)}),e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-secondary-600",children:s})]}),g&&e.jsxs("button",{type:"button",onClick:v=>{v.preventDefault(),v.stopPropagation(),c({title:l.name,description:l.description||l.short_description||f.description,image:f.image})},className:"mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100",children:[e.jsx(ae,{className:"h-3.5 w-3.5"}),e.jsx("span",{children:"See full description"})]})]})]}),e.jsx("div",{className:"flex shrink-0 items-center justify-center",children:e.jsx("div",{className:N("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",m?"border-primary-600 bg-primary-600":"border-neutral-200 bg-white"),children:m&&e.jsx(A,{className:"h-3 w-3 text-white"})})})]},l.id)})]});return e.jsxs("div",{className:N(d&&"overflow-hidden rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md"),children:[i&&e.jsx("div",{className:"flex items-center justify-between px-6 py-5",children:e.jsxs("div",{children:[e.jsx("div",{className:"text-xl font-semibold text-secondary-900",children:"Insurance"}),e.jsx("div",{className:"text-sm text-secondary-500",children:p?p.name:"Optional protect your trip"})]})}),e.jsx("div",{className:N(i&&d&&"border-t border-neutral-200"),children:u}),e.jsx(ge,{data:o?{...o,subtitle:"Coverage information"}:null,onClose:()=>c(null)})]})}function Ye({images:t,alt:r,className:a,onOpenGallery:s,isLocked:n=!1,startIndex:i=0,alwaysShowControls:d=!1}){const p=t?.length?t:[],o=p.length,c=Math.min(Math.max(i||0,0),Math.max(o-1,0)),[u,l]=b.useState(c),[m,x]=b.useState(()=>{const h=new Set;return h.add(c),c>0&&h.add(c-1),c<o-1&&h.add(c+1),h}),f=b.useRef(null),g=b.useRef(c),v=b.useRef(null),w=b.useRef(!1);b.useEffect(()=>{const h=f.current;h&&c>0&&(h.scrollLeft=c*h.offsetWidth)},[]);const y=b.useCallback(h=>{x(j=>{const k=new Set(j);return k.add(h),h>0&&k.add(h-1),h<o-1&&k.add(h+1),k})},[o]),C=b.useCallback(h=>{const j=f.current;if(!j||o<=1)return;const k=Math.max(0,Math.min(o-1,u+h));k!==u&&(j.scrollTo({left:k*j.offsetWidth,behavior:"smooth"}),y(k))},[u,o,y]),S=b.useCallback(()=>{const h=f.current;if(!h)return;const j=Math.round(h.scrollLeft/h.offsetWidth);j!==g.current&&j>=0&&j<o&&(g.current=j,l(j),y(j))},[o,y]);if(!o)return e.jsxs("div",{className:N("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400",a),children:[e.jsx(U,{className:"h-8 w-8 opacity-40"}),e.jsx("span",{className:"text-sm font-medium",children:"No photos yet"})]});const E=d?"absolute top-1/2 z-20 flex -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30":"absolute top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100",P=d?"absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60":"absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60 opacity-0 group-hover:opacity-100",Z=()=>o<=1?null:o>12?e.jsx("div",{className:"absolute bottom-3 left-1/2 z-20 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/30",children:e.jsx("div",{className:"h-full rounded-full bg-white transition-all duration-300",style:{width:`${(u+1)/o*100}%`}})}):e.jsx("div",{className:"absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5",children:p.map((h,j)=>e.jsx("div",{className:N("h-1 rounded-full transition-all duration-300",j===u?"w-4 bg-white":"w-1.5 bg-white/40")},j))});return e.jsxs("div",{className:N("group relative w-full rounded-xl",!n&&"cursor-pointer"),onPointerDown:h=>{v.current={x:h.clientX},w.current=!1},onPointerMove:h=>{v.current&&Math.abs(h.clientX-v.current.x)>8&&(w.current=!0)},onClick:()=>{!n&&!w.current&&s?.(u)},children:[e.jsx("div",{ref:f,className:N("flex snap-x snap-mandatory rounded-xl",a),style:{overflowX:"scroll",scrollbarWidth:"none",msOverflowStyle:"none"},onScroll:n?void 0:S,children:p.map((h,j)=>{const k=h?.thumb||h?.path||h,z=h?.thumb_small||null;return e.jsx("div",{className:"flex-[0_0_100%] snap-center relative shrink-0 overflow-hidden",children:m.has(j)?e.jsx("img",{src:k,srcSet:z?`${z} 300w, ${k} 600w`:void 0,sizes:"(max-width: 640px) 100vw, 50vw",alt:j===u?r:"",className:N("absolute inset-0 h-full w-full object-cover transition-transform duration-500",j===u&&"group-hover:scale-[1.03]"),loading:"lazy",decoding:"async"}):e.jsx("div",{className:"absolute inset-0 bg-neutral-100 animate-pulse"})},j)})}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10 rounded-xl"}),!n&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:P,onClick:h=>{h.stopPropagation(),s?.(u)},"aria-label":"Expand Gallery",children:e.jsx(se,{className:"h-4 w-4"})}),o>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:h=>{h.stopPropagation(),C(-1)},className:N(E,"left-2"),"aria-label":"Previous photo",children:e.jsx(I,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:h=>{h.stopPropagation(),C(1)},className:N(E,"right-2"),"aria-label":"Next photo",children:e.jsx(K,{className:"h-4 w-4"})})]}),Z()]})]})}const Ce=`
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
          border-radius: 12px;
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
          border-radius: 12px !important;
        }

        .premium-datepicker-wrapper .react-datepicker__day--selected,
        .premium-datepicker-wrapper .react-datepicker__day--range-start,
        .premium-datepicker-wrapper .react-datepicker__day--range-end {
          background-color: var(--primary-600) !important;
          color: white !important;
          font-weight: 800;
          box-shadow: 0 8px 20px -6px var(--primary-600);
        }

        .premium-datepicker-wrapper .react-datepicker__day--in-range {
          background-color: var(--primary-50);
          color: var(--primary-700);
          border-radius: 12px;
        }

        .premium-datepicker-wrapper .react-datepicker__day--keyboard-selected {
          background: none;
          border: 2px solid var(--primary-600);
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
            max-width: 300px;
          }

          .premium-datepicker-wrapper .react-datepicker__month-container {
            width: 100%;
            padding: 0 4px;
          }

          .premium-datepicker-wrapper .react-datepicker__header {
            padding-top: 12px;
          }

          .premium-datepicker-wrapper .react-datepicker__current-month {
            font-size: 0.8125rem;
            margin-bottom: 6px;
          }

          .premium-datepicker-wrapper .react-datepicker__day-name {
            width: 32px;
            font-size: 0.625rem;
          }

          .premium-datepicker-wrapper .react-datepicker__day {
            width: 32px;
            height: 32px;
            line-height: 32px;
            font-size: 0.75rem;
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
`;function Xe({mode:t="single",selected:r,onSelect:a,minDate:s=(()=>{const c=new Date;return c.setHours(0,0,0,0),c})(),filterDate:n,onMonthChange:i,renderDayContents:d,className:p,inline:o=!1}){const c=t==="range",[u,l]=b.useState(!1),[m,x]=b.useState(!1);b.useEffect(()=>{xe(()=>Promise.resolve({}),__vite__mapDeps([0]))},[]),b.useEffect(()=>{const y=()=>{l(window.innerWidth<=768)};return y(),window.addEventListener("resize",y),()=>window.removeEventListener("resize",y)},[]);const f=y=>{if(c){const[C,S]=y;a({from:C,to:S}),S&&!o&&setTimeout(()=>x(!1),100)}else a(y),o||setTimeout(()=>x(!1),100)};let g=null,v=null;c?(r?.from&&(g=r.from instanceof Date?r.from:new Date(r.from)),r?.to&&(v=r.to instanceof Date?r.to:new Date(r.to))):r&&(g=r instanceof Date?r:new Date(r));const w=u?1:c?2:1;return e.jsxs("div",{className:`premium-datepicker-wrapper${d?" has-custom-days":""}`,children:[e.jsx("style",{children:Ce}),!o&&e.jsx(ne,{className:"date-icon h-5 w-5 text-secondary-300"}),e.jsx(ee,{selected:g,startDate:g,endDate:v,onChange:f,minDate:s,filterDate:n,onMonthChange:i,renderDayContents:d,selectsRange:c,monthsShown:w,dateFormat:"MMM d, yyyy",placeholderText:c?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:y=>y.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:o,open:o?void 0:m,openToDate:g||new Date,onInputClick:o?void 0:()=>x(!0),onClickOutside:o?void 0:()=>x(!1),onCalendarClose:o?void 0:()=>x(!1),renderCustomHeader:({monthDate:y,decreaseMonth:C,increaseMonth:S,prevMonthButtonDisabled:E,nextMonthButtonDisabled:P})=>e.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[e.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:y.toLocaleString("en-US",{month:"long",year:"numeric"})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:C,disabled:E,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(I,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:S,disabled:P,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(K,{className:"h-4 w-4"})})]})]})})]})}function Qe(){const[t,r]=b.useState(null),{getPolicy:a}=X(),s=b.useCallback(d=>{r(d)},[]),n=b.useCallback(()=>{r(null)},[]),i=t?a(t):null;return b.useEffect(()=>{const d=p=>s(p.detail);return window.addEventListener("open-policy",d),()=>window.removeEventListener("open-policy",d)},[s]),{activePolicyKey:t,activePolicy:i,openPolicy:s,closePolicy:n}}function Ve({activePolicyKey:t,activePolicy:r,onClose:a}){const{loading:s}=X(),n=!!t,i=!!r?.html?.trim();return e.jsx(R,{isOpen:n,onClose:a,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:i?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"text-lg font-semibold text-secondary-900",children:r.title}),e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:r.subtitle})]}),e.jsx("button",{type:"button",onClick:a,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx(D,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-secondary-600",children:e.jsx("div",{className:"policy-rich-content",dangerouslySetInnerHTML:{__html:r.html}})})]}):s?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0 animate-pulse space-y-2",children:[e.jsx("div",{className:"h-5 w-40 rounded bg-neutral-200"}),e.jsx("div",{className:"h-4 w-56 rounded bg-neutral-100"})]}),e.jsx("button",{type:"button",onClick:a,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx(D,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5",children:e.jsx("div",{className:"animate-pulse space-y-3",children:Array.from({length:9}).map((d,p)=>e.jsx("div",{className:"h-4 rounded bg-neutral-100",style:{width:`${96-p%3*12}%`}},p))})})]}):e.jsx("div",{className:"px-6 py-6 text-sm text-secondary-500",children:"Policy not found."})})}function Se({restaurantData:t,onClose:r}){const a=t,s=a?.name||a?.title||a?.restaurant_name||"",n=a?.image||a?.images_with_thumbs?.[0]?.thumb||null,i=a?.description||"",d=a?.menu||"";return e.jsx(R,{open:!!t,onClose:r,title:s||"Restaurant",subtitle:"Included lunch",maxWidth:"max-w-3xl",children:e.jsx("div",{className:"pb-4",children:e.jsxs("div",{className:"flex flex-col gap-5 sm:flex-row sm:items-start",children:[n?e.jsx("div",{className:"w-full shrink-0 sm:w-2/5",children:e.jsx("div",{className:"aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200",children:e.jsx("img",{src:n,alt:s||"Restaurant",className:"h-full w-full object-cover",loading:"lazy",decoding:"async"})})}):null,e.jsxs("div",{className:"flex-1 space-y-3 overflow-y-auto",children:[i?e.jsx("div",{className:"text-sm leading-relaxed text-secondary-600",dangerouslySetInnerHTML:{__html:i}}):null,d?e.jsx("div",{className:"prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1",dangerouslySetInnerHTML:{__html:d}}):null]})]})})})}const De=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),T=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),i=De(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},B=t=>!t||typeof t!="object"?"":T(t.name||t.title||t.restaurant_name||t.restaurantName||"",{stripTrailingOne:!0}),O=t=>!t||typeof t!="object"?"":T(t.description||t.short_description||t.shortDescription||t.details||t.menu||"",{stripTrailingOne:!0}),Me=(t,r=null,a=null)=>{const s=T(t?.details,{stripTrailingOne:!0}),n=r&&typeof r=="object"?r:null,i=a&&typeof a=="object"?a:null,d=s&&(s.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||s.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",p=B(n)||B(i)||d,o=O(n)||O(i),c=s&&s!==String(t?.title||"").trim()&&s!==p?s:"",u=o||c,l=p||u?{...n||{},...i||{},name:p,description:u}:null;return{title:p?`Lunch at ${p}`:t?.title||"Lunch",description:u,popupRestaurant:l}},Te=(t="")=>{const r=String(t).toLowerCase();return r.includes("meet")||r.includes("pick")?G:r.includes("depart")||r.includes("boat")?ie:r.includes("snorkeling")||r.includes("swim")||r.includes("manta")?le:r.includes("lunch")||r.includes("food")?Y:r.includes("return")||r.includes("back")?oe:r.includes("photo")?U:ce};function L({item:t}){const r=Te(t.title),a=T(t.details,{stripTrailingOne:!0}),s=/lunch/i.test(t.title),n=s?Me(t):null,i=n?.title||t.title,d=s?n?.description:a;return e.jsxs("div",{className:"flex items-start gap-3 py-3",children:[e.jsx("div",{className:"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary-500",children:e.jsx(r,{className:"h-4 w-4"})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[e.jsx("div",{className:"text-base font-semibold text-secondary-900",children:i}),e.jsxs("div",{className:"text-sm font-semibold text-secondary-500",children:[t.time,t.duration?` (${t.duration})`:""]})]}),d?e.jsx("div",{className:"mt-0.5 text-sm leading-relaxed text-secondary-600",children:d}):null]})]})}function V({restaurant:t,onClick:r}){const a=t?.name||t?.title||t?.restaurant_name||t?.restaurantName||"";if(!a)return null;const s=t.image||t.images_with_thumbs?.[0]?.thumb||null;return e.jsxs("button",{type:"button",onClick:()=>r?.(t),className:"w-full min-h-[64px] flex items-center gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-neutral-300 hover:bg-white",children:[s?e.jsx("div",{className:"h-16 w-16 shrink-0",children:e.jsx("img",{src:s,alt:t.name,className:"h-full w-full object-cover"})}):e.jsx("div",{className:"h-16 w-16 shrink-0 bg-primary-50 flex items-center justify-center",children:e.jsx(Y,{className:"h-5 w-5 text-primary-300"})}),e.jsx("div",{className:"flex-1 min-w-0 px-3 py-2",children:e.jsx("div",{className:"text-sm font-bold text-secondary-900 truncate",children:a})}),e.jsxs("div",{className:"shrink-0 pr-3 text-sm font-semibold text-primary-600 flex items-center gap-1",children:["View menu",e.jsx(de,{className:"h-3.5 w-3.5 text-primary-400"})]})]})}function Ze({isOpen:t,onClose:r,title:a,subtitle:s="Morning plan is similar for all styles. Afternoon changes by style.",note:n,schedule:i,isLoading:d=!1,restaurantData:p=null,routeRestaurant:o=null,onRestaurantClick:c,sectionLabels:u={beforeLunch:"Morning",afterLunch:"Afternoon"}}){const l=[{label:u.beforeLunch,items:i?.beforeLunch||[]},{label:u.afterLunch,items:i?.afterLunch||[]}].filter(x=>x.items.length>0),m=i?.footerNotes||[];return e.jsx(R,{isOpen:t,onClose:r,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:e.jsxs("div",{className:"flex w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-semibold text-secondary-900",children:a?`${a} schedule`:"Schedule"}),s&&e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:s})]}),e.jsx("button",{type:"button",onClick:r,className:"p-2 hover:bg-neutral-100 rounded-full transition-colors -mr-2 -mt-2","aria-label":"Close",children:e.jsx(D,{className:"w-5 h-5 text-secondary-500"})})]}),e.jsx("div",{className:"overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",children:d?e.jsx("div",{className:"flex items-center justify-center h-48",children:e.jsx("div",{className:"h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"})}):e.jsxs("div",{className:"grid gap-3 grid-cols-1",children:[n&&e.jsx("div",{className:"mb-1 rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm text-primary-600 font-medium",children:n}),l.map((x,f)=>e.jsxs(J.Fragment,{children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:x.label}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:x.items.map((g,v)=>e.jsx(L,{item:g},`${x.label}-${v}`))})]}),f===0&&e.jsx(V,{restaurant:p,onClick:c})]},x.label)),m.length>0&&e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:m.map((x,f)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:x},f))})]})})]})})}function Je({style:t,schedule:r,note:a,restaurant:s,onAnotherRoute:n,onContinue:i,continueLabel:d="Choose your boat",anotherRouteLabel:p="Another route"}){const[o,c]=b.useState(null);return!t||!r?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"space-y-8",children:e.jsx("div",{className:"rounded-xl border border-neutral-200 bg-white",children:e.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-start",children:[e.jsx("div",{className:"relative h-80 sm:h-96 lg:h-auto w-full lg:w-[38%] shrink-0 overflow-hidden p-4 lg:p-6 lg:sticky lg:top-16 rounded-t-xl lg:rounded-t-none lg:rounded-l-xl",children:e.jsx("img",{src:t.map||"https://bluuu.tours/themes/bluuu/assets/images/map.webp",alt:t.title||"Route map",className:"h-full w-full object-contain",loading:"lazy",decoding:"async"})}),e.jsxs("div",{className:"flex-1 flex flex-col p-5 sm:p-8 lg:p-10",children:[e.jsxs("div",{className:"shrink-0",children:[e.jsx("h3",{className:"text-lg font-bold text-secondary-900 sm:text-xl",children:t.title}),e.jsx("p",{className:"mt-1 text-sm text-secondary-600",children:T(t.description,{stripTrailingOne:!0})}),e.jsx("p",{className:"mt-1 text-sm text-secondary-600",children:"Times are approximate and may adjust due to sea conditions (safety-first routing)."}),a?e.jsx("div",{className:"mt-3 rounded-full border border-primary-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-primary-600",children:a}):null]}),e.jsxs("div",{className:"mt-4 grid gap-3 grid-cols-1",children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:"Morning"}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:r.beforeLunch.map((u,l)=>e.jsx(L,{item:u},`morning-${l}`))}),(s||t.restaurant)&&e.jsx("div",{className:"mt-3",children:e.jsx(V,{restaurant:s||t.restaurant,onClick:c})})]}),e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:"Midday & Afternoon"}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:r.afterLunch.map((u,l)=>e.jsx(L,{item:u},`afternoon-${l}`))})]}),(r.footerNotes||[]).length?e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:r.footerNotes.map((u,l)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:u},l))}):null]}),e.jsxs("div",{className:"shrink-0 mt-4 flex items-center justify-end gap-4 border-t border-neutral-100 pt-4",children:[e.jsxs("button",{type:"button",onClick:n,className:"inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-400 transition hover:text-secondary-700",children:[e.jsx(I,{className:"h-4 w-4"}),p]}),e.jsxs(fe,{onClick:i,className:"rounded-full px-3 sm:px-6 text-sm whitespace-nowrap",children:[d," ",e.jsx(me,{className:"h-4 w-4 ml-1"})]})]})]})]})})}),e.jsx(Se,{restaurantData:o,onClose:()=>c(null)})]})}const et=({children:t,className:r="",containerClassName:a="",size:s="md",id:n,backgroundClassName:i="",title:d,subtitle:p,kicker:o,titleAddon:c,titleClassName:u="",subtitleClassName:l="",centered:m=!1,...x})=>{const f={none:"py-0",sm:"py-8 sm:py-12",md:"py-12 sm:py-16",lg:"py-16 sm:py-24"};return e.jsx("section",{id:n,className:`${f[s]} ${i} ${r}`,...x,children:e.jsxs("div",{className:`container ${a}`,children:[(d||o||p)&&e.jsxs("div",{className:`mb-8 flex flex-col sm:mb-10 ${m?"items-center text-center":"items-start text-left"}`,children:[o&&e.jsx("div",{className:"mb-2 text-xs font-black uppercase tracking-widest text-primary-600",children:o}),e.jsxs("div",{className:`flex w-full flex-wrap gap-4 ${m?"justify-center":"items-end justify-between"}`,children:[e.jsxs("div",{className:`w-full ${m?"max-w-[880px]":"max-w-[880px] flex-1"}`,children:[d&&e.jsx("h2",{className:`text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl ${u}`,children:d}),p&&e.jsx("p",{className:`mt-2 text-lg text-secondary-600 ${m?"mx-auto":""} ${l}`,children:p})]}),!m&&c&&e.jsx("div",{className:"ml-auto",children:c})]})]}),t]})})},Ee={name:"Bluuu",product:"Nusa Penida shared speedboat day tour",reviewCount:"8,595",reviewLabel:"reviews",rating:"4.9",ratingLabel:"avg rating",badges:[{icon:"Star",label:"Customer choice"},{icon:"MapPin",label:"Free Bluuu Bus shuttle"},{icon:"BadgeCheck",label:"Safety first"},{icon:"LifeBuoy",label:"24/7 support"}]},Pe=[{id:"included",label:"Included"},{id:"pickup",label:"Pickup"},{id:"safety",label:"Safety"},{id:"cancellation",label:"Cancelation"},{id:"weather",label:"Weather guarantee"},{id:"faq",label:"FAQ"}],Le=[{id:"hero",label:"Home"},{id:"social",label:"Reviews"},{id:"included",label:"Included"},{id:"gallery",label:"Gallery"},{id:"extras",label:"Add extras"},{id:"faq",label:"FAQ"},{id:"booking",label:"Book"}],tt={cancellationCards:[{id:"full-refund",icon:"CheckCircle2",title:"Cancel 24h+ before departure -> Full refund",text:"Cancel at least 24 hours before your scheduled start time and receive a full refund.",accent:"border-l-emerald-500",iconColor:"text-emerald-600",bg:"border-emerald-100 bg-emerald-50"},{id:"no-refund",icon:"AlertTriangle",title:"Cancel within 24h -> No refund",text:"Cancellations made less than 24 hours before departure are non-refundable.",accent:"border-l-rose-500",iconColor:"text-rose-600",bg:"border-rose-100 bg-rose-50"},{id:"weather-refund",icon:"CloudRain",title:"Weather cancellation (by us) -> Full refund",text:"If we cancel due to unsafe sea conditions, you can reschedule or receive a full refund.",accent:"border-l-sky-500",iconColor:"text-sky-600",bg:"border-sky-100 bg-sky-50"}],weatherGuarantee:[{icon:"Calendar",title:"Free reschedule",text:"Move your trip to the next available safe date with no additional fee."},{icon:"CheckCircle2",title:"Full refund option",text:"Choose a full refund if you prefer not to reschedule."},{icon:"MessageCircle",title:"Fast notification",text:"We contact you quickly on WhatsApp when weather affects operations."}],includedSections:[{title:"Essentials",items:[{icon:"Ship",label:"Private boat",helper:"Your group only, no shared seats."},{icon:"BadgeCheck",label:"Certified guides",helper:"Experienced crew on every tour."},{icon:"Fish",label:"Snorkeling equipment",helper:"Masks, fins, and safety gear."},{icon:"Coffee",label:"Drinking water",helper:"Cold bottled water onboard."}]},{title:"Comfort",items:[{icon:"Waves",label:"Towels",helper:"Fresh towels for each guest."}]},{title:"Tickets & coverage",items:[{icon:"Ticket",label:"All entrance tickets",helper:"No extra fees on the day."},{icon:"Shield",label:"Health insurance",helper:"Coverage for on-trip activities."}]},{title:"Media",items:[{icon:"Camera",label:"Underwater GoPro footage",helper:"Crew captures your highlights."}]}]},rt=[{icon:"BadgeCheck",q:"Whats included",a:"Premium boat, lunch, land tour, snorkel gear, tickets, photographer + Prosecco moment."},{icon:"Users",q:"Kids?",a:"Private tours are perfect for families with children, including younger kids."},{icon:"CloudRain",q:"Rain?",a:"Weather guarantee: if we cancel due to unsafe conditions, reschedule or receive a full refund."},{icon:"Clock",q:"Start/finish time",a:"Private tours let guests choose the start time  any time between 08:00 and 11:00. Exact timing confirmed after booking."},{icon:"Sparkles",q:"Showers",a:"Post-tour showers are available."},{icon:"Waves",q:"Seasickness?",a:"Upgraded comfort yacht for a smoother ride. If youre prone, bring motion-sickness tablets."}],M={brand:Ee,infoDrawerTabs:Pe,sections:Le},Ie={Star:he,MapPin:G,BadgeCheck:pe,LifeBuoy:ue},Re={...M.brand,badges:M.brand.badges.map(t=>({...t,icon:Ie[t.icon]}))},at=35e4;parseInt(String(Re.reviewCount).replace(/[^0-9]/g,""),10);const st=M.infoDrawerTabs,nt=M.sections,it=M.sectionBackgrounds??{white:"bg-transparent",ocean:"bg-transparent",lagoon:"bg-transparent",mist:"bg-transparent"};export{Re as B,Xe as C,at as G,ge as I,be as M,Ve as P,Se as R,it as S,Je as T,Qe as a,R as b,Ke as c,et as d,Ye as e,$ as f,Ze as g,ye as h,He as i,qe as j,Ge as k,st as l,rt as m,nt as n,We as s,tt as t,Ue as u};
