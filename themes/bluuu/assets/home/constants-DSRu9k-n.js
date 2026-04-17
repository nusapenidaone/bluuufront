const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["react-datepicker-B5U4kmJ6.css"])))=>i.map(i=>d[i]);
import{X as I,J as X,K as Z,N as J,O as V,Q as ee,w as te,i as A,q as re,I as ae,C as W,R as se,x as L,y as q,n as ne,M as Y,c as ie,W as le,d as H,a as oe,o as ce,H as de,A as ue,L as me,B as pe,b as he}from"./vendor-icons-B1y60RW3.js";import{r as p,a as U,j as e,D as xe,R as fe}from"./vendor-datepicker-DXD6OlhH.js";import{c as j}from"./utils-2dOUpm6k.js";import{_ as be,k as K}from"./index-I7fzSsYR.js";import{B as ge}from"./Footer-Dkufh4hr.js";const z=({isOpen:t,open:r,onClose:a,children:s,title:n,subTitle:i,subtitle:d,className:h="",maxWidth:o="max-w-xl",bodyClassName:c="",showClose:m=!0,closeOnBackdrop:l=!0})=>{const u=t??r,f=i??d,b=p.useRef(0),[g,w]=p.useState(0),_=p.useRef(!1);p.useEffect(()=>{if(!u||typeof document>"u")return;const k=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=k}},[u]),p.useEffect(()=>{if(!u)return;const k=N=>{N.key==="Escape"&&(N.preventDefault(),a?.())};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[u,a]);const y=p.useCallback(k=>{b.current=k.touches[0].clientY,_.current=!0},[]),S=p.useCallback(k=>{if(!_.current)return;const N=Math.max(0,k.touches[0].clientY-b.current);w(N)},[]),D=p.useCallback(()=>{_.current&&(_.current=!1,g>80&&a?.(),w(0))},[g,a]);return typeof document>"u"||!u?null:U.createPortal(e.jsxs("div",{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6 anim-fade-in",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:Math.max(0,1-g/300)},onClick:l?a:void 0}),e.jsxs("div",{className:j("relative flex w-full flex-col overflow-hidden bg-white shadow-2xl","rounded-t-2xl rounded-b-none max-h-[92dvh]","sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",o,h,"anim-slide-up-spring"),style:{transform:`translateY(${g}px)`,transition:g===0?"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)":"none"},children:[e.jsx("div",{className:"flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden touch-none",onTouchStart:y,onTouchMove:S,onTouchEnd:D,children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-neutral-300"})}),n||f||m?e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[n?e.jsx("h3",{className:"text-lg font-bold leading-tight text-secondary-900",children:n}):null,f?e.jsx("p",{className:"mt-1 text-sm font-medium text-secondary-500",dangerouslySetInnerHTML:{__html:f}}):null]}),m?e.jsx("button",{type:"button",onClick:a,className:"ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close modal",children:e.jsx(I,{className:"h-5 w-5 text-secondary-600"})}):null]}):null,e.jsx("div",{className:j("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",c||"p-6"),children:s})]})]}),document.body)},T=t=>t===!0||t===1||t==="1",Ge=t=>{const r=t||{};return[{label:T(r.shade)?"Full shade + flybridge":"Partial shade",present:!0,Icon:X},{label:T(r.cabin)?"Cabin":"No cabin",present:T(r.cabin),Icon:Z},{label:T(r.ac)?"AC":"No AC",present:T(r.ac),Icon:J},{label:T(r.sound)?"In-built Sound System ":"JBL Speaker",present:!0,Icon:V},{label:T(r.toilet)?"Toilet":"No toilet",present:T(r.toilet),Icon:ee}]},Qe="https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",ye=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),we=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),i=ye(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},ve=t=>{if(!t||typeof t!="object")return"";const r=t.description||t.short_description||t.shortDescription||t.description_text||t.descriptionText||t.subtitle||t.helper||t.note||t.notes||t.details||t.desc||t.text||"";return we(r,{stripTrailingOne:!0})},je=t=>{if(!t||typeof t!="object")return"";const r=t.images_with_thumbs?.[0]||{},s=[t.image,t.image_url,t.imageUrl,t.thumb,t.thumbnail,t.cover,t.photo,r.thumb1,r.thumb,r.original,t.images?.[0],t.gallery?.[0]].find(n=>typeof n=="string"&&n.trim().length>0);return s?s.trim():""},Xe=(t,{extraDescription:r="",fallbackDescription:a="Detailed information is available on request.",fallbackImage:s=""}={})=>({description:[ve(t),r].filter(Boolean).join(`

`).trim()||a,image:je(t)||s}),Ze=t=>t.size?t.size:t.length?t.length:"";function Ne({isOpen:t,open:r,onClose:a,children:s,title:n,subTitle:i,subtitle:d,className:h="",maxWidth:o="max-w-xl",bodyClassName:c="",showClose:m=!0,closeOnBackdrop:l=!0}){const u=t??r,f=i??d,b=!!(n||f||m),g=p.useRef(0),[w,_]=p.useState(0),y=p.useRef(!1);p.useEffect(()=>{if(!u||typeof document>"u")return;const N=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=N}},[u]),p.useEffect(()=>{if(!u)return;const N=M=>{M.key==="Escape"&&(M.preventDefault(),a?.())};return window.addEventListener("keydown",N),()=>window.removeEventListener("keydown",N)},[u,a]);const S=p.useCallback(N=>{g.current=N.touches[0].clientY,y.current=!0},[]),D=p.useCallback(N=>{if(!y.current)return;const M=Math.max(0,N.touches[0].clientY-g.current);_(M)},[]),k=p.useCallback(()=>{y.current&&(y.current=!1,w>80&&a?.(),_(0))},[w,a]);return typeof document>"u"||!u?null:U.createPortal(e.jsxs("div",{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6 anim-fade-in",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:Math.max(0,1-w/300)},onClick:l?a:void 0}),e.jsxs("div",{className:j("relative flex w-full flex-col overflow-hidden bg-white shadow-2xl","rounded-t-2xl rounded-b-none max-h-[92dvh]","sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",o,h,"anim-slide-up-spring"),style:{transform:`translateY(${w}px)`,transition:w===0?"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)":"none"},children:[e.jsx("div",{className:"flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden touch-none",onTouchStart:S,onTouchMove:D,onTouchEnd:k,children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-neutral-300"})}),b?e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[n?e.jsx("h3",{className:"text-lg font-bold leading-tight text-secondary-900",children:n}):null,f?e.jsx("p",{className:"mt-1 text-sm font-medium text-secondary-500",dangerouslySetInnerHTML:{__html:f}}):null]}),m?e.jsx("button",{type:"button",onClick:a,className:"ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close modal",children:e.jsx(I,{className:"h-5 w-5 text-secondary-600"})}):null]}):null,e.jsx("div",{className:j("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",c||"p-6"),children:s})]})]}),document.body)}function ke({data:t,onClose:r,maxWidth:a="max-w-3xl"}){return e.jsx(Ne,{open:!!t,onClose:r,title:t?.title||"Details",subtitle:t?.subtitle||"",maxWidth:a,children:t?e.jsx("div",{className:"pb-2",children:e.jsxs("div",{className:"flex flex-col gap-5 sm:flex-row sm:items-start",children:[t.image?e.jsx("div",{className:"w-full shrink-0 sm:w-2/5",children:e.jsx("div",{className:"aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200",children:e.jsx("img",{src:t.image,alt:t.title||"",className:"h-full w-full object-cover",loading:"lazy",decoding:"async"})})}):null,e.jsx("div",{className:"flex-1 overflow-y-auto",children:t.description?e.jsx("div",{className:"prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&>div]:[padding:0_!important] [&>div]:[background:none_!important]",dangerouslySetInnerHTML:{__html:t.description}}):null})]})}):null})}let G=(t,r)=>`IDR ${Number(t).toLocaleString()}`;const Je=t=>{G=t};function Ve(t){return G(t,{fromCurrency:"IDR"})}function B(t){if(!t)return"";const r=new Date(t);return Number.isNaN(r.getTime())?t:r.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function et(t,r){return!t||!r?"":`${B(t)} - ${B(r)}`}function _e(t,r,a,s){if(!t||!s?.length)return null;const n=s.find(l=>Number(l.id)===Number(t));if(!n)return null;let i=r;r instanceof Date?i=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(i=new Date(r.startDate).toISOString().split("T")[0]);let d=n.packages?.pricelist||n.package?.pricelist||n.pricelist||[],h=Number(n.boat_price)||0;if(i&&n.pricesbydates?.length){const l=n.pricesbydates.find(u=>{const f=u.date_start,b=u.date_end;return i>=f&&i<=b});if(l){const u=l.packages||l.package;u?.pricelist&&(d=u.pricelist),l.boat_price!==void 0&&l.boat_price!==null&&(h=Number(l.boat_price))}}if(!d.length)return null;const o=String(a);let c=d.find(l=>String(l.members_count)===o);if(!c){const l=[...d].sort((u,f)=>Number(u.members_count)-Number(f.members_count));c=l.reverse().find(u=>Number(u.members_count)<=a)||l[0]}const m=Number(n.classes_id)===9||Number(n.classes_id)===10;return c?Number(c.price)+(m?0:h):null}function tt(t,r,a,s){return p.useMemo(()=>_e(t,r,a,s),[t,r,a,s])}function rt(t,r=600){const[a,s]=p.useState(!1),n=Array.isArray(t)?t.join(","):"";return p.useEffect(()=>{if(!t||!t.length){s(!0);return}let i=!1;const d=[...new Set(t.filter(Boolean))];let h=0,o=!1,c=!1;const m=()=>{!i&&o&&c&&s(!0)},l=()=>{h+=1,h>=d.length&&(o=!0,m())};d.forEach(b=>{const g=new Image;g.onload=l,g.onerror=l,g.src=b});const u=setTimeout(()=>{c=!0,m()},r),f=setTimeout(()=>{i||s(!0)},1500);return()=>{i=!0,clearTimeout(u),clearTimeout(f)}},[n,r]),a}const Ce=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),Se=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),i=Ce(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z?-??])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},De=t=>{if(!t||typeof t!="object")return"";const r=t.description||t.short_description||t.shortDescription||t.description_text||t.descriptionText||t.subtitle||t.helper||t.note||t.notes||t.details||t.desc||t.text||"";return Se(r,{stripTrailingOne:!0})},Te=t=>{if(!t||typeof t!="object")return"";const r=t.images_with_thumbs?.[0]||{},s=[t.image,t.image_url,t.imageUrl,t.thumb,t.thumbnail,t.cover,t.photo,r.thumb1,r.thumb,r.original,t.images?.[0],t.gallery?.[0]].find(n=>typeof n=="string"&&n.trim().length>0);return s?s.trim():""},Me=(t,{extraDescription:r="",fallbackDescription:a="Detailed information is available on request.",fallbackImage:s=""}={})=>({description:[De(t),r].filter(Boolean).join(`

`).trim()||a,image:Te(t)||s}),Ie="https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";function at({covers:t,selectedCoverId:r,onSelectCoverId:a,priceLabel:s="per person",formatPrice:n=h=>`IDR ${Number(h).toLocaleString()}`,showHeader:i=!0,framed:d=!0}){const h=t?.find(l=>String(l.id)===String(r)),[o,c]=p.useState(null),m=e.jsxs("div",{className:"flex flex-col divide-y divide-neutral-100",children:[e.jsxs("label",{className:j("group flex items-center gap-4 px-5 py-3 sm:py-4 cursor-pointer transition-all",r?"hover:bg-neutral-50":"bg-primary-50/30"),children:[e.jsx("input",{type:"radio",name:"cover-selection-compact",className:"hidden",checked:!r,onChange:()=>a(null)}),e.jsxs("div",{className:"flex min-w-0 flex-1 items-center gap-4",children:[e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center",children:e.jsx(te,{className:j("h-5 w-5 sm:h-6 sm:w-6 transition-colors",r?"text-secondary-400":"text-primary-600")})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"text-sm font-bold text-secondary-900 sm:text-base",children:"No coverage"}),e.jsx("div",{className:"mt-1 text-sm font-medium text-secondary-500",children:"I have my own insurance"})]})]}),e.jsx("div",{className:"flex shrink-0 items-center justify-center",children:e.jsx("div",{className:j("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",r?"border-neutral-200 bg-white":"border-primary-600 bg-primary-600"),children:!r&&e.jsx(A,{className:"h-3 w-3 text-white"})})})]}),t&&t.map(l=>{const u=String(r)===String(l.id),f=Number(l.price),b=Me(l,{fallbackDescription:"Insurance terms and conditions will be confirmed before checkout.",fallbackImage:Ie}),g=!!(b.description||b.image);return e.jsxs("label",{className:j("group flex items-center gap-4 px-5 py-3 sm:py-4 cursor-pointer transition-all",u?"bg-primary-50/30":"hover:bg-neutral-50"),children:[e.jsx("input",{type:"radio",name:"cover-selection-compact",className:"hidden",checked:u,onChange:()=>a(l.id)}),e.jsxs("div",{className:"flex min-w-0 flex-1 items-center gap-4",children:[e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center",children:e.jsx(re,{className:j("h-5 w-5 sm:h-6 sm:w-6 transition-colors",u?"text-primary-600":"text-secondary-400")})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"text-sm font-bold text-secondary-900 sm:text-base",children:l.name}),e.jsxs("div",{className:"mt-1 flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-semibold text-secondary-900 tabular-nums sm:text-base",children:n(f)}),e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-secondary-600",children:s})]}),g&&e.jsxs("button",{type:"button",onClick:w=>{w.preventDefault(),w.stopPropagation(),c({title:l.name,description:l.description||l.short_description||b.description,image:b.image})},className:"mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100",children:[e.jsx(ae,{className:"h-3.5 w-3.5"}),e.jsx("span",{children:"See full description"})]})]})]}),e.jsx("div",{className:"flex shrink-0 items-center justify-center",children:e.jsx("div",{className:j("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",u?"border-primary-600 bg-primary-600":"border-neutral-200 bg-white"),children:u&&e.jsx(A,{className:"h-3 w-3 text-white"})})})]},l.id)})]});return e.jsxs("div",{className:j(d&&"overflow-hidden rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md"),children:[i&&e.jsx("div",{className:"flex items-center justify-between px-6 py-5",children:e.jsxs("div",{children:[e.jsx("div",{className:"text-xl font-semibold text-secondary-900",children:"Insurance"}),e.jsx("div",{className:"text-sm text-secondary-500",children:h?h.name:"Optional protect your trip"})]})}),e.jsx("div",{className:j(i&&d&&"border-t border-neutral-200"),children:m}),e.jsx(ke,{data:o?{...o,subtitle:"Coverage information"}:null,onClose:()=>c(null)})]})}function st({images:t,alt:r,className:a,onOpenGallery:s,isLocked:n=!1,startIndex:i=0,alwaysShowControls:d=!1}){const h=t?.length?t:[],o=h.length,c=Math.min(Math.max(i||0,0),Math.max(o-1,0)),[m,l]=p.useState(c),[u,f]=p.useState(()=>{const x=new Set;return x.add(c),c>0&&x.add(c-1),c<o-1&&x.add(c+1),x}),b=p.useRef(null),g=p.useRef(c),w=p.useRef(null),_=p.useRef(!1);p.useEffect(()=>{const x=b.current;x&&c>0&&(x.scrollLeft=c*x.offsetWidth)},[]);const y=p.useCallback(x=>{f(v=>{const C=new Set(v);return C.add(x),x>0&&C.add(x-1),x<o-1&&C.add(x+1),C})},[o]),S=p.useCallback(x=>{const v=b.current;if(!v||o<=1)return;const C=Math.max(0,Math.min(o-1,m+x));C!==m&&(v.scrollTo({left:C*v.offsetWidth,behavior:"smooth"}),y(C))},[m,o,y]),D=p.useCallback(()=>{const x=b.current;if(!x)return;const v=Math.round(x.scrollLeft/x.offsetWidth);v!==g.current&&v>=0&&v<o&&(g.current=v,l(v),y(v))},[o,y]);if(!o)return e.jsxs("div",{className:j("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400",a),children:[e.jsx(W,{className:"h-8 w-8 opacity-40"}),e.jsx("span",{className:"text-sm font-medium",children:"No photos yet"})]});const k=d?"absolute top-1/2 z-20 flex -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30":"absolute top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100",N=d?"absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60":"absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60 opacity-0 group-hover:opacity-100",M=()=>o<=1?null:o>12?e.jsx("div",{className:"absolute bottom-3 left-1/2 z-20 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/30",children:e.jsx("div",{className:"h-full rounded-full bg-white transition-all duration-300",style:{width:`${(m+1)/o*100}%`}})}):e.jsx("div",{className:"absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5",children:h.map((x,v)=>e.jsx("div",{className:j("h-1 rounded-full transition-all duration-300",v===m?"w-4 bg-white":"w-1.5 bg-white/40")},v))});return e.jsxs("div",{className:j("group relative w-full rounded-xl",!n&&"cursor-pointer"),onPointerDown:x=>{w.current={x:x.clientX},_.current=!1},onPointerMove:x=>{w.current&&Math.abs(x.clientX-w.current.x)>8&&(_.current=!0)},onClick:()=>{!n&&!_.current&&s?.(m)},children:[e.jsx("div",{ref:b,className:j("flex snap-x snap-mandatory rounded-xl",a),style:{overflowX:"scroll",scrollbarWidth:"none",msOverflowStyle:"none"},onScroll:n?void 0:D,children:h.map((x,v)=>{const C=x?.thumb||x?.path||x,$=x?.thumb_small||null;return e.jsx("div",{className:"flex-[0_0_100%] snap-center relative shrink-0 overflow-hidden",children:u.has(v)?e.jsx("img",{src:C,srcSet:$?`${$} 300w, ${C} 600w`:void 0,sizes:"(max-width: 640px) 100vw, 50vw",alt:v===m?r:"",className:j("absolute inset-0 h-full w-full object-cover transition-transform duration-500",v===m&&"group-hover:scale-[1.03]"),loading:"lazy",decoding:"async"}):e.jsx("div",{className:"absolute inset-0 bg-neutral-100 animate-pulse"})},v)})}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10 rounded-xl"}),!n&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:N,onClick:x=>{x.stopPropagation(),s?.(m)},"aria-label":"Expand Gallery",children:e.jsx(se,{className:"h-4 w-4"})}),o>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:x=>{x.stopPropagation(),S(-1)},className:j(k,"left-2"),"aria-label":"Previous photo",children:e.jsx(L,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:x=>{x.stopPropagation(),S(1)},className:j(k,"right-2"),"aria-label":"Next photo",children:e.jsx(q,{className:"h-4 w-4"})})]}),M()]})]})}const Ee=`
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
            max-width: 340px;
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
            width: 40px;
            font-size: 0.6875rem;
          }

          .premium-datepicker-wrapper .react-datepicker__day {
            width: 40px;
            height: 40px;
            line-height: 40px;
            font-size: 0.875rem;
            margin: 2px;
          }

          .premium-datepicker-wrapper.has-custom-days .react-datepicker__day {
            height: 48px;
            line-height: normal;
          }

          .premium-datepicker-wrapper .day-number {
            font-size: 0.875rem;
          }

          .premium-datepicker-wrapper .day-sub {
            font-size: 0.5625rem;
          }
        }

        /* Desktop: side by side */
        @media (min-width: 769px) {
          .premium-datepicker-wrapper .react-datepicker {
            flex-direction: row;
            gap: 1rem;
          }
        }
`,Re=p.forwardRef((t,r)=>e.jsx("input",{...t,ref:r,readOnly:!0}));function nt({mode:t="single",selected:r,onSelect:a,minDate:s=(()=>{const c=new Date;return c.setHours(0,0,0,0),c})(),filterDate:n,onMonthChange:i,renderDayContents:d,className:h,inline:o=!1}){const c=t==="range",[m,l]=p.useState(!1),[u,f]=p.useState(!1);p.useEffect(()=>{be(()=>Promise.resolve({}),__vite__mapDeps([0]))},[]),p.useEffect(()=>{const y=()=>{l(window.innerWidth<=768)};return y(),window.addEventListener("resize",y),()=>window.removeEventListener("resize",y)},[]);const b=y=>{if(c){const[S,D]=y;a({from:S,to:D}),D&&!o&&setTimeout(()=>f(!1),100)}else a(y),o||setTimeout(()=>f(!1),100)};let g=null,w=null;c?(r?.from&&(g=r.from instanceof Date?r.from:new Date(r.from)),r?.to&&(w=r.to instanceof Date?r.to:new Date(r.to))):r&&(g=r instanceof Date?r:new Date(r));const _=m?1:c?2:1;return e.jsxs("div",{className:`premium-datepicker-wrapper${d?" has-custom-days":""}`,children:[e.jsx("style",{children:Ee}),!o&&e.jsx(ne,{className:"date-icon h-5 w-5 text-secondary-300"}),e.jsx(xe,{selected:g,startDate:g,endDate:w,onChange:b,minDate:s,filterDate:n,onMonthChange:i,renderDayContents:d,selectsRange:c,monthsShown:_,dateFormat:"MMM d, yyyy",placeholderText:c?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:y=>y.preventDefault(),customInput:m?e.jsx(Re,{}):void 0,showPopperArrow:!1,popperPlacement:"bottom-start",inline:o,open:o?void 0:u,openToDate:g||new Date,onInputClick:o?void 0:()=>f(!0),onClickOutside:o?void 0:()=>f(!1),onCalendarClose:o?void 0:()=>f(!1),renderCustomHeader:({monthDate:y,decreaseMonth:S,increaseMonth:D,prevMonthButtonDisabled:k,nextMonthButtonDisabled:N})=>e.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[e.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:y.toLocaleString("en-US",{month:"long",year:"numeric"})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:S,disabled:k,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(L,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:D,disabled:N,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(q,{className:"h-4 w-4"})})]})]})})]})}function it(){const[t,r]=p.useState(null),{getPolicy:a}=K(),s=p.useCallback(d=>{r(d)},[]),n=p.useCallback(()=>{r(null)},[]),i=t?a(t):null;return p.useEffect(()=>{const d=h=>s(h.detail);return window.addEventListener("open-policy",d),()=>window.removeEventListener("open-policy",d)},[s]),{activePolicyKey:t,activePolicy:i,openPolicy:s,closePolicy:n}}function lt({activePolicyKey:t,activePolicy:r,onClose:a}){const{loading:s}=K(),n=!!t,i=!!r?.html?.trim();return e.jsx(z,{isOpen:n,onClose:a,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:i?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"text-lg font-semibold text-secondary-900",children:r.title}),e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:r.subtitle})]}),e.jsx("button",{type:"button",onClick:a,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx(I,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-secondary-600",children:e.jsx("div",{className:"policy-rich-content",dangerouslySetInnerHTML:{__html:r.html}})})]}):s?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0 animate-pulse space-y-2",children:[e.jsx("div",{className:"h-5 w-40 rounded bg-neutral-200"}),e.jsx("div",{className:"h-4 w-56 rounded bg-neutral-100"})]}),e.jsx("button",{type:"button",onClick:a,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx(I,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5",children:e.jsx("div",{className:"animate-pulse space-y-3",children:Array.from({length:9}).map((d,h)=>e.jsx("div",{className:"h-4 rounded bg-neutral-100",style:{width:`${96-h%3*12}%`}},h))})})]}):e.jsx("div",{className:"px-6 py-6 text-sm text-secondary-500",children:"Policy not found."})})}function Pe({restaurantData:t,onClose:r}){const a=t,s=a?.name||a?.title||a?.restaurant_name||"",n=a?.image||a?.images_with_thumbs?.[0]?.thumb||null,i=a?.description||"",d=a?.menu||"";return e.jsx(z,{open:!!t,onClose:r,title:s||"Restaurant",subtitle:"Included lunch",maxWidth:"max-w-3xl",children:e.jsx("div",{className:"pb-4",children:e.jsxs("div",{className:"flex flex-col gap-5 sm:flex-row sm:items-start",children:[n?e.jsx("div",{className:"w-full shrink-0 sm:w-2/5",children:e.jsx("div",{className:"aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200",children:e.jsx("img",{src:n,alt:s||"Restaurant",className:"h-full w-full object-cover",loading:"lazy",decoding:"async"})})}):null,e.jsxs("div",{className:"flex-1 space-y-3 overflow-y-auto",children:[i?e.jsx("div",{className:"text-sm leading-relaxed text-secondary-600",dangerouslySetInnerHTML:{__html:i}}):null,d?e.jsx("div",{className:"prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1",dangerouslySetInnerHTML:{__html:d}}):null]})]})})})}const Le=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),R=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const a=t.replace(/<[^>]*>/g," "),i=Le(a).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},O=t=>!t||typeof t!="object"?"":R(t.name||t.title||t.restaurant_name||t.restaurantName||"",{stripTrailingOne:!0}),F=t=>!t||typeof t!="object"?"":R(t.description||t.short_description||t.shortDescription||t.details||t.menu||"",{stripTrailingOne:!0}),ze=(t,r=null,a=null)=>{const s=R(t?.details,{stripTrailingOne:!0}),n=r&&typeof r=="object"?r:null,i=a&&typeof a=="object"?a:null,d=s&&(s.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||s.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",h=O(n)||O(i)||d,o=F(n)||F(i),c=s&&s!==String(t?.title||"").trim()&&s!==h?s:"",m=o||c,l=h||m?{...n||{},...i||{},name:h,description:m}:null;return{title:h?`Lunch at ${h}`:t?.title||"Lunch",description:m,popupRestaurant:l}},$e=(t="")=>{const r=String(t).toLowerCase();return r.includes("meet")||r.includes("pick")?Y:r.includes("depart")||r.includes("boat")?ie:r.includes("snorkeling")||r.includes("swim")||r.includes("manta")?le:r.includes("lunch")||r.includes("food")?H:r.includes("return")||r.includes("back")?oe:r.includes("photo")?W:ce};function P({item:t}){const r=$e(t.title),a=R(t.details,{stripTrailingOne:!0}),s=/lunch/i.test(t.title),n=s?ze(t):null,i=n?.title||t.title,d=s?n?.description:a;return e.jsxs("div",{className:"flex items-start gap-3 py-3",children:[e.jsx("div",{className:"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary-500",children:e.jsx(r,{className:"h-4 w-4"})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[e.jsx("div",{className:"text-base font-semibold text-secondary-900",children:i}),e.jsxs("div",{className:"text-sm font-semibold text-secondary-500",children:[t.time,t.duration?` (${t.duration})`:""]})]}),d?e.jsx("div",{className:"mt-0.5 text-sm leading-relaxed text-secondary-600",children:d}):null]})]})}function Q({restaurant:t,onClick:r}){const a=t?.name||t?.title||t?.restaurant_name||t?.restaurantName||"";if(!a)return null;const s=t.image||t.images_with_thumbs?.[0]?.thumb||null;return e.jsxs("button",{type:"button",onClick:()=>r?.(t),className:"w-full min-h-[64px] flex items-center gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-neutral-300 hover:bg-white",children:[s?e.jsx("div",{className:"h-16 w-16 shrink-0",children:e.jsx("img",{src:s,alt:t.name,className:"h-full w-full object-cover"})}):e.jsx("div",{className:"h-16 w-16 shrink-0 bg-primary-50 flex items-center justify-center",children:e.jsx(H,{className:"h-5 w-5 text-primary-300"})}),e.jsx("div",{className:"flex-1 min-w-0 px-3 py-2",children:e.jsx("div",{className:"text-sm font-bold text-secondary-900 truncate",children:a})}),e.jsxs("div",{className:"shrink-0 pr-3 text-sm font-semibold text-primary-600 flex items-center gap-1",children:["View menu",e.jsx(de,{className:"h-3.5 w-3.5 text-primary-400"})]})]})}function ot({isOpen:t,onClose:r,title:a,subtitle:s="Morning plan is similar for all styles. Afternoon changes by style.",note:n,schedule:i,isLoading:d=!1,restaurantData:h=null,routeRestaurant:o=null,onRestaurantClick:c,sectionLabels:m={beforeLunch:"Morning",afterLunch:"Afternoon"}}){const l=[{label:m.beforeLunch,items:i?.beforeLunch||[]},{label:m.afterLunch,items:i?.afterLunch||[]}].filter(f=>f.items.length>0),u=i?.footerNotes||[];return e.jsx(z,{isOpen:t,onClose:r,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:e.jsxs("div",{className:"flex w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-semibold text-secondary-900",children:a?`${a} schedule`:"Schedule"}),s&&e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:s})]}),e.jsx("button",{type:"button",onClick:r,className:"p-2 hover:bg-neutral-100 rounded-full transition-colors -mr-2 -mt-2","aria-label":"Close",children:e.jsx(I,{className:"w-5 h-5 text-secondary-500"})})]}),e.jsx("div",{className:"overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",children:d?e.jsx("div",{className:"flex items-center justify-center h-48",children:e.jsx("div",{className:"h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"})}):e.jsxs("div",{className:"grid gap-3 grid-cols-1",children:[n&&e.jsx("div",{className:"mb-1 rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm text-primary-600 font-medium",children:n}),l.map((f,b)=>e.jsxs(fe.Fragment,{children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:f.label}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:f.items.map((g,w)=>e.jsx(P,{item:g},`${f.label}-${w}`))})]}),b===0&&e.jsx(Q,{restaurant:h,onClick:c})]},f.label)),u.length>0&&e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:u.map((f,b)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:f},b))})]})})]})})}function ct({style:t,schedule:r,note:a,restaurant:s,onAnotherRoute:n,onContinue:i,continueLabel:d="Choose your boat",anotherRouteLabel:h="Another route"}){const[o,c]=p.useState(null);return!t||!r?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"space-y-8",children:e.jsx("div",{className:"rounded-xl border border-neutral-200 bg-white",children:e.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-start",children:[e.jsx("div",{className:"relative h-80 sm:h-96 lg:h-auto w-full lg:w-[38%] shrink-0 overflow-hidden p-4 lg:p-6 lg:sticky lg:top-16 rounded-t-xl lg:rounded-t-none lg:rounded-l-xl",children:e.jsx("img",{src:t.map||"https://bluuu.tours/themes/bluuu/assets/images/map.webp",alt:t.title||"Route map",className:"h-full w-full object-contain",loading:"lazy",decoding:"async"})}),e.jsxs("div",{className:"flex-1 flex flex-col p-5 sm:p-8 lg:p-10",children:[e.jsxs("div",{className:"shrink-0",children:[e.jsx("h3",{className:"text-lg font-bold text-secondary-900 sm:text-xl",children:t.title}),e.jsx("p",{className:"mt-1 text-sm text-secondary-600",children:R(t.description,{stripTrailingOne:!0})}),e.jsx("p",{className:"mt-1 text-sm text-secondary-600",children:"Times are approximate and may adjust due to sea conditions (safety-first routing)."}),a?e.jsx("div",{className:"mt-3 rounded-full border border-primary-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-primary-600",children:a}):null]}),e.jsxs("div",{className:"mt-4 grid gap-3 grid-cols-1",children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:"Morning"}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:r.beforeLunch.map((m,l)=>e.jsx(P,{item:m},`morning-${l}`))}),(s||t.restaurant)&&e.jsx("div",{className:"mt-3",children:e.jsx(Q,{restaurant:s||t.restaurant,onClick:c})})]}),e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:"Midday & Afternoon"}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:r.afterLunch.map((m,l)=>e.jsx(P,{item:m},`afternoon-${l}`))})]}),(r.footerNotes||[]).length?e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:r.footerNotes.map((m,l)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:m},l))}):null]}),e.jsxs("div",{className:"shrink-0 mt-4 flex items-center justify-end gap-4 border-t border-neutral-100 pt-4",children:[e.jsxs("button",{type:"button",onClick:n,className:"inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-400 transition hover:text-secondary-700",children:[e.jsx(L,{className:"h-4 w-4"}),h]}),e.jsxs(ge,{onClick:i,className:"rounded-full px-3 sm:px-6 text-sm whitespace-nowrap",children:[d," ",e.jsx(ue,{className:"h-4 w-4 ml-1"})]})]})]})]})})}),e.jsx(Pe,{restaurantData:o,onClose:()=>c(null)})]})}const dt=({children:t,className:r="",containerClassName:a="",size:s="md",id:n,backgroundClassName:i="",title:d,subtitle:h,kicker:o,titleAddon:c,titleClassName:m="",subtitleClassName:l="",centered:u=!1,...f})=>{const b={none:"py-0",sm:"py-8 sm:py-12",md:"py-12 sm:py-16",lg:"py-16 sm:py-24"};return e.jsx("section",{id:n,className:`${b[s]} ${i} ${r}`,...f,children:e.jsxs("div",{className:`container ${a}`,children:[(d||o||h)&&e.jsxs("div",{className:`mb-8 flex flex-col sm:mb-10 ${u?"items-center text-center":"items-start text-left"}`,children:[o&&e.jsx("div",{className:"mb-2 text-xs font-black uppercase tracking-widest text-primary-600",children:o}),e.jsxs("div",{className:`flex w-full flex-wrap gap-4 ${u?"justify-center":"items-end justify-between"}`,children:[e.jsxs("div",{className:`w-full ${u?"max-w-[880px]":"max-w-[880px] flex-1"}`,children:[d&&e.jsx("h2",{className:`text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl ${m}`,children:d}),h&&e.jsx("p",{className:`mt-2 text-lg text-secondary-600 ${u?"mx-auto":""} ${l}`,children:h})]}),!u&&c&&e.jsx("div",{className:"ml-auto",children:c})]})]}),t]})})},Ae={name:"Bluuu",product:"Nusa Penida shared speedboat day tour",reviewCount:"8,595",reviewLabel:"reviews",rating:"4.9",ratingLabel:"avg rating",badges:[{icon:"Star",label:"Customer choice"},{icon:"MapPin",label:"Free Bluuu Bus shuttle"},{icon:"BadgeCheck",label:"Safety first"},{icon:"LifeBuoy",label:"24/7 support"}]},Be=[{id:"included",label:"Included"},{id:"pickup",label:"Pickup"},{id:"safety",label:"Safety"},{id:"cancellation",label:"Cancelation"},{id:"weather",label:"Weather guarantee"},{id:"faq",label:"FAQ"}],Oe=[{id:"hero",label:"Home"},{id:"social",label:"Reviews"},{id:"included",label:"Included"},{id:"gallery",label:"Gallery"},{id:"extras",label:"Add extras"},{id:"faq",label:"FAQ"},{id:"booking",label:"Book"}],ut={cancellationCards:[{id:"full-refund",icon:"CheckCircle2",title:"Cancel 24h+ before departure -> Full refund",text:"Cancel at least 24 hours before your scheduled start time and receive a full refund.",accent:"border-l-emerald-500",iconColor:"text-emerald-600",bg:"border-emerald-100 bg-emerald-50"},{id:"no-refund",icon:"AlertTriangle",title:"Cancel within 24h -> No refund",text:"Cancellations made less than 24 hours before departure are non-refundable.",accent:"border-l-rose-500",iconColor:"text-rose-600",bg:"border-rose-100 bg-rose-50"},{id:"weather-refund",icon:"CloudRain",title:"Weather cancellation (by us) -> Full refund",text:"If we cancel due to unsafe sea conditions, you can reschedule or receive a full refund.",accent:"border-l-sky-500",iconColor:"text-sky-600",bg:"border-sky-100 bg-sky-50"}],weatherGuarantee:[{icon:"Calendar",title:"Free reschedule",text:"Move your trip to the next available safe date with no additional fee."},{icon:"CheckCircle2",title:"Full refund option",text:"Choose a full refund if you prefer not to reschedule."},{icon:"MessageCircle",title:"Fast notification",text:"We contact you quickly on WhatsApp when weather affects operations."}],includedSections:[{title:"Essentials",items:[{icon:"Ship",label:"Private boat",helper:"Your group only, no shared seats."},{icon:"BadgeCheck",label:"Certified guides",helper:"Experienced crew on every tour."},{icon:"Fish",label:"Snorkeling equipment",helper:"Masks, fins, and safety gear."},{icon:"Coffee",label:"Drinking water",helper:"Cold bottled water onboard."}]},{title:"Comfort",items:[{icon:"Waves",label:"Towels",helper:"Fresh towels for each guest."}]},{title:"Tickets & coverage",items:[{icon:"Ticket",label:"All entrance tickets",helper:"No extra fees on the day."},{icon:"Shield",label:"Health insurance",helper:"Coverage for on-trip activities."}]},{title:"Media",items:[{icon:"Camera",label:"Underwater GoPro footage",helper:"Crew captures your highlights."}]}]},mt=[{icon:"BadgeCheck",q:"Whats included",a:"Premium boat, lunch, land tour, snorkel gear, tickets, photographer + Prosecco moment."},{icon:"Users",q:"Kids?",a:"Private tours are perfect for families with children, including younger kids."},{icon:"CloudRain",q:"Rain?",a:"Weather guarantee: if we cancel due to unsafe conditions, reschedule or receive a full refund."},{icon:"Clock",q:"Start/finish time",a:"Private tours let guests choose the start time  any time between 08:00 and 11:00. Exact timing confirmed after booking."},{icon:"Sparkles",q:"Showers",a:"Post-tour showers are available."},{icon:"Waves",q:"Seasickness?",a:"Upgraded comfort yacht for a smoother ride. If youre prone, bring motion-sickness tablets."}],E={brand:Ae,infoDrawerTabs:Be,sections:Oe},Fe={Star:he,MapPin:Y,BadgeCheck:pe,LifeBuoy:me},We={...E.brand,badges:E.brand.badges.map(t=>({...t,icon:Fe[t.icon]}))},pt=35e4;parseInt(String(We.reviewCount).replace(/[^0-9]/g,""),10);const ht=E.infoDrawerTabs,xt=E.sections,ft=E.sectionBackgrounds??{white:"bg-transparent",ocean:"bg-transparent",lagoon:"bg-transparent",mist:"bg-transparent"};export{We as B,nt as C,pt as G,ke as I,Ne as M,lt as P,Pe as R,ft as S,ct as T,it as a,z as b,rt as c,dt as d,st as e,B as f,Ze as g,ot as h,_e as i,et as j,Ve as k,at as l,Ge as m,Xe as n,Qe as o,Je as p,ht as q,T as r,we as s,ut as t,tt as u,mt as v,xt as w};
