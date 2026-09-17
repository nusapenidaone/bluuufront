import{r as x,j as t,a as Q,D as ue}from"./vendor-datepicker-DXD6OlhH.js";import{e as xe}from"./index-CW6G0aLb.js";import{B as ee}from"./Navbar-CHOJ55E3.js";import{X as te,ae as he,d as q,l as $,i as K,E as re,D as ae,T as fe,C as be,y as ge,z as we,Z as ye,m as ke,r as ve,G as je,L as Ne,e as ne,U as _e,q as Se,W as De,s as Te,B as Pe,w as Ce,t as Le,F as Ee,k as se,u as ie,x as oe,v as ce,S as le,f as de}from"./vendor-icons-BeYyr5Yb.js";import{u as Ie,a as Me,A as Re,m as B}from"./vendor-motion-DF4vK5ss.js";let F=null;function ze(e){window.google?.maps?.importLibrary||(r=>{let i,l,d;const n="The Google Maps JavaScript API",o="google",p="importLibrary",c="__ib__",h=document,m=window;m[o]=m[o]||{};const a=m[o].maps||(m[o].maps={}),s=new Set,b=new URLSearchParams,g=()=>i||(i=new Promise(async(k,f)=>{l=h.createElement("script"),b.set("libraries",[...s]+"");for(d in r)b.set(d.replace(/[A-Z]/g,v=>"_"+v[0].toLowerCase()),r[d]);b.set("callback",o+".maps."+c),l.src=`https://maps.${o}apis.com/maps/api/js?`+b,a[c]=k,l.onerror=()=>i=f(Error(n+" could not load.")),l.nonce=h.querySelector("script[nonce]")?.nonce||"",h.head.append(l)}));a[p]?console.warn(n+" only loads once. Ignoring:",r):a[p]=(k,...f)=>s.add(k)&&g().then(()=>a[p](k,...f))})({key:e,v:"weekly"})}function G(){return F||(ze("AIzaSyC_RrKc9v7DS51etBhBRzRopKknc9jHhbs"),F=Promise.all([window.google.maps.importLibrary("maps"),window.google.maps.importLibrary("places"),window.google.maps.importLibrary("geocoding")]).then(()=>window.google),F)}const O={south:-9,west:114.4,north:-7.9,east:116},Ae={lat:-8.719,lng:115.169};function $e({value:e,onChange:r,placeholder:i,className:l,confirmed:d=!1,onConfirmedChange:n,onLocationChange:o,defaultShowMap:p=!1}){const c=x.useRef(null),h=x.useRef(null),m=x.useRef(null),a=x.useRef(null),s=x.useRef(null),[b,g]=x.useState([]),[k,f]=x.useState(!1),[v,T]=x.useState(null),[E,M]=x.useState(p),[j,S]=x.useState(null);x.useEffect(()=>{c.current&&document.activeElement!==c.current&&(c.current.value=e??"")},[e]);const P=x.useCallback(async y=>{if(!y||y.length<2){g([]);return}try{const _=await G(),L=new _.maps.LatLngBounds(new _.maps.LatLng(O.south,O.west),new _.maps.LatLng(O.north,O.east)),{suggestions:w}=await _.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({input:y,locationRestriction:L,includedRegionCodes:["id"]});g(w??[]),c.current&&S(c.current.getBoundingClientRect()),f(!0)}catch{g([])}},[]),C=y=>{const _=y.target.value;r(_),n?.(!1),T(null),o?.(null),clearTimeout(s.current),s.current=setTimeout(()=>P(_),250)},u=async y=>{const _=y.placePrediction.mainText?.text??"",L=y.placePrediction.secondaryText?.text??"",w=L?`${_}, ${L}`:_;r(w),n?.(!0),c.current&&(c.current.value=w),g([]),f(!1);try{const R=y.placePrediction.toPlace();await R.fetchFields({fields:["location"]});const z=R.location;if(z){const Z={lat:z.lat(),lng:z.lng()};T(Z),o?.(Z)}else o?.(null)}catch{o?.(null)}},N=()=>{r(""),n?.(!1),c.current&&(c.current.value=""),g([]),f(!1),T(null),o?.(null),a.current&&(a.current.setMap(null),a.current=null)},I=x.useCallback(async y=>{const _=await G(),L=new _.maps.Geocoder,{results:w}=await L.geocode({location:y});if(w?.[0]){const R=w[0].formatted_address;r(R),n?.(!0),c.current&&(c.current.value=R)}},[r,n]);x.useEffect(()=>{if(!E||!h.current)return;const y=v??Ae;G().then(_=>{m.current?(m.current.setCenter(y),v&&a.current&&a.current.setPosition(y)):(m.current=new _.maps.Map(h.current,{zoom:v?15:11,center:y,disableDefaultUI:!0,zoomControl:!0,gestureHandling:"cooperative",clickableIcons:!1}),m.current.addListener("click",L=>{const w={lat:L.latLng.lat(),lng:L.latLng.lng()};T(w),o?.(w),a.current?a.current.setPosition(w):(a.current=new _.maps.Marker({position:w,map:m.current,draggable:!0}),a.current.addListener("dragend",R=>{const z={lat:R.latLng.lat(),lng:R.latLng.lng()};T(z),o?.(z),I(z)})),I(w)}),v&&(a.current=new _.maps.Marker({position:y,map:m.current,draggable:!0}),a.current.addListener("dragend",L=>{const w={lat:L.latLng.lat(),lng:L.latLng.lng()};T(w),o?.(w),I(w)})))})},[E,v,I]);const A=typeof n=="function"&&!!(e&&e.trim())&&!d;return t.jsxs("div",{className:"relative",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("input",{ref:c,type:"text",defaultValue:e,onChange:C,onBlur:()=>{clearTimeout(s.current),setTimeout(()=>f(!1),150)},placeholder:i,className:l,autoComplete:"off"}),p?t.jsx("button",{type:"button",onClick:N,disabled:!e,title:"Clear address",className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-secondary-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-secondary-500",children:t.jsx(te,{className:"h-4 w-4"})}):t.jsx("button",{type:"button",onClick:()=>M(y=>!y),title:E?"Hide map":"Show on map",className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-secondary-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",children:t.jsx(he,{className:"h-4 w-4"})})]}),A&&t.jsxs("div",{className:"mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800",children:[t.jsx("span",{className:"flex-1 min-w-[140px]",children:"Pick a suggestion above, or confirm this address is correct."}),t.jsx("button",{type:"button",onClick:()=>n(!0),className:"shrink-0 rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-amber-700",children:"Use as entered"})]}),k&&b.length>0&&j&&Q.createPortal(t.jsx("ul",{style:{position:"fixed",top:j.bottom+4,left:j.left,width:j.width,zIndex:10050},className:"overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg",children:b.map((y,_)=>{const L=y.placePrediction.mainText?.text??"",w=y.placePrediction.secondaryText?.text??"";return t.jsxs("li",{onMouseDown:()=>u(y),className:"flex cursor-pointer items-start gap-2 px-3 py-2.5 hover:bg-neutral-50",children:[t.jsx(q,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary-600"}),t.jsxs("div",{className:"min-w-0",children:[t.jsx("div",{className:"truncate font-medium text-secondary-900",children:L}),w&&t.jsx("div",{className:"truncate text-xs text-secondary-400",children:w})]})]},_)})}),document.body),E&&t.jsxs("div",{className:"mt-2 overflow-hidden rounded-lg border border-neutral-200",children:[t.jsx("div",{ref:h,className:"h-52 w-full"}),t.jsxs("div",{className:"flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 text-xs text-secondary-400",children:[t.jsx(q,{className:"h-3 w-3 shrink-0"}),"Нажмите на карту чтобы поставить точку, или перетащите маркер"]})]})]})}function D(...e){return e.filter(Boolean).join(" ")}function at(e,r,i){const l=e?.conflictIds||e?.conflict_ids||[],d=o=>Number(o?.qty??o??0),n=l.find(o=>d(r?.[o])>0);return n==null?null:{id:n,name:i?.[n]?.name||"another extra"}}const Be={"max-w-md":"sm:max-w-md","max-w-lg":"sm:max-w-lg","max-w-xl":"sm:max-w-xl","max-w-2xl":"sm:max-w-2xl","max-w-3xl":"sm:max-w-3xl","max-w-4xl":"sm:max-w-4xl","max-w-5xl":"sm:max-w-5xl","max-w-screen-sm":"sm:max-w-screen-sm","max-w-[720px]":"sm:max-w-[720px]"},pe=({isOpen:e,open:r,onClose:i,children:l,title:d,subTitle:n,subtitle:o,className:p="",maxWidth:c="max-w-xl",bodyClassName:h="",showClose:m=!0,closeOnBackdrop:a=!0,dark:s=!1,hideDragHandle:b=!1,footer:g,backdropClassName:k})=>{const f=e??r,v=n??o,T=Ie(0),E=Me(T,[0,300],[1,0]),M=x.useRef(0);return x.useEffect(()=>{if(f||typeof window>"u")return;const j=()=>{M.current=window.scrollY};return j(),window.addEventListener("scroll",j,{passive:!0}),()=>window.removeEventListener("scroll",j)},[f]),x.useLayoutEffect(()=>{if(!f||typeof document>"u")return;const j=document.documentElement,S=document.body,P=M.current,C=window.innerWidth-j.clientWidth,u={overflow:j.style.overflow,paddingRight:S.style.paddingRight};if(j.style.overflow="hidden",C>0){const N=parseFloat(getComputedStyle(S).paddingRight)||0;S.style.paddingRight=`${N+C}px`}return()=>{j.style.overflow=u.overflow,S.style.paddingRight=u.paddingRight,window.scrollY!==P&&window.scrollTo(0,P)}},[f]),x.useEffect(()=>{if(!f)return;const j=S=>{S.key==="Escape"&&(S.preventDefault(),i?.())};return window.addEventListener("keydown",j),()=>window.removeEventListener("keydown",j)},[f,i]),typeof document>"u"?null:Q.createPortal(t.jsx(Re,{children:f?t.jsxs(B.div,{className:"fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},children:[t.jsx(B.div,{className:D("absolute inset-0",k||"bg-black/15 backdrop-blur-[2px]"),style:{opacity:E},onClick:a?i:void 0}),t.jsxs(B.div,{className:D("relative flex w-full flex-col overflow-hidden shadow-2xl",s?"bg-[#111d35] border border-white/10":"bg-white","rounded-t-3xl rounded-b-none max-h-[92dvh]","sm:rounded-3xl sm:max-h-[calc(100dvh-48px)]",Be[c]||c,p),style:{y:T},drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},dragListener:!1,onDragEnd:(j,S)=>{S.offset.y>80||S.velocity.y>500?i?.():T.set(0)},initial:{opacity:0,y:60},animate:{opacity:1,y:0},exit:{opacity:0,y:60},transition:{type:"spring",bounce:.15,duration:.4},children:[t.jsx(B.div,{className:D("flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden",b&&"hidden"),drag:"y",dragConstraints:{top:0,bottom:0},dragElastic:{top:0,bottom:.3},style:{y:T,touchAction:"none"},onDragEnd:(j,S)=>{S.offset.y>80||S.velocity.y>500?i?.():T.set(0)},children:t.jsx("div",{className:D("h-1 w-10 rounded-full",s?"bg-white/20":"bg-neutral-300")})}),d||v||m?t.jsxs("div",{className:D("flex shrink-0 items-center justify-between gap-4 px-6 py-4 border-b",s?"bg-transparent border-white/10":"bg-white border-neutral-100"),children:[t.jsxs("div",{className:"min-w-0 flex-1",children:[d?t.jsx("h3",{className:D("text-xl font-bold leading-tight",s?"text-white":"text-secondary-900"),children:d}):null,v?t.jsx("p",{className:D("mt-1 text-sm font-medium",s?"text-white/50":"text-secondary-500"),children:v}):null]}),m?t.jsx("button",{type:"button",onClick:i,className:D("ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all",s?"border-white/10 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white":"border-neutral-200/60 bg-white/90 text-secondary-500 hover:bg-white hover:text-secondary-900"),"aria-label":"Close modal",children:t.jsx(te,{className:"h-4.5 w-4.5"})}):null]}):null,t.jsx("div",{className:D("min-h-0 flex-1 overflow-y-auto modal-scrollbar",h||"p-6"),children:l}),g&&t.jsx("div",{className:D("shrink-0 border-t px-6 py-4",s?"border-white/10 bg-[#111d35]":"border-neutral-100 bg-white"),children:g})]})]}):null}),document.body)},Fe=(e="")=>e.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),Oe=(e,{stripTrailingOne:r=!1}={})=>{if(typeof e!="string")return"";const i=e.replace(/<[^>]*>/g," "),n=Fe(i).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?n.replace(/\s+1$/,"").trim():n},me=e=>{if(!e||typeof e!="object")return"";const r=e.description||e.short_description||e.shortDescription||e.description_text||e.descriptionText||e.subtitle||e.helper||e.note||e.notes||e.details||e.desc||e.text||"";return Oe(r,{stripTrailingOne:!0})},nt=e=>e.size?e.size:e.length?e.length:"";let Y=(e,r)=>`${Number(e).toLocaleString()} IDR`;const st=e=>{Y=e};function U(e){return Y(e,{fromCurrency:"IDR"})}function it(e){return Y(e,{fromCurrency:"USD"})}function V(e){if(!e)return"";const r=new Date(e+"T00:00:00");return Number.isNaN(r.getTime())?e:r.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function ot(e,r){return!e||!r?"":`${V(e)} - ${V(r)}`}function Ue(e,r,i,l){if(!e||!l?.length)return null;const d=l.find(a=>Number(a.id)===Number(e));if(!d)return null;let n=r;r instanceof Date?n=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(n=new Date(r.startDate).toISOString().split("T")[0]);let o=d.packages?.pricelist||d.package?.pricelist||d.pricelist||[],p=Number(d.boat_price)||0;if(n&&d.pricesbydates?.length){const a=d.pricesbydates.find(s=>{const b=s.date_start,g=s.date_end;return n>=b&&n<=g});if(a){const s=a.packages||a.package;s?.pricelist&&(o=s.pricelist),a.boat_price!==void 0&&a.boat_price!==null&&(p=Number(a.boat_price))}}if(!o.length)return null;const c=String(i);let h=o.find(a=>String(a.members_count)===c);if(!h){const a=[...o].sort((s,b)=>Number(s.members_count)-Number(b.members_count));h=a.reverse().find(s=>Number(s.members_count)<=i)||a[0]}const m=Number(d.classes_id)===9||Number(d.classes_id)===10;return h?Number(h.price)+(m?0:p):null}function ct(e,r,i){if(!e||!r||!i?.length)return!1;const l=i.find(n=>Number(n.id)===Number(e));if(!l?.pricesbydates?.length)return!1;let d=r;return r instanceof Date?d=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(d=new Date(r.startDate).toISOString().split("T")[0]),l.pricesbydates.some(n=>n.flash_sale&&d>=n.date_start&&d<=n.date_end)}function lt(e,r,i,l){return x.useMemo(()=>Ue(e,r,i,l),[e,r,i,l])}function dt(e,r=600){const[i,l]=x.useState(!1),d=Array.isArray(e)?e.join(","):"";return x.useEffect(()=>{if(!e||!e.length){l(!0);return}let n=!1;const o=[...new Set(e.filter(Boolean))];let p=0,c=!1,h=!1;const m=()=>{!n&&c&&h&&l(!0)},a=()=>{p+=1,p>=o.length&&(c=!0,m())};o.forEach(g=>{const k=new Image;k.onload=a,k.onerror=a,k.src=g});const s=setTimeout(()=>{h=!0,m()},r),b=setTimeout(()=>{n||l(!0)},5e3);return()=>{n=!0,clearTimeout(s),clearTimeout(b)}},[d,r]),i}function qe(e,r){return e?Number(r==="long"?e.long_distance_price||0:e.price||0):0}function He({distance:e,blockedNotice:r,price:i}){if(r)return t.jsxs("div",{className:"mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700",children:[t.jsx(fe,{className:"mt-0.5 h-3.5 w-3.5 shrink-0"}),t.jsx("span",{children:r})]});if(e.status==="loading")return t.jsxs("div",{className:"mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-secondary-600",children:[t.jsx("span",{className:"h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-neutral-300 border-t-secondary-500"}),t.jsx("span",{children:"Calculating distance…"})]});if(e.status==="ready"&&e.tier!=="blocked"){const l=e.tier==="long";return t.jsxs("div",{className:D("mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs",l?"border-amber-200 bg-amber-50 text-amber-700":"border-green-200 bg-green-50 text-green-700"),children:[t.jsxs("span",{className:"flex items-center gap-2",children:[t.jsx($,{className:"h-3.5 w-3.5 shrink-0"}),t.jsxs("span",{children:[t.jsxs("b",{children:[e.km," km"]})," from our pier — ",l?"long-distance rate applies.":"standard rate."]})]}),i&&t.jsx("span",{className:"shrink-0 font-bold",children:i})]})}return e.status==="error"?t.jsx("div",{className:"mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700",children:t.jsx("span",{children:"Couldn't verify this address — please re-select it from the suggestions or the map."})}):t.jsxs("div",{className:"mt-3 flex items-start gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-secondary-500",children:[t.jsx(K,{className:"mt-0.5 h-3.5 w-3.5 shrink-0"}),t.jsx("span",{children:"Transfer price depends on your pickup distance from the pier: up to 28 km — standard rate, 28–45 km — long-distance rate. Addresses over 45 km can't be picked up — select an address above to see your exact price."})]})}function pt({open:e,onClose:r,transfers:i,totalGuests:l,selectedTransferId:d,pickupAddress:n,onConfirm:o}){const[p,c]=x.useState(d),[h,m]=x.useState(n),[a,s]=x.useState(null),[b,g]=x.useState({status:"idle",km:null,tier:null}),[k,f]=x.useState(null),[v,T]=x.useState(null);x.useEffect(()=>{e&&(c(d),m(n),s(null),g({status:"idle",km:null,tier:null}),f(null),T(null))},[e]);const E=i?.find(u=>String(u.id)===String(p)),M=String(p)==="1"||String(p)==="2",j=String(p)==="2";x.useEffect(()=>{if(!e)return;if(!M||!a){g({status:"idle",km:null,tier:null});return}let u=!1;return g({status:"loading",km:null,tier:null}),f(null),fetch(xe(`transfer/distance?lat=${a.lat}&lng=${a.lng}`)).then(N=>N.json()).then(N=>{if(!u){if(!N.success){g({status:"error",km:null,tier:null});return}g({status:"ready",km:N.distance_km,tier:N.tier}),N.tier==="blocked"&&f(`This address is ${N.distance_km} km away (exceeds our 45 km online transfer limit). Please select a closer address or choose "No, thanks" to proceed. For long-distance pickup, contact our booking manager right after booking for a tailored quote.`)}}).catch(()=>{u||g({status:"error",km:null,tier:null})}),()=>{u=!0}},[a,M,e]);const S=b.status==="ready"&&b.tier!=="blocked"?b.tier:null,P=!M||!!S,C=()=>{P&&(o({transferId:p,pickupAddress:h,dropoffAddress:j?h:"",pickupLocation:a,tier:S}),r())};return t.jsx(pe,{isOpen:e,onClose:r,title:"Transfer",maxWidth:"max-w-2xl",bodyClassName:"px-6 pb-6 pt-3",footer:t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"text-sm text-secondary-500",children:["Selected: ",t.jsx("b",{className:"text-secondary-900",children:p?E?.name||"—":"No, thanks"})]}),t.jsx(ee,{className:"h-12 w-full text-sm !font-black disabled:opacity-50 disabled:cursor-not-allowed",disabled:!P,onClick:C,children:"Confirm"})]}),children:t.jsxs("div",{className:"space-y-2.5",children:[t.jsxs("button",{type:"button",onClick:()=>c(null),className:D("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",p?"border-neutral-200 hover:border-neutral-300":"border-primary-500 bg-primary-50"),children:[t.jsx("div",{className:D("flex h-5 w-5 shrink-0 items-center justify-center rounded-full",p?"border-[1.5px] border-neutral-300 bg-white":"bg-primary-600"),children:!p&&t.jsx($,{className:"h-3 w-3 text-white"})}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("div",{className:"text-sm font-semibold text-secondary-900",children:"No, thanks. We'll meet you there."}),t.jsx("div",{className:"text-xs text-secondary-500 mt-0.5",children:"Self-arrival at the meeting point"})]}),t.jsx("span",{className:"text-sm font-semibold text-emerald-600 shrink-0",children:"Free"})]}),i?.map(u=>{const N=String(p)===String(u.id),I=String(u.id)==="1"||String(u.id)==="2",W=N&&I?S:null,A=qe(u,W),y=A>0?Math.ceil((l||1)/5):0,_=A*(y||1),L=me(u);return t.jsxs("div",{children:[t.jsxs("div",{role:"button",tabIndex:0,onClick:()=>c(u.id),onKeyDown:w=>{(w.key==="Enter"||w.key===" ")&&c(u.id)},className:D("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",N?"border-primary-500 bg-primary-50":"border-neutral-200 hover:border-neutral-300"),children:[t.jsx("div",{className:D("flex h-5 w-5 shrink-0 items-center justify-center rounded-full",N?"bg-primary-600":"border-[1.5px] border-neutral-300 bg-white"),children:N&&t.jsx($,{className:"h-3 w-3 text-white"})}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("div",{className:"text-sm font-semibold text-secondary-900",children:u.name}),L&&t.jsxs("button",{type:"button",onClick:w=>{w.stopPropagation(),T(R=>R===u.id?null:u.id)},className:"mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100",children:[t.jsx(K,{className:"h-3.5 w-3.5"}),v===u.id?"Hide description":"See full description",v===u.id?t.jsx(re,{className:"h-3.5 w-3.5"}):t.jsx(ae,{className:"h-3.5 w-3.5"})]}),v===u.id&&L&&t.jsx("div",{className:"mt-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-xs leading-relaxed text-secondary-600",children:L})]}),t.jsx("span",{className:D("shrink-0 text-sm font-semibold",A?"text-primary-700":"text-emerald-600"),children:A?I&&!W?`From ${U(_)}`:U(_):"Free"})]}),N&&I&&t.jsxs("div",{className:"mt-3 space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3.5",children:[t.jsxs("div",{children:[t.jsx("label",{className:"text-[10px] font-bold uppercase tracking-widest text-secondary-400",children:"Pickup address"}),t.jsx($e,{value:h,onChange:m,onLocationChange:s,defaultShowMap:!0,placeholder:"Enter your hotel or villa address",className:"mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"}),t.jsx(He,{distance:b,blockedNotice:k,price:U(_)})]}),j&&t.jsx("div",{className:"rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs text-secondary-500",children:"Drop-off is at the same address as pickup. If you need a different drop-off address, please contact our managers."})]})]},u.id)})]})})}function We(e,r){return e?e.per_boat?1:Math.max(1,Number(r)||1):1}function mt({open:e,onClose:r,covers:i,totalGuests:l,selectedCoverId:d,onConfirm:n}){const[o,p]=x.useState(d),[c,h]=x.useState(null);x.useEffect(()=>{e&&(p(d),h(null))},[e]);const m=i?.find(s=>String(s.id)===String(o)),a=()=>{n({coverId:o}),r()};return t.jsx(pe,{isOpen:e,onClose:r,title:"Trip Protection",maxWidth:"max-w-2xl",bodyClassName:"px-6 pb-6 pt-3",footer:t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"text-sm text-secondary-500",children:["Selected: ",t.jsx("b",{className:"text-secondary-900",children:o?m?.name||"—":"No coverage"})]}),t.jsx(ee,{className:"h-12 w-full text-sm !font-black",onClick:a,children:"Confirm"})]}),children:t.jsxs("div",{className:"space-y-2.5",children:[t.jsxs("button",{type:"button",onClick:()=>p(null),className:D("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",o?"border-neutral-200 hover:border-neutral-300":"border-primary-500 bg-primary-50"),children:[t.jsx("div",{className:D("flex h-5 w-5 shrink-0 items-center justify-center rounded-full",o?"border-[1.5px] border-neutral-300 bg-white":"bg-primary-600"),children:!o&&t.jsx($,{className:"h-3 w-3 text-white"})}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("div",{className:"text-sm font-semibold text-secondary-900",children:"No coverage"}),t.jsx("div",{className:"text-xs text-secondary-500 mt-0.5",children:"I have my own insurance"})]}),t.jsx("span",{className:"text-sm font-semibold text-emerald-600 shrink-0",children:"Free"})]}),i?.map(s=>{const b=String(o)===String(s.id),g=We(s,l),k=Number(s.price||0)*g,f=me(s);return t.jsx("div",{children:t.jsxs("div",{role:"button",tabIndex:0,onClick:()=>p(s.id),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&p(s.id)},className:D("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",b?"border-primary-500 bg-primary-50":"border-neutral-200 hover:border-neutral-300"),children:[t.jsx("div",{className:D("flex h-5 w-5 shrink-0 items-center justify-center rounded-full",b?"bg-primary-600":"border-[1.5px] border-neutral-300 bg-white"),children:b&&t.jsx($,{className:"h-3 w-3 text-white"})}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("div",{className:"text-sm font-semibold text-secondary-900",children:s.name}),f&&t.jsxs("button",{type:"button",onClick:v=>{v.stopPropagation(),h(T=>T===s.id?null:s.id)},className:"mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100",children:[t.jsx(K,{className:"h-3.5 w-3.5"}),c===s.id?"Hide description":"See full description",c===s.id?t.jsx(re,{className:"h-3.5 w-3.5"}):t.jsx(ae,{className:"h-3.5 w-3.5"})]}),c===s.id&&f&&t.jsx("div",{className:"mt-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-xs leading-relaxed text-secondary-600",children:f})]}),t.jsxs("div",{className:"shrink-0 text-right",children:[t.jsx("span",{className:"block text-sm font-semibold text-primary-700",children:U(k)}),t.jsx("span",{className:"block text-[10px] font-bold uppercase tracking-wider text-secondary-400",children:s.per_boat?"per boat":"per person"})]})]})},s.id)})]})})}function ut({mode:e="single",selected:r,onSelect:i,minDate:l=(()=>{const a=new Date;return a.setDate(a.getDate()+1),a.setHours(0,0,0,0),a})(),filterDate:d,onMonthChange:n,renderDayContents:o,className:p,inline:c=!1,fixedRangeDays:h=0,maxRangeDays:m=0}){const a=e==="range",[s,b]=x.useState(!1),[g,k]=x.useState(!1),[f,v]=x.useState(null);x.useEffect(()=>{const P=()=>{b(window.innerWidth<=768)};return P(),window.addEventListener("resize",P),()=>window.removeEventListener("resize",P)},[]);const T=P=>{if(a&&h>0){const[C]=P;if(C){const u=new Date(C);u.setDate(u.getDate()+h-1),i({from:C,to:u}),c||setTimeout(()=>k(!1),100)}}else if(a){const[C,u]=P;v(C&&!u?C:null);let N=u;if(u&&C&&m>0){const I=new Date(C.getTime()+(m-1)*24*60*60*1e3);u>I&&(N=I)}i({from:C,to:N}),N&&!c&&setTimeout(()=>k(!1),100)}else i(P),c||setTimeout(()=>k(!1),100)};let E=null,M=null;a?(r?.from&&(E=r.from instanceof Date?r.from:new Date(r.from)),r?.to&&(M=r.to instanceof Date?r.to:new Date(r.to))):r&&(E=r instanceof Date?r:new Date(r));const j=a&&m>0&&f&&!M?new Date(f.getTime()+(m-1)*24*60*60*1e3):void 0,S=s?1:a?2:1;return t.jsxs("div",{className:`premium-datepicker-wrapper${o?" has-custom-days":""}${c?" inline-mode":""}`,children:[t.jsx("style",{children:`
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

        /* :hover has higher specificity than --selected alone, so without this the
           just-tapped date (still "hovered" on touch devices) flashes light blue
           instead of staying the solid selected blue. */
        .premium-datepicker-wrapper .react-datepicker__day--selected:hover,
        .premium-datepicker-wrapper .react-datepicker__day--range-start:hover,
        .premium-datepicker-wrapper .react-datepicker__day--range-end:hover {
          background-color: var(--primary-600) !important;
          color: white !important;
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
      `}),!c&&t.jsx(be,{className:"date-icon h-5 w-5 text-secondary-300"}),t.jsx(ue,{selected:E,startDate:E,endDate:M,onChange:T,minDate:l,maxDate:j,filterDate:d,onMonthChange:n,renderDayContents:o,selectsRange:a,monthsShown:S,dateFormat:"MMM d, yyyy",placeholderText:a?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:P=>P.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:c,open:c?void 0:g,openToDate:E||new Date,onInputClick:c?void 0:()=>k(!0),onClickOutside:c?void 0:()=>k(!1),onCalendarClose:c?void 0:()=>k(!1),renderCustomHeader:({monthDate:P,decreaseMonth:C,increaseMonth:u,prevMonthButtonDisabled:N,nextMonthButtonDisabled:I})=>t.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[t.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:P.toLocaleString("en-US",{month:"long",year:"numeric"})}),t.jsxs("div",{className:"flex gap-2",children:[t.jsx("button",{type:"button",onClick:C,disabled:N,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:t.jsx(ge,{className:"h-4 w-4"})}),t.jsx("button",{type:"button",onClick:u,disabled:I,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:t.jsx(we,{className:"h-4 w-4"})})]})]})})]})}const Ge={Clock:de,MapPin:q,Ship:le,Waves:ce,UtensilsCrossed:oe,Anchor:ie,Camera:se,Fish:Ee,Sun:Le,Shield:Ce,BadgeCheck:Pe,Coffee:Te,Wine:De,Star:Se,Users:_e,Sparkles:ne,LifeBuoy:Ne,Globe:je,Ticket:ve,Car:ke,Compass:ye},Ke=e=>Ge[e]||null,Ye=(e="")=>e.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),H=(e,{stripTrailingOne:r=!1}={})=>{if(typeof e!="string")return"";const i=e.replace(/<[^>]*>/g," "),n=Ye(i).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?n.replace(/\s+1$/,"").trim():n},X=e=>!e||typeof e!="object"?"":H(e.name||e.title||e.restaurant_name||e.restaurantName||"",{stripTrailingOne:!0}),J=e=>!e||typeof e!="object"?"":H(e.description||e.short_description||e.shortDescription||e.details||e.menu||"",{stripTrailingOne:!0}),Ze=(e,r=null,i=null)=>{const l=H(e?.details,{stripTrailingOne:!0}),d=r&&typeof r=="object"?r:null,n=i&&typeof i=="object"?i:null,o=l&&(l.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||l.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",p=X(d)||X(n)||o,c=J(d)||J(n),h=l&&l!==String(e?.title||"").trim()&&l!==p?l:"",m=c||h,a=p||m?{...d||{},...n||{},name:p,description:m}:null;return{title:p?`Lunch at ${p}`:e?.title||"Lunch",description:m,popupRestaurant:a}},Ve=(e="")=>typeof e!="string"||!e?e:e.charAt(0).toUpperCase()+e.slice(1),Xe=(e="")=>{const r=String(e).toLowerCase();return r.includes("meet")||r.includes("pick")?q:r.includes("depart")||r.includes("boat")?le:r.includes("snorkeling")||r.includes("swim")||r.includes("manta")?ce:r.includes("lunch")||r.includes("food")?oe:r.includes("return")||r.includes("back")?ie:r.includes("photo")?se:de};function xt({item:e,onRestaurantClick:r,restaurant:i}){const l=e.icon_name&&Ke(e.icon_name)||Xe(e.title),d=H(e.details,{stripTrailingOne:!0}),n=/lunch/i.test(e.title),o=n?Ze(e):null,p=Ve(o?.title||e.title),c=n?o?.description:d,h=e.highlight==="premium"||e.highlight==="first-class"?e.highlight:e.is_premium==1||e.is_premium===!0?"premium":null,m=h==="premium",a=h==="first-class",s=e.time?e.time.replace(/\./g,":"):"";return t.jsxs("div",{className:`flex items-center gap-3 py-2.5 sm:py-3 min-h-[56px] ${m?"rounded-xl bg-indigo-50/60 px-2 -mx-2":a?"rounded-xl bg-emerald-50/60 px-2 -mx-2":""}`,children:[t.jsx("div",{className:`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${m?"bg-indigo-100 text-indigo-600":a?"bg-emerald-100 text-emerald-600":"bg-neutral-100 text-primary-600"}`,children:e.icon_svg?t.jsx("span",{className:"h-3.5 w-3.5 sm:h-4 sm:w-4 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current",dangerouslySetInnerHTML:{__html:e.icon_svg}}):t.jsx(l,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4",strokeWidth:1.5})}),t.jsxs("div",{className:"min-w-0 flex-1",children:[t.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[t.jsx("span",{className:"text-base font-semibold text-secondary-900",children:p}),h&&t.jsxs("span",{className:`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none border ${m?"bg-indigo-500/15 text-indigo-600 border-indigo-300/50":"bg-emerald-500/15 text-emerald-600 border-emerald-300/50"}`,children:[t.jsx(ne,{className:"h-2 w-2"}),m?"Premium":"First Class"]})]}),c&&t.jsx("div",{className:"text-xs leading-normal text-secondary-500",children:c}),n&&i&&r&&t.jsx("button",{type:"button",onClick:()=>r(i),className:"mt-0.5 text-xs font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-2",children:"View menu"})]}),s&&t.jsx("div",{className:"shrink-0 text-right",children:t.jsx("div",{className:`text-sm font-bold tabular-nums ${m?"text-indigo-600":a?"text-emerald-600":"text-secondary-700"}`,children:s})})]})}export{ut as C,pe as M,xt as S,pt as T,We as a,at as b,D as c,it as d,dt as e,V as f,nt as g,Ue as h,ot as i,U as j,mt as k,ct as l,st as m,Xe as n,Ze as o,Ve as p,H as q,qe as r,Oe as s,Ke as t,lt as u};
