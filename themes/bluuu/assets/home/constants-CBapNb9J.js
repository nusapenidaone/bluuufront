const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["react-datepicker-B5U4kmJ6.css"])))=>i.map(i=>d[i]);
import{r as o,j as e,a as U,D as te,R as re}from"./vendor-datepicker-DXD6OlhH.js";import{J as se,d as z,X as L,K as ae,N as ne,O as ie,Q as le,R as oe,t as ce,i as G,g as de,I as ue,h as Q,V as me,v as B,w as W,c as pe,S as he,s as xe,u as V,r as fe,f as be,E as ge,A as we,L as ye,B as ve,n as je}from"./vendor-icons-C7kigISd.js";import{_ as Ne,q as X}from"./index-uL3RfiB-.js";import{P as ke}from"./index-BbCVikej.js";/* empty css              */import{B as _e}from"./Footer-Ci40B90g.js";let R=null;function $(){return R||(window.google?.maps?.places?(R=Promise.resolve(window.google),R):(R=new Promise((t,r)=>{const s=document.createElement("script");s.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC_RrKc9v7DS51etBhBRzRopKknc9jHhbs&libraries=places&loading=async",s.async=!0,s.onload=()=>t(window.google),s.onerror=()=>r(new Error("Google Maps failed to load")),document.head.appendChild(s)}),R))}const F={south:-9,west:114.4,north:-7.9,east:116},Ce={lat:-8.719,lng:115.169};function at({value:t,onChange:r,placeholder:s,className:n}){const a=o.useRef(null),i=o.useRef(null),h=o.useRef(null),d=o.useRef(null),u=o.useRef(null),[l,x]=o.useState([]),[m,p]=o.useState(!1),[f,g]=o.useState(null),[w,N]=o.useState(!1),[C,j]=o.useState(null);o.useEffect(()=>{a.current&&document.activeElement!==a.current&&(a.current.value=t??"")},[t]);const D=o.useCallback(async v=>{if(!v||v.length<2){x([]);return}try{const c=await $(),b=new c.maps.LatLngBounds(new c.maps.LatLng(F.south,F.west),new c.maps.LatLng(F.north,F.east)),{suggestions:y}=await c.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({input:v,locationBias:b});x(y??[]),a.current&&j(a.current.getBoundingClientRect()),p(!0)}catch{x([])}},[]),T=v=>{const c=v.target.value;r(c),clearTimeout(u.current),u.current=setTimeout(()=>D(c),250)},S=async v=>{const c=v.placePrediction.mainText?.text??"",b=v.placePrediction.secondaryText?.text??"",y=b?`${c}, ${b}`:c;r(y),a.current&&(a.current.value=y),x([]),p(!1);try{const M=v.placePrediction.toPlace();await M.fetchFields({fields:["location"]});const P=M.location;P&&g({lat:P.lat(),lng:P.lng()})}catch{}},k=o.useCallback(async v=>{const c=await $(),b=new c.maps.Geocoder,{results:y}=await b.geocode({location:v});if(y?.[0]){const M=y[0].formatted_address;r(M),a.current&&(a.current.value=M)}},[r]);return o.useEffect(()=>{if(!w||!i.current)return;const v=f??Ce;$().then(c=>{h.current?(h.current.setCenter(v),f&&d.current&&d.current.setPosition(v)):(h.current=new c.maps.Map(i.current,{zoom:f?15:11,center:v,disableDefaultUI:!0,zoomControl:!0,gestureHandling:"cooperative",clickableIcons:!1}),h.current.addListener("click",b=>{const y={lat:b.latLng.lat(),lng:b.latLng.lng()};g(y),d.current?d.current.setPosition(y):(d.current=new c.maps.Marker({position:y,map:h.current,draggable:!0}),d.current.addListener("dragend",M=>{const P={lat:M.latLng.lat(),lng:M.latLng.lng()};g(P),k(P)})),k(y)}),f&&(d.current=new c.maps.Marker({position:v,map:h.current,draggable:!0}),d.current.addListener("dragend",b=>{const y={lat:b.latLng.lat(),lng:b.latLng.lng()};g(y),k(y)})))})},[w,f,k]),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("input",{ref:a,type:"text",defaultValue:t,onChange:T,onBlur:()=>{clearTimeout(u.current),setTimeout(()=>p(!1),150)},placeholder:s,className:n,autoComplete:"off"}),e.jsx("button",{type:"button",onClick:()=>N(v=>!v),title:w?"Hide map":"Show on map",className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-secondary-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",children:e.jsx(se,{className:"h-4 w-4"})})]}),m&&l.length>0&&C&&U.createPortal(e.jsx("ul",{style:{position:"fixed",top:C.bottom+4,left:C.left,width:C.width,zIndex:9999},className:"overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg",children:l.map((v,c)=>{const b=v.placePrediction.mainText?.text??"",y=v.placePrediction.secondaryText?.text??"";return e.jsxs("li",{onMouseDown:()=>S(v),className:"flex cursor-pointer items-start gap-2 px-3 py-2.5 hover:bg-neutral-50",children:[e.jsx(z,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary-600"}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"truncate font-medium text-secondary-900",children:b}),y&&e.jsx("div",{className:"truncate text-xs text-secondary-400",children:y})]})]},c)})}),document.body),w&&e.jsxs("div",{className:"mt-2 overflow-hidden rounded-lg border border-neutral-200",children:[e.jsx("div",{ref:i,className:"h-52 w-full"}),e.jsxs("div",{className:"flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 text-xs text-secondary-400",children:[e.jsx(z,{className:"h-3 w-3 shrink-0"}),"Нажмите на карту чтобы поставить точку, или перетащите маркер"]})]})]})}function _(...t){return t.filter(Boolean).join(" ")}const Z=({isOpen:t,open:r,onClose:s,children:n,title:a,subTitle:i,subtitle:h,className:d="",maxWidth:u="max-w-xl",bodyClassName:l="",showClose:x=!0,closeOnBackdrop:m=!0})=>{const p=t??r,f=i??h,g=o.useRef(0),[w,N]=o.useState(0),C=o.useRef(!1);o.useEffect(()=>{if(!p||typeof document>"u")return;const S=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=S}},[p]),o.useEffect(()=>{if(!p)return;const S=k=>{k.key==="Escape"&&(k.preventDefault(),s?.())};return window.addEventListener("keydown",S),()=>window.removeEventListener("keydown",S)},[p,s]);const j=o.useCallback(S=>{g.current=S.touches[0].clientY,C.current=!0},[]),D=o.useCallback(S=>{if(!C.current)return;const k=Math.max(0,S.touches[0].clientY-g.current);N(k)},[]),T=o.useCallback(()=>{C.current&&(C.current=!1,w>80&&s?.(),N(0))},[w,s]);return typeof document>"u"||!p?null:U.createPortal(e.jsxs("div",{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6 anim-fade-in",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:Math.max(0,1-w/300)},onClick:m?s:void 0}),e.jsxs("div",{className:_("relative flex w-full flex-col overflow-hidden bg-white shadow-2xl","rounded-t-2xl rounded-b-none max-h-[92dvh]","sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",u,d,"anim-slide-up-spring"),style:{transform:`translateY(${w}px)`,transition:w===0?"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)":"none"},children:[e.jsx("div",{className:"flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden touch-none",onTouchStart:j,onTouchMove:D,onTouchEnd:T,children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-neutral-300"})}),a||f||x?e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[a?e.jsx("h3",{className:"text-lg font-bold leading-tight text-secondary-900",children:a}):null,f?e.jsx("p",{className:"mt-1 text-sm font-medium text-secondary-500",dangerouslySetInnerHTML:{__html:f}}):null]}),x?e.jsx("button",{type:"button",onClick:s,className:"ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close modal",children:e.jsx(L,{className:"h-5 w-5 text-secondary-600"})}):null]}):null,e.jsx("div",{className:_("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",l||"p-6"),children:n})]})]}),document.body)};function nt(){return e.jsxs("div",{className:"inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 25",className:"h-5 w-5 shrink-0",children:[e.jsx("circle",{cx:"12",cy:"12.5",r:"10",fill:"#34E0A1"}),e.jsx("path",{fill:"#000",d:"m18.167 10.528 1.194-1.306h-2.667A8.236 8.236 0 0 0 12 7.778c-1.75 0-3.361.528-4.694 1.444H4.639l1.194 1.306c-.75.666-1.194 1.639-1.194 2.722a3.663 3.663 0 0 0 3.667 3.667c.972 0 1.833-.362 2.5-.973L12 17.222l1.167-1.278a3.652 3.652 0 0 0 2.5.973 3.663 3.663 0 0 0 3.666-3.667 3.584 3.584 0 0 0-1.166-2.722Zm-9.834 5.194a2.49 2.49 0 0 1-2.5-2.5 2.49 2.49 0 0 1 2.5-2.5 2.49 2.49 0 0 1 2.5 2.5c-.027 1.39-1.139 2.5-2.5 2.5ZM12 13.167c0-1.64-1.194-3.056-2.75-3.64A7.049 7.049 0 0 1 12 8.973a6.95 6.95 0 0 1 2.75.556c-1.556.61-2.75 2-2.75 3.639Zm3.667 2.555a2.49 2.49 0 0 1-2.5-2.5 2.49 2.49 0 0 1 2.5-2.5 2.49 2.49 0 0 1 2.5 2.5 2.49 2.49 0 0 1-2.5 2.5Zm0-3.778c-.723 0-1.306.584-1.306 1.306a1.304 1.304 0 1 0 2.611 0c0-.722-.583-1.306-1.305-1.306ZM9.639 13.25c0 .722-.583 1.306-1.306 1.306a1.304 1.304 0 0 1-1.305-1.306 1.304 1.304 0 1 1 2.611 0Z"})]}),e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",className:"h-5 w-5 shrink-0",children:[e.jsx("path",{fill:"url(#rp-ga)",d:"M6.592 13.918a6.04 6.04 0 0 1-.307-1.909H2.208c0 1.517.343 2.946.947 4.227l.124.254v.01a10.063 10.063 0 0 0 1.889 2.604l4.47-1.674a6.12 6.12 0 0 1-3.046-3.512Z"}),e.jsx("path",{fill:"url(#rp-gb)",d:"M18.883 4.619C17.148 3 14.896 2.01 12.198 2.01c-.531 1.11-.62 2.771 0 3.981 1.472 0 2.78.51 3.824 1.491l2.86-2.863Z"}),e.jsx("path",{fill:"url(#rp-gc)",d:"M12.198 5.991h.095l-.095-3.981a9.936 9.936 0 0 0-7.645 3.577c.257 1.483.97 2.435 3.12 2.586 1.084-1.324 2.71-2.182 4.525-2.182Z"}),e.jsx("path",{fill:"url(#rp-gd)",d:"M15.568 17.073c-.89.6-2.026.963-3.37.963-.784 1.262-1.31 2.562 0 3.972 2.53 0 4.675-.783 6.295-2.14l.318-.278c1.482-1.37 2.473-3.244 2.83-5.46.098-.607.148-1.24.148-1.894l-2.265.3-1.912 1.35-.037.177a4.596 4.596 0 0 1-1.813 2.871l-.194.139Z"}),e.jsx("path",{fill:"#3086FF",d:"M12.207 10.195v3.864l5.368.004a7.211 7.211 0 0 1-.013.067h4.08a11.894 11.894 0 0 0-.034-3.94h-6.902v.005h-2.499Z"}),e.jsx("path",{fill:"url(#rp-ge)",d:"m6.532 10.336.072-.227a6.136 6.136 0 0 1 1.719-2.616c-.93-.157-3.263-1.525-3.567-2.14a10.066 10.066 0 0 0-1.477 2.174 9.885 9.885 0 0 0-1.07 4.694c.723.313 3.082.37 4.08 0a5.926 5.926 0 0 1 .243-1.885Z"}),e.jsx("path",{fill:"url(#rp-gf)",d:"M8.24 2.828 9.954 6.45c-.754.322-1.43.8-1.99 1.392l-3.77-1.798A10.016 10.016 0 0 1 8.24 2.828Z"}),e.jsx("path",{fill:"url(#rp-gg)",d:"M12.198 18.036a5.733 5.733 0 0 1-3.046-.879l-1.562-.043c-1.839.489-2.372.882-2.538 1.872a9.935 9.935 0 0 0 7.146 3.022v-3.972Z"}),e.jsxs("defs",{children:[e.jsxs("radialGradient",{id:"rp-ga",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(-.39758 -10.0212 14.2947 -.60136 9.548 18.953)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".142",stopColor:"#1ABD4D"}),e.jsx("stop",{offset:".616",stopColor:"#F7CD07"}),e.jsx("stop",{offset:".861",stopColor:"#FFCE0A"})]}),e.jsxs("radialGradient",{id:"rp-gb",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(6.98058 -.00002 -.00001 8.69619 18.606 7.276)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".408",stopColor:"#FB4E5A"}),e.jsx("stop",{offset:"1",stopColor:"#FF4540"})]}),e.jsxs("radialGradient",{id:"rp-gc",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(-9.69141 5.2869 7.2839 12.9533 14.943 .736)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".231",stopColor:"#FF4541"}),e.jsx("stop",{offset:"1",stopColor:"#FF8C18"})]}),e.jsxs("radialGradient",{id:"rp-gd",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(-17.1723 -22.6195 -8.27448 6.39613 12.433 20.73)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".132",stopColor:"#0CBA65"}),e.jsx("stop",{offset:".801",stopColor:"#3086FF"})]}),e.jsxs("radialGradient",{id:"rp-ge",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(-1.20393 10.4774 14.3481 1.68074 11.206 4)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".366",stopColor:"#FF4E3A"}),e.jsx("stop",{offset:"1",stopColor:"#FDCD01"})]}),e.jsxs("radialGradient",{id:"rp-gf",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(-3.50908 3.94959 -10.9464 -10.0725 9.582 3.782)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".316",stopColor:"#FF4C3C"}),e.jsx("stop",{offset:"1",stopColor:"#FF9F13"})]}),e.jsxs("radialGradient",{id:"rp-gg",cx:"0",cy:"0",r:"1",gradientTransform:"matrix(-9.59942 -5.20588 7.21476 -12.7547 14.895 23.203)",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:".231",stopColor:"#0FBC5F"}),e.jsx("stop",{offset:"1",stopColor:"#86C504"})]})]})]}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",className:"h-5 w-5 shrink-0",children:e.jsx("path",{fill:"#FF385C",fillRule:"evenodd",d:"M21.157 16.214c-.101-.24-.203-.5-.304-.72-.162-.36-.325-.701-.467-1.021l-.02-.02a208.116 208.116 0 0 0-4.488-9.05l-.061-.12c-.162-.3-.325-.62-.488-.94-.203-.36-.405-.741-.73-1.102A3.298 3.298 0 0 0 12.02 2c-1.015 0-1.929.44-2.6 1.202-.304.36-.527.74-.73 1.1-.163.32-.325.641-.487.942l-.062.12a233.985 233.985 0 0 0-4.487 9.048l-.02.04c-.142.32-.305.661-.467 1.022-.102.22-.203.46-.305.72-.264.74-.345 1.442-.243 2.162a4.264 4.264 0 0 0 2.639 3.323A4.208 4.208 0 0 0 6.903 22a5.422 5.422 0 0 0 2.559-.72c.832-.461 1.624-1.122 2.517-2.083.894.961 1.706 1.622 2.518 2.082a5.42 5.42 0 0 0 2.559.721c.568 0 1.137-.1 1.644-.32a4.257 4.257 0 0 0 2.64-3.324c.162-.7.082-1.4-.183-2.142ZM12 17.255c-1.096-1.361-1.806-2.642-2.05-3.723-.102-.461-.122-.861-.062-1.222.041-.32.163-.6.325-.84.386-.541 1.036-.881 1.787-.881.752 0 1.422.32 1.787.88.163.24.285.521.325.841.061.36.041.78-.06 1.222-.244 1.06-.955 2.342-2.052 3.723Zm8.102.941a2.98 2.98 0 0 1-1.847 2.342 3.11 3.11 0 0 1-1.544.2 4.02 4.02 0 0 1-1.543-.52c-.73-.4-1.462-1.02-2.315-1.942 1.34-1.622 2.153-3.103 2.457-4.424a4.95 4.95 0 0 0 .102-1.702 3.24 3.24 0 0 0-.548-1.361c-.63-.901-1.685-1.422-2.864-1.422-1.177 0-2.233.541-2.862 1.422-.285.4-.468.86-.549 1.361a4.092 4.092 0 0 0 .102 1.702c.304 1.321 1.137 2.823 2.457 4.444-.833.921-1.584 1.542-2.315 1.942-.528.3-1.036.46-1.543.52a3.297 3.297 0 0 1-1.543-.2 2.983 2.983 0 0 1-1.849-2.342c-.06-.5-.02-1 .183-1.562.062-.2.163-.4.265-.64.142-.32.304-.66.466-1l.02-.041A217.999 217.999 0 0 1 9.3 5.984l.061-.12c.162-.3.325-.62.487-.921.163-.32.346-.62.569-.88a2.134 2.134 0 0 1 1.624-.742c.63 0 1.198.261 1.625.741.223.26.406.56.568.881.163.3.325.62.488.921l.06.12a263.89 263.89 0 0 1 4.447 9.01v.02c.162.32.305.68.467 1 .102.24.203.44.264.64.163.52.224 1.022.142 1.542Z",clipRule:"evenodd"})}),e.jsx("span",{className:"text-sm font-bold text-secondary-900",children:"4.9"}),e.jsx("span",{className:"flex items-center gap-0.5",children:[0,1,2,3,4].map(t=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",className:"h-4 w-4 text-amber-400",children:e.jsx("path",{fillRule:"evenodd",d:"M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.1-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.551.297-1.584-.536-1.651l-4.752-.38-1.83-4.402Z",clipRule:"evenodd"})},t))}),e.jsx("span",{className:"text-sm text-secondary-500",children:"(10,000+)"})]})}const I=t=>t===!0||t===1||t==="1",it=t=>{const r=t||{};return[{label:I(r.shade)?"Full shade + flybridge":"Partial shade",present:!0,Icon:ae},{label:I(r.cabin)?"Cabin":"No cabin",present:I(r.cabin),Icon:ne},{label:I(r.ac)?"AC":"No AC",present:I(r.ac),Icon:ie},{label:I(r.sound)?"In-built Sound System ":"JBL Speaker",present:!0,Icon:le},{label:I(r.toilet)?"Toilet":"No toilet",present:I(r.toilet),Icon:oe}]},lt="https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",Se=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),De=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const s=t.replace(/<[^>]*>/g," "),i=Se(s).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},Te=t=>{if(!t||typeof t!="object")return"";const r=t.description||t.short_description||t.shortDescription||t.description_text||t.descriptionText||t.subtitle||t.helper||t.note||t.notes||t.details||t.desc||t.text||"";return De(r,{stripTrailingOne:!0})},Me=t=>{if(!t||typeof t!="object")return"";const r=t.images_with_thumbs?.[0]||{},n=[t.image,t.image_url,t.imageUrl,t.thumb,t.thumbnail,t.cover,t.photo,r.thumb1,r.thumb,r.original,t.images?.[0],t.gallery?.[0]].find(a=>typeof a=="string"&&a.trim().length>0);return n?n.trim():""},ot=(t,{extraDescription:r="",fallbackDescription:s="Detailed information is available on request.",fallbackImage:n=""}={})=>({description:[Te(t),r].filter(Boolean).join(`

`).trim()||s,image:Me(t)||n}),ct=t=>t.size?t.size:t.length?t.length:"";function Ie({isOpen:t,open:r,onClose:s,children:n,title:a,subTitle:i,subtitle:h,className:d="",maxWidth:u="max-w-xl",bodyClassName:l="",showClose:x=!0,closeOnBackdrop:m=!0}){const p=t??r,f=i??h,g=!!(a||f||x),w=o.useRef(0),[N,C]=o.useState(0),j=o.useRef(!1);o.useEffect(()=>{if(!p||typeof document>"u")return;const k=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=k}},[p]),o.useEffect(()=>{if(!p)return;const k=v=>{v.key==="Escape"&&(v.preventDefault(),s?.())};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[p,s]);const D=o.useCallback(k=>{w.current=k.touches[0].clientY,j.current=!0},[]),T=o.useCallback(k=>{if(!j.current)return;const v=Math.max(0,k.touches[0].clientY-w.current);C(v)},[]),S=o.useCallback(()=>{j.current&&(j.current=!1,N>80&&s?.(),C(0))},[N,s]);return typeof document>"u"||!p?null:U.createPortal(e.jsxs("div",{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6 anim-fade-in",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",style:{opacity:Math.max(0,1-N/300)},onClick:m?s:void 0}),e.jsxs("div",{className:_("relative flex w-full flex-col overflow-hidden bg-white shadow-2xl","rounded-t-2xl rounded-b-none max-h-[92dvh]","sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",u,d,"anim-slide-up-spring"),style:{transform:`translateY(${N}px)`,transition:N===0?"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)":"none"},children:[e.jsx("div",{className:"flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden touch-none",onTouchStart:D,onTouchMove:T,onTouchEnd:S,children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-neutral-300"})}),g?e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[a?e.jsx("h3",{className:"text-lg font-bold leading-tight text-secondary-900",children:a}):null,f?e.jsx("p",{className:"mt-1 text-sm font-medium text-secondary-500",dangerouslySetInnerHTML:{__html:f}}):null]}),x?e.jsx("button",{type:"button",onClick:s,className:"ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close modal",children:e.jsx(L,{className:"h-5 w-5 text-secondary-600"})}):null]}):null,e.jsx("div",{className:_("overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",l||"p-6"),children:n})]})]}),document.body)}function Pe({data:t,onClose:r,maxWidth:s="max-w-3xl"}){return e.jsx(Ie,{open:!!t,onClose:r,title:t?.title||"Details",subtitle:t?.subtitle||"",maxWidth:s,children:t?e.jsx("div",{className:"pb-2",children:e.jsxs("div",{className:"flex flex-col gap-5 sm:flex-row sm:items-start",children:[t.image?e.jsx("div",{className:"w-full shrink-0 sm:w-2/5",children:e.jsx("div",{className:"aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200",children:e.jsx("img",{src:t.image,alt:t.title||"",className:"h-full w-full object-cover",loading:"lazy",decoding:"async"})})}):null,e.jsx("div",{className:"flex-1 overflow-y-auto",children:t.description?e.jsx("div",{className:"prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&>div]:[padding:0_!important] [&>div]:[background:none_!important]",dangerouslySetInnerHTML:{__html:t.description}}):null})]})}):null})}let J=(t,r)=>`IDR ${Number(t).toLocaleString()}`;const dt=t=>{J=t};function ut(t){return J(t,{fromCurrency:"IDR"})}function q(t){if(!t)return"";const r=new Date(t+"T00:00:00");return Number.isNaN(r.getTime())?t:r.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function mt(t,r){return!t||!r?"":`${q(t)} - ${q(r)}`}function Re(t,r,s,n){if(!t||!n?.length)return null;const a=n.find(m=>Number(m.id)===Number(t));if(!a)return null;let i=r;r instanceof Date?i=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(i=new Date(r.startDate).toISOString().split("T")[0]);let h=a.packages?.pricelist||a.package?.pricelist||a.pricelist||[],d=Number(a.boat_price)||0;if(i&&a.pricesbydates?.length){const m=a.pricesbydates.find(p=>{const f=p.date_start,g=p.date_end;return i>=f&&i<=g});if(m){const p=m.packages||m.package;p?.pricelist&&(h=p.pricelist),m.boat_price!==void 0&&m.boat_price!==null&&(d=Number(m.boat_price))}}if(!h.length)return null;const u=String(s);let l=h.find(m=>String(m.members_count)===u);if(!l){const m=[...h].sort((p,f)=>Number(p.members_count)-Number(f.members_count));l=m.reverse().find(p=>Number(p.members_count)<=s)||m[0]}const x=Number(a.classes_id)===9||Number(a.classes_id)===10;return l?Number(l.price)+(x?0:d):null}function pt(t,r,s,n){return o.useMemo(()=>Re(t,r,s,n),[t,r,s,n])}function ht(t,r=600){const[s,n]=o.useState(!1),a=Array.isArray(t)?t.join(","):"";return o.useEffect(()=>{if(!t||!t.length){n(!0);return}let i=!1;const h=[...new Set(t.filter(Boolean))];let d=0,u=!1,l=!1;const x=()=>{!i&&u&&l&&n(!0)},m=()=>{d+=1,d>=h.length&&(u=!0,x())};h.forEach(g=>{const w=new Image;w.onload=m,w.onerror=m,w.src=g});const p=setTimeout(()=>{l=!0,x()},r),f=setTimeout(()=>{i||n(!0)},1500);return()=>{i=!0,clearTimeout(p),clearTimeout(f)}},[a,r]),s}const Le=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),Ee=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const s=t.replace(/<[^>]*>/g," "),i=Le(s).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z?-??])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},Ae=t=>{if(!t||typeof t!="object")return"";const r=t.description||t.short_description||t.shortDescription||t.description_text||t.descriptionText||t.subtitle||t.helper||t.note||t.notes||t.details||t.desc||t.text||"";return Ee(r,{stripTrailingOne:!0})},Fe=t=>{if(!t||typeof t!="object")return"";const r=t.images_with_thumbs?.[0]||{},n=[t.image,t.image_url,t.imageUrl,t.thumb,t.thumbnail,t.cover,t.photo,r.thumb1,r.thumb,r.original,t.images?.[0],t.gallery?.[0]].find(a=>typeof a=="string"&&a.trim().length>0);return n?n.trim():""},ze=(t,{extraDescription:r="",fallbackDescription:s="Detailed information is available on request.",fallbackImage:n=""}={})=>({description:[Ae(t),r].filter(Boolean).join(`

`).trim()||s,image:Fe(t)||n}),Be="https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";function xt({covers:t,selectedCoverId:r,onSelectCoverId:s,priceLabel:n="per person",formatPrice:a=d=>`IDR ${Number(d).toLocaleString()}`,showHeader:i=!0,framed:h=!0}){const d=t?.find(m=>String(m.id)===String(r)),[u,l]=o.useState(null),x=e.jsxs("div",{className:"flex flex-col divide-y divide-neutral-100",children:[e.jsxs("label",{className:_("group flex items-center gap-4 px-5 py-3 sm:py-4 cursor-pointer transition-all",r?"hover:bg-neutral-50":"bg-primary-50/30"),children:[e.jsx("input",{type:"radio",name:"cover-selection-compact",className:"hidden",checked:!r,onChange:()=>s(null)}),e.jsxs("div",{className:"flex min-w-0 flex-1 items-center gap-4",children:[e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center",children:e.jsx(ce,{className:_("h-5 w-5 sm:h-6 sm:w-6 transition-colors",r?"text-secondary-400":"text-primary-600")})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"text-sm font-bold text-secondary-900 sm:text-base",children:"No coverage"}),e.jsx("div",{className:"mt-1 text-sm font-medium text-secondary-500",children:"I have my own insurance"})]})]}),e.jsx("div",{className:"flex shrink-0 items-center justify-center",children:e.jsx("div",{className:_("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",r?"border-neutral-200 bg-white":"border-primary-600 bg-primary-600"),children:!r&&e.jsx(G,{className:"h-3 w-3 text-white"})})})]}),t&&t.map(m=>{const p=String(r)===String(m.id),f=Number(m.price),g=ze(m,{fallbackDescription:"Insurance terms and conditions will be confirmed before checkout.",fallbackImage:Be}),w=!!(g.description||g.image);return e.jsxs("label",{className:_("group flex items-center gap-4 px-5 py-3 sm:py-4 cursor-pointer transition-all",p?"bg-primary-50/30":"hover:bg-neutral-50"),children:[e.jsx("input",{type:"radio",name:"cover-selection-compact",className:"hidden",checked:p,onChange:()=>s(m.id)}),e.jsxs("div",{className:"flex min-w-0 flex-1 items-center gap-4",children:[e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center",children:e.jsx(de,{className:_("h-5 w-5 sm:h-6 sm:w-6 transition-colors",p?"text-primary-600":"text-secondary-400")})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"text-sm font-bold text-secondary-900 sm:text-base",children:m.name}),e.jsxs("div",{className:"mt-1 flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-semibold text-secondary-900 tabular-nums sm:text-base",children:a(f)}),e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-secondary-600",children:n})]}),w&&e.jsxs("button",{type:"button",onClick:N=>{N.preventDefault(),N.stopPropagation(),l({title:m.name,description:m.description||m.short_description||g.description,image:g.image})},className:"mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100",children:[e.jsx(ue,{className:"h-3.5 w-3.5"}),e.jsx("span",{children:"See full description"})]})]})]}),e.jsx("div",{className:"flex shrink-0 items-center justify-center",children:e.jsx("div",{className:_("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",p?"border-primary-600 bg-primary-600":"border-neutral-200 bg-white"),children:p&&e.jsx(G,{className:"h-3 w-3 text-white"})})})]},m.id)})]});return e.jsxs("div",{className:_(h&&"overflow-hidden rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md"),children:[i&&e.jsx("div",{className:"flex items-center justify-between px-6 py-5",children:e.jsxs("div",{children:[e.jsx("div",{className:"text-xl font-semibold text-secondary-900",children:"Insurance"}),e.jsx("div",{className:"text-sm text-secondary-500",children:d?d.name:"Optional protect your trip"})]})}),e.jsx("div",{className:_(i&&h&&"border-t border-neutral-200"),children:x}),e.jsx(Pe,{data:u?{...u,subtitle:"Coverage information"}:null,onClose:()=>l(null)})]})}function ft({images:t,alt:r,className:s,onOpenGallery:n,isLocked:a=!1,startIndex:i=0,alwaysShowControls:h=!1}){const d=t?.length?t:[],u=d.length,l=Math.min(Math.max(i||0,0),Math.max(u-1,0)),[x,m]=o.useState(l),[p,f]=o.useState(()=>{const c=new Set;return c.add(l),l>0&&c.add(l-1),l<u-1&&c.add(l+1),c}),g=o.useRef(null),w=o.useRef(l),N=o.useRef(null),C=o.useRef(!1);o.useEffect(()=>{const c=g.current;c&&l>0&&(c.scrollLeft=l*c.offsetWidth)},[]);const j=o.useCallback(c=>{f(b=>{const y=new Set(b);return y.add(c),c>0&&y.add(c-1),c<u-1&&y.add(c+1),y})},[u]),D=o.useCallback(c=>{const b=g.current;if(!b||u<=1)return;const y=Math.max(0,Math.min(u-1,x+c));y!==x&&(b.scrollTo({left:y*b.offsetWidth,behavior:"smooth"}),j(y))},[x,u,j]),T=o.useCallback(()=>{const c=g.current;if(!c)return;const b=Math.round(c.scrollLeft/c.offsetWidth);b!==w.current&&b>=0&&b<u&&(w.current=b,m(b),j(b))},[u,j]);if(!u)return e.jsxs("div",{className:_("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400",s),children:[e.jsx(Q,{className:"h-8 w-8 opacity-40"}),e.jsx("span",{className:"text-sm font-medium",children:"No photos yet"})]});const S=h?"absolute top-1/2 z-20 flex -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30":"absolute top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100",k=h?"absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60":"absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60 opacity-0 group-hover:opacity-100",v=()=>u<=1?null:u>12?e.jsx("div",{className:"absolute bottom-3 left-1/2 z-20 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/30",children:e.jsx("div",{className:"h-full rounded-full bg-white transition-all duration-300",style:{width:`${(x+1)/u*100}%`}})}):e.jsx("div",{className:"absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5",children:d.map((c,b)=>e.jsx("div",{className:_("h-1 rounded-full transition-all duration-300",b===x?"w-4 bg-white":"w-1.5 bg-white/40")},b))});return e.jsxs("div",{className:_("group relative w-full rounded-xl",!a&&"cursor-pointer"),onPointerDown:c=>{N.current={x:c.clientX},C.current=!1},onPointerMove:c=>{N.current&&Math.abs(c.clientX-N.current.x)>8&&(C.current=!0)},onClick:()=>{!a&&!C.current&&n?.(x)},children:[e.jsx("div",{ref:g,className:_("flex snap-x snap-mandatory rounded-xl",s),style:{overflowX:"scroll",scrollbarWidth:"none",msOverflowStyle:"none"},onScroll:a?void 0:T,children:d.map((c,b)=>{const y=c?.thumb||c?.path||c,M=c?.thumb_small||null;return e.jsx("div",{className:"flex-[0_0_100%] snap-center relative shrink-0 overflow-hidden",children:p.has(b)?e.jsx("img",{src:y,srcSet:M?`${M} 300w, ${y} 600w`:void 0,sizes:"(max-width: 640px) 100vw, 50vw",alt:b===x?r:"",className:_("absolute inset-0 h-full w-full object-cover transition-transform duration-500",b===x&&"group-hover:scale-[1.03]"),loading:"lazy",decoding:"async"}):e.jsx("div",{className:"absolute inset-0 bg-neutral-100 animate-pulse"})},b)})}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10 rounded-xl"}),!a&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:k,onClick:c=>{c.stopPropagation(),n?.(x)},"aria-label":"Expand Gallery",children:e.jsx(me,{className:"h-4 w-4"})}),u>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:c=>{c.stopPropagation(),D(-1)},className:_(S,"left-2"),"aria-label":"Previous photo",children:e.jsx(B,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:c=>{c.stopPropagation(),D(1)},className:_(S,"right-2"),"aria-label":"Next photo",children:e.jsx(W,{className:"h-4 w-4"})})]}),v()]})]})}const $e=`
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
`,Oe=o.forwardRef((t,r)=>e.jsx("input",{...t,ref:r,readOnly:!0}));function bt({mode:t="single",selected:r,onSelect:s,minDate:n=(()=>{const l=new Date;return l.setDate(l.getDate()+1),l.setHours(0,0,0,0),l})(),filterDate:a,onMonthChange:i,renderDayContents:h,className:d,inline:u=!1}){const l=t==="range",[x,m]=o.useState(!1),[p,f]=o.useState(!1);o.useEffect(()=>{Ne(()=>Promise.resolve({}),__vite__mapDeps([0]))},[]),o.useEffect(()=>{const j=()=>{m(window.innerWidth<=768)};return j(),window.addEventListener("resize",j),()=>window.removeEventListener("resize",j)},[]);const g=j=>{if(l){const[D,T]=j;s({from:D,to:T}),T&&!u&&setTimeout(()=>f(!1),100)}else s(j),u||setTimeout(()=>f(!1),100)};let w=null,N=null;l?(r?.from&&(w=r.from instanceof Date?r.from:new Date(r.from)),r?.to&&(N=r.to instanceof Date?r.to:new Date(r.to))):r&&(w=r instanceof Date?r:new Date(r));const C=x?1:l?2:1;return e.jsxs("div",{className:`premium-datepicker-wrapper${h?" has-custom-days":""}`,children:[e.jsx("style",{children:$e}),!u&&e.jsx(pe,{className:"date-icon h-5 w-5 text-secondary-300"}),e.jsx(te,{selected:w,startDate:w,endDate:N,onChange:g,minDate:n,filterDate:a,onMonthChange:i,renderDayContents:h,selectsRange:l,monthsShown:C,dateFormat:"MMM d, yyyy",placeholderText:l?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:j=>j.preventDefault(),customInput:x?e.jsx(Oe,{}):void 0,showPopperArrow:!1,popperPlacement:"bottom-start",inline:u,open:u?void 0:p,openToDate:w||new Date,onInputClick:u?void 0:()=>f(!0),onClickOutside:u?void 0:()=>f(!1),onCalendarClose:u?void 0:()=>f(!1),renderCustomHeader:({monthDate:j,decreaseMonth:D,increaseMonth:T,prevMonthButtonDisabled:S,nextMonthButtonDisabled:k})=>e.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[e.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:j.toLocaleString("en-US",{month:"long",year:"numeric"})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:D,disabled:S,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(B,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:T,disabled:k,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:e.jsx(W,{className:"h-4 w-4"})})]})]})})]})}const Ue=`
.bluuu-phone {
  display: flex;
  width: 100%;
}

.bluuu-phone .PhoneInputCountry {
  height: 2.75rem;
  border-radius: 0.75rem 0 0 0.75rem;
  border: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 0 0.5rem 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.bluuu-phone .PhoneInputCountrySelect {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  cursor: pointer;
}

.bluuu-phone .PhoneInputCountryIcon {
  width: 1.25rem;
  height: auto;
  display: flex;
  align-items: center;
}

.bluuu-phone .PhoneInputCountryIcon--border {
  box-shadow: none;
  background: none;
}

.bluuu-phone .PhoneInputCountrySelectArrow {
  width: 0.35em;
  height: 0.35em;
  border-color: #9ca3af;
  opacity: 1;
  margin-left: 0.25rem;
}

.bluuu-phone .PhoneInputInput {
  height: 2.75rem;
  width: 100%;
  border-radius: 0 0.75rem 0.75rem 0;
  border: 1px solid #e5e7eb;
  border-left: none;
  background: #ffffff;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  padding: 0.625rem 0.75rem;
  outline: none;
  box-shadow: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.bluuu-phone .PhoneInputInput:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.bluuu-phone .PhoneInputInput::placeholder {
  color: #9ca3af;
}
`;let H=!1;function gt({value:t,onChange:r}){if(!H&&typeof document<"u"){const s=document.createElement("style");s.textContent=Ue,document.head.appendChild(s),H=!0}return e.jsx(ke,{className:"bluuu-phone",international:!0,defaultCountry:"ID",value:t,onChange:r,limitMaxLength:!1})}function wt(){const[t,r]=o.useState(null),{getPolicy:s}=X(),n=o.useCallback(h=>{r(h)},[]),a=o.useCallback(()=>{r(null)},[]),i=t?s(t):null;return o.useEffect(()=>{const h=d=>n(d.detail);return window.addEventListener("open-policy",h),()=>window.removeEventListener("open-policy",h)},[n]),{activePolicyKey:t,activePolicy:i,openPolicy:n,closePolicy:a}}function yt({activePolicyKey:t,activePolicy:r,onClose:s}){const{loading:n}=X(),a=!!t,i=!!r?.html?.trim();return e.jsx(Z,{isOpen:a,onClose:s,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:i?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"text-lg font-semibold text-secondary-900",children:r.title}),e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:r.subtitle})]}),e.jsx("button",{type:"button",onClick:s,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx(L,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-secondary-600",children:e.jsx("div",{className:"policy-rich-content",dangerouslySetInnerHTML:{__html:r.html}})})]}):n?e.jsxs("div",{className:"flex h-full w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{className:"min-w-0 animate-pulse space-y-2",children:[e.jsx("div",{className:"h-5 w-40 rounded bg-neutral-200"}),e.jsx("div",{className:"h-4 w-56 rounded bg-neutral-100"})]}),e.jsx("button",{type:"button",onClick:s,className:"inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700","aria-label":"Close",children:e.jsx(L,{className:"h-5 w-5"})})]}),e.jsx("div",{className:"custom-scrollbar flex-1 overflow-y-auto px-6 py-5",children:e.jsx("div",{className:"animate-pulse space-y-3",children:Array.from({length:9}).map((h,d)=>e.jsx("div",{className:"h-4 rounded bg-neutral-100",style:{width:`${96-d%3*12}%`}},d))})})]}):e.jsx("div",{className:"px-6 py-6 text-sm text-secondary-500",children:"Policy not found."})})}function We({restaurantData:t,onClose:r}){const s=t,n=s?.name||s?.title||s?.restaurant_name||"",a=s?.images_with_thumbs?.length?s.images_with_thumbs:s?.image?[{thumb:s.image,thumb_small:s.image}]:[],i=s?.description||"",h=s?.menu||"",[d,u]=o.useState(0);o.useEffect(()=>{u(0)},[t]);const l=a.length,x=()=>u(f=>(f-1+l)%l),m=()=>u(f=>(f+1)%l),p=a[d]||null;return e.jsx(Z,{open:!!t,onClose:r,title:n||"Restaurant",subtitle:"Included lunch",maxWidth:"max-w-3xl",children:e.jsx("div",{className:"pb-4",children:e.jsxs("div",{className:"flex flex-col gap-5 sm:flex-row sm:items-start",children:[l>0?e.jsx("div",{className:"w-full shrink-0 sm:w-2/5",children:e.jsxs("div",{className:"relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100",children:[e.jsx("img",{src:p.thumb,srcSet:p.thumb_small?`${p.thumb_small} 200w, ${p.thumb} 400w`:void 0,sizes:"(max-width: 640px) 100vw, 280px",alt:`${n} ${d+1}`,className:"h-full w-full object-cover transition-opacity duration-200",loading:"lazy",decoding:"async"},d),l>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:x,className:"absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60","aria-label":"Previous photo",children:e.jsx(B,{className:"h-4 w-4"})}),e.jsx("button",{type:"button",onClick:m,className:"absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60","aria-label":"Next photo",children:e.jsx(W,{className:"h-4 w-4"})}),e.jsxs("div",{className:"absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm",children:[d+1," / ",l]})]})]})}):null,e.jsxs("div",{className:"flex-1 space-y-3 overflow-y-auto",children:[i?e.jsx("div",{className:"text-sm leading-relaxed text-secondary-600",dangerouslySetInnerHTML:{__html:i}}):null,h?e.jsx("div",{className:"prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1",dangerouslySetInnerHTML:{__html:h}}):null]})]})})})}const Ze=(t="")=>t.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),A=(t,{stripTrailingOne:r=!1}={})=>{if(typeof t!="string")return"";const s=t.replace(/<[^>]*>/g," "),i=Ze(s).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},Y=t=>!t||typeof t!="object"?"":A(t.name||t.title||t.restaurant_name||t.restaurantName||"",{stripTrailingOne:!0}),K=t=>!t||typeof t!="object"?"":A(t.description||t.short_description||t.shortDescription||t.details||t.menu||"",{stripTrailingOne:!0}),Ge=(t,r=null,s=null)=>{const n=A(t?.details,{stripTrailingOne:!0}),a=r&&typeof r=="object"?r:null,i=s&&typeof s=="object"?s:null,h=n&&(n.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||n.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",d=Y(a)||Y(i)||h,u=K(a)||K(i),l=n&&n!==String(t?.title||"").trim()&&n!==d?n:"",x=u||l,m=d||x?{...a||{},...i||{},name:d,description:x}:null;return{title:d?`Lunch at ${d}`:t?.title||"Lunch",description:x,popupRestaurant:m}},qe=(t="")=>{const r=String(t).toLowerCase();return r.includes("meet")||r.includes("pick")?z:r.includes("depart")||r.includes("boat")?he:r.includes("snorkeling")||r.includes("swim")||r.includes("manta")?xe:r.includes("lunch")||r.includes("food")?V:r.includes("return")||r.includes("back")?fe:r.includes("photo")?Q:be};function O({item:t}){const r=qe(t.title),s=A(t.details,{stripTrailingOne:!0}),n=/lunch/i.test(t.title),a=n?Ge(t):null,i=a?.title||t.title,h=n?a?.description:s;return e.jsxs("div",{className:"flex items-start gap-3 py-3",children:[e.jsx("div",{className:"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary-500",children:e.jsx(r,{className:"h-4 w-4"})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[e.jsx("div",{className:"text-base font-semibold text-secondary-900",children:i}),e.jsxs("div",{className:"text-sm font-semibold text-secondary-500",children:[t.time,t.duration?` (${t.duration})`:""]})]}),h?e.jsx("div",{className:"mt-0.5 text-sm leading-relaxed text-secondary-600",children:h}):null]})]})}function ee({restaurant:t,onClick:r}){const s=t?.name||t?.title||t?.restaurant_name||t?.restaurantName||"";if(!s)return null;const n=t.image||t.images_with_thumbs?.[0]?.thumb||null;return e.jsxs("button",{type:"button",onClick:()=>r?.(t),className:"w-full min-h-[64px] flex items-center gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-neutral-300 hover:bg-white",children:[n?e.jsx("div",{className:"h-16 w-16 shrink-0",children:e.jsx("img",{src:n,alt:t.name,className:"h-full w-full object-cover"})}):e.jsx("div",{className:"h-16 w-16 shrink-0 bg-primary-50 flex items-center justify-center",children:e.jsx(V,{className:"h-5 w-5 text-primary-300"})}),e.jsx("div",{className:"flex-1 min-w-0 px-3 py-2",children:e.jsx("div",{className:"text-sm font-bold text-secondary-900 truncate",children:s})}),e.jsxs("div",{className:"shrink-0 pr-3 text-sm font-semibold text-primary-600 flex items-center gap-1",children:["View menu",e.jsx(ge,{className:"h-3.5 w-3.5 text-primary-400"})]})]})}function vt({isOpen:t,onClose:r,title:s,subtitle:n="Morning plan is similar for all styles. Afternoon changes by style.",note:a,schedule:i,isLoading:h=!1,restaurantData:d=null,routeRestaurant:u=null,onRestaurantClick:l,sectionLabels:x={beforeLunch:"Morning",afterLunch:"Afternoon"}}){const m=[{label:x.beforeLunch,items:i?.beforeLunch||[]},{label:x.afterLunch,items:i?.afterLunch||[]}].filter(f=>f.items.length>0),p=i?.footerNotes||[];return e.jsx(Z,{isOpen:t,onClose:r,maxWidth:"max-w-3xl",bodyClassName:"p-0",showClose:!1,children:e.jsxs("div",{className:"flex w-full flex-col overflow-hidden bg-white p-0",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-semibold text-secondary-900",children:s?`${s} schedule`:"Schedule"}),n&&e.jsx("div",{className:"mt-1 text-sm text-secondary-500",children:n})]}),e.jsx("button",{type:"button",onClick:r,className:"p-2 hover:bg-neutral-100 rounded-full transition-colors -mr-2 -mt-2","aria-label":"Close",children:e.jsx(L,{className:"w-5 h-5 text-secondary-500"})})]}),e.jsx("div",{className:"overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",children:h?e.jsx("div",{className:"flex items-center justify-center h-48",children:e.jsx("div",{className:"h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"})}):e.jsxs("div",{className:"grid gap-3 grid-cols-1",children:[a&&e.jsx("div",{className:"mb-1 rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm text-primary-600 font-medium",children:a}),m.map((f,g)=>e.jsxs(re.Fragment,{children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:f.label}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:f.items.map((w,N)=>e.jsx(O,{item:w},`${f.label}-${N}`))})]}),g===0&&e.jsx(ee,{restaurant:d,onClick:l})]},f.label)),p.length>0&&e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:p.map((f,g)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:f},g))})]})})]})})}function jt({style:t,schedule:r,note:s,restaurant:n,onAnotherRoute:a,onContinue:i,continueLabel:h="Choose your boat",anotherRouteLabel:d="Another route"}){const[u,l]=o.useState(null);return!t||!r?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"space-y-8",children:e.jsx("div",{className:"rounded-xl border border-neutral-200 bg-white",children:e.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-start",children:[e.jsx("div",{className:"relative h-80 sm:h-96 lg:h-auto w-full lg:w-[38%] shrink-0 overflow-hidden p-4 lg:p-6 lg:sticky lg:top-16 rounded-t-xl lg:rounded-t-none lg:rounded-l-xl",children:e.jsx("img",{src:t.map||"https://bluuu.tours/themes/bluuu/assets/images/map.webp",alt:t.title||"Route map",className:"h-full w-full object-contain",loading:"lazy",decoding:"async"})}),e.jsxs("div",{className:"flex-1 flex flex-col p-5 sm:p-8 lg:p-10",children:[e.jsxs("div",{className:"shrink-0",children:[e.jsx("h3",{className:"text-lg font-bold text-secondary-900 sm:text-xl",children:t.title}),e.jsx("p",{className:"mt-1 text-sm text-secondary-600",children:A(t.description,{stripTrailingOne:!0})}),e.jsx("p",{className:"mt-1 text-sm text-secondary-600",children:"Times are approximate and may adjust due to sea conditions (safety-first routing)."}),s?e.jsx("div",{className:"mt-3 rounded-full border border-primary-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-primary-600",children:s}):null]}),e.jsxs("div",{className:"mt-4 grid gap-3 grid-cols-1",children:[e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:"Morning"}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:r.beforeLunch.map((x,m)=>e.jsx(O,{item:x},`morning-${m}`))}),(n||t.restaurant)&&e.jsx("div",{className:"mt-3",children:e.jsx(ee,{restaurant:n||t.restaurant,onClick:l})})]}),e.jsxs("div",{className:"rounded-xl",children:[e.jsx("div",{className:"mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300",children:"Midday & Afternoon"}),e.jsx("div",{className:"divide-y divide-neutral-100 border-t border-neutral-100",children:r.afterLunch.map((x,m)=>e.jsx(O,{item:x},`afternoon-${m}`))})]}),(r.footerNotes||[]).length?e.jsx("div",{className:"border-t border-neutral-200 pt-3 space-y-1.5",children:r.footerNotes.map((x,m)=>e.jsx("p",{className:"text-sm italic text-secondary-400",children:x},m))}):null]}),e.jsxs("div",{className:"shrink-0 mt-4 flex items-center justify-end gap-4 border-t border-neutral-100 pt-4",children:[e.jsxs("button",{type:"button",onClick:a,className:"inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-400 transition hover:text-secondary-700",children:[e.jsx(B,{className:"h-4 w-4"}),d]}),e.jsxs(_e,{onClick:i,className:"rounded-full px-3 sm:px-6 text-sm whitespace-nowrap",children:[h," ",e.jsx(we,{className:"h-4 w-4 ml-1"})]})]})]})]})})}),e.jsx(We,{restaurantData:u,onClose:()=>l(null)})]})}const Nt=({children:t,className:r="",containerClassName:s="",size:n="md",id:a,backgroundClassName:i="",title:h,subtitle:d,kicker:u,titleAddon:l,titleClassName:x="",subtitleClassName:m="",centered:p=!1,...f})=>{const g={none:"py-0",sm:"py-8 sm:py-12",md:"py-12 sm:py-16",lg:"py-16 sm:py-24"};return e.jsx("section",{id:a,className:`${g[n]} ${i} ${r}`,...f,children:e.jsxs("div",{className:`container ${s}`,children:[(h||u||d)&&e.jsxs("div",{className:`mb-8 flex flex-col sm:mb-10 ${p?"items-center text-center":"items-start text-left"}`,children:[u&&e.jsx("div",{className:"mb-2 text-xs font-black uppercase tracking-widest text-primary-600",children:u}),e.jsxs("div",{className:`flex w-full flex-wrap gap-4 ${p?"justify-center":"items-end justify-between"}`,children:[e.jsxs("div",{className:`w-full ${p?"max-w-[880px]":"max-w-[880px] flex-1"}`,children:[h&&e.jsx("h2",{className:`text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl ${x}`,children:h}),d&&e.jsx("p",{className:`mt-2 text-lg text-secondary-600 ${p?"mx-auto":""} ${m}`,children:d})]}),!p&&l&&e.jsx("div",{className:"ml-auto",children:l})]})]}),t]})})},He={name:"Bluuu",product:"Nusa Penida shared speedboat day tour",reviewCount:"8,595",reviewLabel:"reviews",rating:"4.9",ratingLabel:"avg rating",badges:[{icon:"Star",label:"Customer choice"},{icon:"MapPin",label:"Free Bluuu Bus shuttle"},{icon:"BadgeCheck",label:"Safety first"},{icon:"LifeBuoy",label:"24/7 support"}]},Ye=[{id:"included",label:"Included"},{id:"pickup",label:"Pickup"},{id:"safety",label:"Safety"},{id:"cancellation",label:"Cancelation"},{id:"weather",label:"Weather guarantee"},{id:"faq",label:"FAQ"}],Ke=[{id:"hero",label:"Home"},{id:"social",label:"Reviews"},{id:"included",label:"Included"},{id:"gallery",label:"Gallery"},{id:"extras",label:"Add extras"},{id:"faq",label:"FAQ"},{id:"booking",label:"Book"}],kt={cancellationCards:[{id:"full-refund",icon:"CheckCircle2",title:"Cancel 24h+ before departure -> Full refund",text:"Cancel at least 24 hours before your scheduled start time and receive a full refund.",accent:"border-l-emerald-500",iconColor:"text-emerald-600",bg:"border-emerald-100 bg-emerald-50"},{id:"no-refund",icon:"AlertTriangle",title:"Cancel within 24h -> No refund",text:"Cancellations made less than 24 hours before departure are non-refundable.",accent:"border-l-rose-500",iconColor:"text-rose-600",bg:"border-rose-100 bg-rose-50"},{id:"weather-refund",icon:"CloudRain",title:"Weather cancellation (by us) -> Full refund",text:"If we cancel due to unsafe sea conditions, you can reschedule or receive a full refund.",accent:"border-l-sky-500",iconColor:"text-sky-600",bg:"border-sky-100 bg-sky-50"}],weatherGuarantee:[{icon:"Calendar",title:"Free reschedule",text:"Move your trip to the next available safe date with no additional fee."},{icon:"CheckCircle2",title:"Full refund option",text:"Choose a full refund if you prefer not to reschedule."},{icon:"MessageCircle",title:"Fast notification",text:"We contact you quickly on WhatsApp when weather affects operations."}],includedSections:[{title:"Essentials",items:[{icon:"Ship",label:"Private boat",helper:"Your group only, no shared seats."},{icon:"BadgeCheck",label:"Certified guides",helper:"Experienced crew on every tour."},{icon:"Fish",label:"Snorkeling equipment",helper:"Masks, fins, and safety gear."},{icon:"Coffee",label:"Drinking water",helper:"Cold bottled water onboard."}]},{title:"Comfort",items:[{icon:"Waves",label:"Towels",helper:"Fresh towels for each guest."}]},{title:"Tickets & coverage",items:[{icon:"Ticket",label:"All entrance tickets",helper:"No extra fees on the day."},{icon:"Shield",label:"Health insurance",helper:"Coverage for on-trip activities."}]},{title:"Media",items:[{icon:"Camera",label:"Underwater GoPro footage",helper:"Crew captures your highlights."}]}]},_t=[{icon:"BadgeCheck",q:"Whats included",a:"Premium boat, lunch, land tour, snorkel gear, tickets, photographer + Prosecco moment."},{icon:"Users",q:"Kids?",a:"Private tours are perfect for families with children, including younger kids."},{icon:"CloudRain",q:"Rain?",a:"Weather guarantee: if we cancel due to unsafe conditions, reschedule or receive a full refund."},{icon:"Clock",q:"Start/finish time",a:"Private tours let guests choose the start time  any time between 08:00 and 11:00. Exact timing confirmed after booking."},{icon:"Sparkles",q:"Showers",a:"Post-tour showers are available."},{icon:"Waves",q:"Seasickness?",a:"Upgraded comfort yacht for a smoother ride. If youre prone, bring motion-sickness tablets."}],E={brand:He,infoDrawerTabs:Ye,sections:Ke},Qe={Star:je,MapPin:z,BadgeCheck:ve,LifeBuoy:ye},Ve={...E.brand,badges:E.brand.badges.map(t=>({...t,icon:Qe[t.icon]}))},Ct=35e4;parseInt(String(Ve.reviewCount).replace(/[^0-9]/g,""),10);const St=E.infoDrawerTabs,Dt=E.sections,Tt=E.sectionBackgrounds??{white:"bg-transparent",ocean:"bg-transparent",lagoon:"bg-transparent",mist:"bg-transparent"};export{at as A,Ve as B,bt as C,Ct as G,Pe as I,Ie as M,yt as P,nt as R,Tt as S,jt as T,wt as a,Z as b,_ as c,ht as d,Nt as e,q as f,ct as g,ft as h,vt as i,We as j,Re as k,mt as l,ut as m,xt as n,gt as o,it as p,ot as q,lt as r,De as s,dt as t,pt as u,kt as v,St as w,I as x,_t as y,Dt as z};
