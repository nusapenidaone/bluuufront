import{r as g,j as a,a as Y,D as Q}from"./vendor-datepicker-DXD6OlhH.js";import{ae as X,d as R,C as ee,y as te,z as re,Z as ae,m as ie,r as ne,G as oe,L as se,e as G,U as ce,q as pe,W as de,s as le,B as me,w as ue,t as he,F as fe,k as q,u as W,x as K,v as Z,S as V,f as J}from"./vendor-icons-C_HDnGtV.js";let z=null;function ge(e){window.google?.maps?.importLibrary||(t=>{let p,n,s;const i="The Google Maps JavaScript API",o="google",h="importLibrary",c="__ib__",d=document,l=window;l[o]=l[o]||{};const r=l[o].maps||(l[o].maps={}),u=new Set,k=new URLSearchParams,v=()=>p||(p=new Promise(async(f,S)=>{n=d.createElement("script"),k.set("libraries",[...u]+"");for(s in t)k.set(s.replace(/[A-Z]/g,D=>"_"+D[0].toLowerCase()),t[s]);k.set("callback",o+".maps."+c),n.src=`https://maps.${o}apis.com/maps/api/js?`+k,r[c]=f,n.onerror=()=>p=S(Error(i+" could not load.")),n.nonce=d.querySelector("script[nonce]")?.nonce||"",d.head.append(n)}));r[h]?console.warn(i+" only loads once. Ignoring:",t):r[h]=(f,...S)=>u.add(f)&&v().then(()=>r[h](f,...S))})({key:e,v:"weekly"})}function F(){return z||(ge("AIzaSyC_RrKc9v7DS51etBhBRzRopKknc9jHhbs"),z=Promise.all([window.google.maps.importLibrary("maps"),window.google.maps.importLibrary("places"),window.google.maps.importLibrary("geocoding")]).then(()=>window.google),z)}const M={south:-9,west:114.4,north:-7.9,east:116},xe={lat:-8.719,lng:115.169};function De({value:e,onChange:t,placeholder:p,className:n,confirmed:s=!1,onConfirmedChange:i}){const o=g.useRef(null),h=g.useRef(null),c=g.useRef(null),d=g.useRef(null),l=g.useRef(null),[r,u]=g.useState([]),[k,v]=g.useState(!1),[f,S]=g.useState(null),[D,E]=g.useState(!1),[j,C]=g.useState(null);g.useEffect(()=>{o.current&&document.activeElement!==o.current&&(o.current.value=e??"")},[e]);const B=g.useCallback(async m=>{if(!m||m.length<2){u([]);return}try{const x=await F(),y=new x.maps.LatLngBounds(new x.maps.LatLng(M.south,M.west),new x.maps.LatLng(M.north,M.east)),{suggestions:w}=await x.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({input:m,locationBias:y});u(w??[]),o.current&&C(o.current.getBoundingClientRect()),v(!0)}catch{u([])}},[]),A=m=>{const x=m.target.value;t(x),i?.(!1),clearTimeout(l.current),l.current=setTimeout(()=>B(x),250)},_=async m=>{const x=m.placePrediction.mainText?.text??"",y=m.placePrediction.secondaryText?.text??"",w=y?`${x}, ${y}`:x;t(w),i?.(!0),o.current&&(o.current.value=w),u([]),v(!1);try{const T=m.placePrediction.toPlace();await T.fetchFields({fields:["location"]});const P=T.location;P&&S({lat:P.lat(),lng:P.lng()})}catch{}},b=g.useCallback(async m=>{const x=await F(),y=new x.maps.Geocoder,{results:w}=await y.geocode({location:m});if(w?.[0]){const T=w[0].formatted_address;t(T),i?.(!0),o.current&&(o.current.value=T)}},[t,i]);g.useEffect(()=>{if(!D||!h.current)return;const m=f??xe;F().then(x=>{c.current?(c.current.setCenter(m),f&&d.current&&d.current.setPosition(m)):(c.current=new x.maps.Map(h.current,{zoom:f?15:11,center:m,disableDefaultUI:!0,zoomControl:!0,gestureHandling:"cooperative",clickableIcons:!1}),c.current.addListener("click",y=>{const w={lat:y.latLng.lat(),lng:y.latLng.lng()};S(w),d.current?d.current.setPosition(w):(d.current=new x.maps.Marker({position:w,map:c.current,draggable:!0}),d.current.addListener("dragend",T=>{const P={lat:T.latLng.lat(),lng:T.latLng.lng()};S(P),b(P)})),b(w)}),f&&(d.current=new x.maps.Marker({position:m,map:c.current,draggable:!0}),d.current.addListener("dragend",y=>{const w={lat:y.latLng.lat(),lng:y.latLng.lng()};S(w),b(w)})))})},[D,f,b]);const L=typeof i=="function"&&!!(e&&e.trim())&&!s;return a.jsxs("div",{className:"relative",children:[a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("input",{ref:o,type:"text",defaultValue:e,onChange:A,onBlur:()=>{clearTimeout(l.current),setTimeout(()=>v(!1),150)},placeholder:p,className:n,autoComplete:"off"}),a.jsx("button",{type:"button",onClick:()=>E(m=>!m),title:D?"Hide map":"Show on map",className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-secondary-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",children:a.jsx(X,{className:"h-4 w-4"})})]}),L&&a.jsxs("div",{className:"mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800",children:[a.jsx("span",{className:"flex-1 min-w-[140px]",children:"Pick a suggestion above, or confirm this address is correct."}),a.jsx("button",{type:"button",onClick:()=>i(!0),className:"shrink-0 rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-amber-700",children:"Use as entered"})]}),k&&r.length>0&&j&&Y.createPortal(a.jsx("ul",{style:{position:"fixed",top:j.bottom+4,left:j.left,width:j.width,zIndex:10050},className:"overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg",children:r.map((m,x)=>{const y=m.placePrediction.mainText?.text??"",w=m.placePrediction.secondaryText?.text??"";return a.jsxs("li",{onMouseDown:()=>_(m),className:"flex cursor-pointer items-start gap-2 px-3 py-2.5 hover:bg-neutral-50",children:[a.jsx(R,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary-600"}),a.jsxs("div",{className:"min-w-0",children:[a.jsx("div",{className:"truncate font-medium text-secondary-900",children:y}),w&&a.jsx("div",{className:"truncate text-xs text-secondary-400",children:w})]})]},x)})}),document.body),D&&a.jsxs("div",{className:"mt-2 overflow-hidden rounded-lg border border-neutral-200",children:[a.jsx("div",{ref:h,className:"h-52 w-full"}),a.jsxs("div",{className:"flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 text-xs text-secondary-400",children:[a.jsx(R,{className:"h-3 w-3 shrink-0"}),"Нажмите на карту чтобы поставить точку, или перетащите маркер"]})]})]})}function Te(...e){return e.filter(Boolean).join(" ")}let $=(e,t)=>`${Number(e).toLocaleString()} IDR`;const Le=e=>{$=e};function Pe(e){return $(e,{fromCurrency:"IDR"})}function Ce(e){return $(e,{fromCurrency:"USD"})}function O(e){if(!e)return"";const t=new Date(e+"T00:00:00");return Number.isNaN(t.getTime())?e:t.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function ze(e,t){return!e||!t?"":`${O(e)} - ${O(t)}`}function we(e,t,p,n){if(!e||!n?.length)return null;const s=n.find(r=>Number(r.id)===Number(e));if(!s)return null;let i=t;t instanceof Date?i=t.toISOString().split("T")[0]:t&&typeof t=="object"&&t.startDate&&(i=new Date(t.startDate).toISOString().split("T")[0]);let o=s.packages?.pricelist||s.package?.pricelist||s.pricelist||[],h=Number(s.boat_price)||0;if(i&&s.pricesbydates?.length){const r=s.pricesbydates.find(u=>{const k=u.date_start,v=u.date_end;return i>=k&&i<=v});if(r){const u=r.packages||r.package;u?.pricelist&&(o=u.pricelist),r.boat_price!==void 0&&r.boat_price!==null&&(h=Number(r.boat_price))}}if(!o.length)return null;const c=String(p);let d=o.find(r=>String(r.members_count)===c);if(!d){const r=[...o].sort((u,k)=>Number(u.members_count)-Number(k.members_count));d=r.reverse().find(u=>Number(u.members_count)<=p)||r[0]}const l=Number(s.classes_id)===9||Number(s.classes_id)===10;return d?Number(d.price)+(l?0:h):null}function Me(e,t,p){if(!e||!t||!p?.length)return!1;const n=p.find(i=>Number(i.id)===Number(e));if(!n?.pricesbydates?.length)return!1;let s=t;return t instanceof Date?s=t.toISOString().split("T")[0]:t&&typeof t=="object"&&t.startDate&&(s=new Date(t.startDate).toISOString().split("T")[0]),n.pricesbydates.some(i=>i.flash_sale&&s>=i.date_start&&s<=i.date_end)}function Re(e,t,p,n){return g.useMemo(()=>we(e,t,p,n),[e,t,p,n])}function Ie(e,t=600){const[p,n]=g.useState(!1),s=Array.isArray(e)?e.join(","):"";return g.useEffect(()=>{if(!e||!e.length){n(!0);return}let i=!1;const o=[...new Set(e.filter(Boolean))];let h=0,c=!1,d=!1;const l=()=>{!i&&c&&d&&n(!0)},r=()=>{h+=1,h>=o.length&&(c=!0,l())};o.forEach(v=>{const f=new Image;f.onload=r,f.onerror=r,f.src=v});const u=setTimeout(()=>{d=!0,l()},t),k=setTimeout(()=>{i||n(!0)},5e3);return()=>{i=!0,clearTimeout(u),clearTimeout(k)}},[s,t]),p}function Ee({mode:e="single",selected:t,onSelect:p,minDate:n=(()=>{const r=new Date;return r.setDate(r.getDate()+1),r.setHours(0,0,0,0),r})(),filterDate:s,onMonthChange:i,renderDayContents:o,className:h,inline:c=!1,fixedRangeDays:d=0,maxRangeDays:l=0}){const r=e==="range",[u,k]=g.useState(!1),[v,f]=g.useState(!1),[S,D]=g.useState(null);g.useEffect(()=>{const _=()=>{k(window.innerWidth<=768)};return _(),window.addEventListener("resize",_),()=>window.removeEventListener("resize",_)},[]);const E=_=>{if(r&&d>0){const[b]=_;if(b){const N=new Date(b);N.setDate(N.getDate()+d-1),p({from:b,to:N}),c||setTimeout(()=>f(!1),100)}}else if(r){const[b,N]=_;D(b&&!N?b:null);let L=N;if(N&&b&&l>0){const m=new Date(b.getTime()+(l-1)*24*60*60*1e3);N>m&&(L=m)}p({from:b,to:L}),L&&!c&&setTimeout(()=>f(!1),100)}else p(_),c||setTimeout(()=>f(!1),100)};let j=null,C=null;r?(t?.from&&(j=t.from instanceof Date?t.from:new Date(t.from)),t?.to&&(C=t.to instanceof Date?t.to:new Date(t.to))):t&&(j=t instanceof Date?t:new Date(t));const B=r&&l>0&&S&&!C?new Date(S.getTime()+(l-1)*24*60*60*1e3):void 0,A=u?1:r?2:1;return a.jsxs("div",{className:`premium-datepicker-wrapper${o?" has-custom-days":""}${c?" inline-mode":""}`,children:[a.jsx("style",{children:`
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
      `}),!c&&a.jsx(ee,{className:"date-icon h-5 w-5 text-secondary-300"}),a.jsx(Q,{selected:j,startDate:j,endDate:C,onChange:E,minDate:n,maxDate:B,filterDate:s,onMonthChange:i,renderDayContents:o,selectsRange:r,monthsShown:A,dateFormat:"MMM d, yyyy",placeholderText:r?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:_=>_.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:c,open:c?void 0:v,openToDate:j||new Date,onInputClick:c?void 0:()=>f(!0),onClickOutside:c?void 0:()=>f(!1),onCalendarClose:c?void 0:()=>f(!1),renderCustomHeader:({monthDate:_,decreaseMonth:b,increaseMonth:N,prevMonthButtonDisabled:L,nextMonthButtonDisabled:m})=>a.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[a.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:_.toLocaleString("en-US",{month:"long",year:"numeric"})}),a.jsxs("div",{className:"flex gap-2",children:[a.jsx("button",{type:"button",onClick:b,disabled:L,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:a.jsx(te,{className:"h-4 w-4"})}),a.jsx("button",{type:"button",onClick:N,disabled:m,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:a.jsx(re,{className:"h-4 w-4"})})]})]})})]})}const be={Clock:J,MapPin:R,Ship:V,Waves:Z,UtensilsCrossed:K,Anchor:W,Camera:q,Fish:fe,Sun:he,Shield:ue,BadgeCheck:me,Coffee:le,Wine:de,Star:pe,Users:ce,Sparkles:G,LifeBuoy:se,Globe:oe,Ticket:ne,Car:ie,Compass:ae},ke=e=>be[e]||null,ye=(e="")=>e.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),I=(e,{stripTrailingOne:t=!1}={})=>{if(typeof e!="string")return"";const p=e.replace(/<[^>]*>/g," "),i=ye(p).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return t?i.replace(/\s+1$/,"").trim():i},U=e=>!e||typeof e!="object"?"":I(e.name||e.title||e.restaurant_name||e.restaurantName||"",{stripTrailingOne:!0}),H=e=>!e||typeof e!="object"?"":I(e.description||e.short_description||e.shortDescription||e.details||e.menu||"",{stripTrailingOne:!0}),_e=(e,t=null,p=null)=>{const n=I(e?.details,{stripTrailingOne:!0}),s=t&&typeof t=="object"?t:null,i=p&&typeof p=="object"?p:null,o=n&&(n.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||n.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",h=U(s)||U(i)||o,c=H(s)||H(i),d=n&&n!==String(e?.title||"").trim()&&n!==h?n:"",l=c||d,r=h||l?{...s||{},...i||{},name:h,description:l}:null;return{title:h?`Lunch at ${h}`:e?.title||"Lunch",description:l,popupRestaurant:r}},ve=(e="")=>typeof e!="string"||!e?e:e.charAt(0).toUpperCase()+e.slice(1),Se=(e="")=>{const t=String(e).toLowerCase();return t.includes("meet")||t.includes("pick")?R:t.includes("depart")||t.includes("boat")?V:t.includes("snorkeling")||t.includes("swim")||t.includes("manta")?Z:t.includes("lunch")||t.includes("food")?K:t.includes("return")||t.includes("back")?W:t.includes("photo")?q:J};function Be({item:e,onRestaurantClick:t,restaurant:p}){const n=e.icon_name&&ke(e.icon_name)||Se(e.title),s=I(e.details,{stripTrailingOne:!0}),i=/lunch/i.test(e.title),o=i?_e(e):null,h=ve(o?.title||e.title),c=i?o?.description:s,d=e.highlight==="premium"||e.highlight==="first-class"?e.highlight:e.is_premium==1||e.is_premium===!0?"premium":null,l=d==="premium",r=d==="first-class",u=e.time?e.time.replace(/\./g,":"):"";return a.jsxs("div",{className:`flex items-center gap-3 py-2.5 sm:py-3 min-h-[56px] ${l?"rounded-xl bg-indigo-50/60 px-2 -mx-2":r?"rounded-xl bg-emerald-50/60 px-2 -mx-2":""}`,children:[a.jsx("div",{className:`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${l?"bg-indigo-100 text-indigo-600":r?"bg-emerald-100 text-emerald-600":"bg-neutral-100 text-primary-600"}`,children:e.icon_svg?a.jsx("span",{className:"h-3.5 w-3.5 sm:h-4 sm:w-4 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current",dangerouslySetInnerHTML:{__html:e.icon_svg}}):a.jsx(n,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4",strokeWidth:1.5})}),a.jsxs("div",{className:"min-w-0 flex-1",children:[a.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[a.jsx("span",{className:"text-base font-semibold text-secondary-900",children:h}),d&&a.jsxs("span",{className:`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none border ${l?"bg-indigo-500/15 text-indigo-600 border-indigo-300/50":"bg-emerald-500/15 text-emerald-600 border-emerald-300/50"}`,children:[a.jsx(G,{className:"h-2 w-2"}),l?"Premium":"First Class"]})]}),c&&a.jsx("div",{className:"text-xs leading-normal text-secondary-500",children:c}),i&&p&&t&&a.jsx("button",{type:"button",onClick:()=>t(p),className:"mt-0.5 text-xs font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-2",children:"View menu"})]}),u&&a.jsx("div",{className:"shrink-0 text-right",children:a.jsx("div",{className:`text-sm font-bold tabular-nums ${l?"text-indigo-600":r?"text-emerald-600":"text-secondary-700"}`,children:u})})]})}export{De as A,Ee as C,Be as S,Ce as a,Ie as b,Te as c,we as d,ze as e,O as f,Pe as g,Me as h,_e as i,ve as j,I as k,ke as l,Se as r,Le as s,Re as u};
