import{r as k,j as o,D as H}from"./vendor-datepicker-DXD6OlhH.js";import{C as W,y as q,z as G,Z,m as K,r as V,G as Y,L as J,e as M,U as Q,q as X,W as ee,s as re,B as te,w as ie,t as ae,F as ne,k as P,u as L,x as I,v as F,S as $,d as O,f as E}from"./vendor-icons-CyPVaEEU.js";function fe(...e){return e.filter(Boolean).join(" ")}let B=(e,r)=>`IDR ${Number(e).toLocaleString()}`;const ge=e=>{B=e};function xe(e){return B(e,{fromCurrency:"IDR"})}function T(e){if(!e)return"";const r=new Date(e+"T00:00:00");return Number.isNaN(r.getTime())?e:r.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function we(e,r){return!e||!r?"":`${T(e)} - ${T(r)}`}function oe(e,r,s,a){if(!e||!a?.length)return null;const n=a.find(t=>Number(t.id)===Number(e));if(!n)return null;let i=r;r instanceof Date?i=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(i=new Date(r.startDate).toISOString().split("T")[0]);let l=n.packages?.pricelist||n.package?.pricelist||n.pricelist||[],u=Number(n.boat_price)||0;if(i&&n.pricesbydates?.length){const t=n.pricesbydates.find(m=>{const w=m.date_start,b=m.date_end;return i>=w&&i<=b});if(t){const m=t.packages||t.package;m?.pricelist&&(l=m.pricelist),t.boat_price!==void 0&&t.boat_price!==null&&(u=Number(t.boat_price))}}if(!l.length)return null;const p=String(s);let d=l.find(t=>String(t.members_count)===p);if(!d){const t=[...l].sort((m,w)=>Number(m.members_count)-Number(w.members_count));d=t.reverse().find(m=>Number(m.members_count)<=s)||t[0]}const c=Number(n.classes_id)===9||Number(n.classes_id)===10;return d?Number(d.price)+(c?0:u):null}function ke(e,r,s){if(!e||!r||!s?.length)return!1;const a=s.find(i=>Number(i.id)===Number(e));if(!a?.pricesbydates?.length)return!1;let n=r;return r instanceof Date?n=r.toISOString().split("T")[0]:r&&typeof r=="object"&&r.startDate&&(n=new Date(r.startDate).toISOString().split("T")[0]),a.pricesbydates.some(i=>i.flash_sale&&n>=i.date_start&&n<=i.date_end)}function be(e,r,s,a){return k.useMemo(()=>oe(e,r,s,a),[e,r,s,a])}function ye(e,r=600){const[s,a]=k.useState(!1),n=Array.isArray(e)?e.join(","):"";return k.useEffect(()=>{if(!e||!e.length){a(!0);return}let i=!1;const l=[...new Set(e.filter(Boolean))];let u=0,p=!1,d=!1;const c=()=>{!i&&p&&d&&a(!0)},t=()=>{u+=1,u>=l.length&&(p=!0,c())};l.forEach(b=>{const g=new Image;g.onload=t,g.onerror=t,g.src=b});const m=setTimeout(()=>{d=!0,c()},r),w=setTimeout(()=>{i||a(!0)},5e3);return()=>{i=!0,clearTimeout(m),clearTimeout(w)}},[n,r]),s}function _e({mode:e="single",selected:r,onSelect:s,minDate:a=(()=>{const t=new Date;return t.setDate(t.getDate()+1),t.setHours(0,0,0,0),t})(),filterDate:n,onMonthChange:i,renderDayContents:l,className:u,inline:p=!1,fixedRangeDays:d=0,maxRangeDays:c=0}){const t=e==="range",[m,w]=k.useState(!1),[b,g]=k.useState(!1),[S,j]=k.useState(null);k.useEffect(()=>{const h=()=>{w(window.innerWidth<=768)};return h(),window.addEventListener("resize",h),()=>window.removeEventListener("resize",h)},[]);const A=h=>{if(t&&d>0){const[f]=h;if(f){const x=new Date(f);x.setDate(x.getDate()+d-1),s({from:f,to:x}),p||setTimeout(()=>g(!1),100)}}else if(t){const[f,x]=h;j(f&&!x?f:null);let _=x;if(x&&f&&c>0){const v=new Date(f.getTime()+(c-1)*24*60*60*1e3);x>v&&(_=v)}s({from:f,to:_}),_&&!p&&setTimeout(()=>g(!1),100)}else s(h),p||setTimeout(()=>g(!1),100)};let y=null,N=null;t?(r?.from&&(y=r.from instanceof Date?r.from:new Date(r.from)),r?.to&&(N=r.to instanceof Date?r.to:new Date(r.to))):r&&(y=r instanceof Date?r:new Date(r));const R=t&&c>0&&S&&!N?new Date(S.getTime()+(c-1)*24*60*60*1e3):void 0,U=m?1:t?2:1;return o.jsxs("div",{className:`premium-datepicker-wrapper${l?" has-custom-days":""}${p?" inline-mode":""}`,children:[o.jsx("style",{children:`
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
      `}),!p&&o.jsx(W,{className:"date-icon h-5 w-5 text-secondary-300"}),o.jsx(H,{selected:y,startDate:y,endDate:N,onChange:A,minDate:a,maxDate:R,filterDate:n,onMonthChange:i,renderDayContents:l,selectsRange:t,monthsShown:U,dateFormat:"MMM d, yyyy",placeholderText:t?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:h=>h.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:p,open:p?void 0:b,openToDate:y||new Date,onInputClick:p?void 0:()=>g(!0),onClickOutside:p?void 0:()=>g(!1),onCalendarClose:p?void 0:()=>g(!1),renderCustomHeader:({monthDate:h,decreaseMonth:f,increaseMonth:x,prevMonthButtonDisabled:_,nextMonthButtonDisabled:v})=>o.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[o.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:h.toLocaleString("en-US",{month:"long",year:"numeric"})}),o.jsxs("div",{className:"flex gap-2",children:[o.jsx("button",{type:"button",onClick:f,disabled:_,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:o.jsx(q,{className:"h-4 w-4"})}),o.jsx("button",{type:"button",onClick:x,disabled:v,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:o.jsx(G,{className:"h-4 w-4"})})]})]})})]})}const se={Clock:E,MapPin:O,Ship:$,Waves:F,UtensilsCrossed:I,Anchor:L,Camera:P,Fish:ne,Sun:ae,Shield:ie,BadgeCheck:te,Coffee:re,Wine:ee,Star:X,Users:Q,Sparkles:M,LifeBuoy:J,Globe:Y,Ticket:V,Car:K,Compass:Z},pe=e=>se[e]||null,ce=(e="")=>e.replace(/<br\s*\/?>/gi," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;|&#38;/gi,"&").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&ndash;|&#8211;/gi,"-").replace(/&mdash;|&#8212;/gi,"-").replace(/&bull;|&#8226;/gi," - "),D=(e,{stripTrailingOne:r=!1}={})=>{if(typeof e!="string")return"";const s=e.replace(/<[^>]*>/g," "),i=ce(s).replace(/\s+/g," ").trim().replace(/([.!?])([A-Z\u00C0-\u024F])/g,"$1 $2");return r?i.replace(/\s+1$/,"").trim():i},C=e=>!e||typeof e!="object"?"":D(e.name||e.title||e.restaurant_name||e.restaurantName||"",{stripTrailingOne:!0}),z=e=>!e||typeof e!="object"?"":D(e.description||e.short_description||e.shortDescription||e.details||e.menu||"",{stripTrailingOne:!0}),de=(e,r=null,s=null)=>{const a=D(e?.details,{stripTrailingOne:!0}),n=r&&typeof r=="object"?r:null,i=s&&typeof s=="object"?s:null,l=a&&(a.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()||a.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim())||"",u=C(n)||C(i)||l,p=z(n)||z(i),d=a&&a!==String(e?.title||"").trim()&&a!==u?a:"",c=p||d,t=u||c?{...n||{},...i||{},name:u,description:c}:null;return{title:u?`Lunch at ${u}`:e?.title||"Lunch",description:c,popupRestaurant:t}},me=(e="")=>typeof e!="string"||!e?e:e.charAt(0).toUpperCase()+e.slice(1),le=(e="")=>{const r=String(e).toLowerCase();return r.includes("meet")||r.includes("pick")?O:r.includes("depart")||r.includes("boat")?$:r.includes("snorkeling")||r.includes("swim")||r.includes("manta")?F:r.includes("lunch")||r.includes("food")?I:r.includes("return")||r.includes("back")?L:r.includes("photo")?P:E};function ve({item:e,onRestaurantClick:r,restaurant:s}){const a=e.icon_name&&pe(e.icon_name)||le(e.title),n=D(e.details,{stripTrailingOne:!0}),i=/lunch/i.test(e.title),l=i?de(e):null,u=me(l?.title||e.title),p=i?l?.description:n,d=e.highlight==="premium"||e.highlight==="first-class"?e.highlight:e.is_premium==1||e.is_premium===!0?"premium":null,c=d==="premium",t=d==="first-class",m=e.time?e.time.replace(/\./g,":"):"";return o.jsxs("div",{className:`flex items-center gap-3 py-2.5 sm:py-3 min-h-[56px] ${c?"rounded-xl bg-indigo-50/60 px-2 -mx-2":t?"rounded-xl bg-emerald-50/60 px-2 -mx-2":""}`,children:[o.jsx("div",{className:`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${c?"bg-indigo-100 text-indigo-600":t?"bg-emerald-100 text-emerald-600":"bg-neutral-100 text-primary-600"}`,children:e.icon_svg?o.jsx("span",{className:"h-3.5 w-3.5 sm:h-4 sm:w-4 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current",dangerouslySetInnerHTML:{__html:e.icon_svg}}):o.jsx(a,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4",strokeWidth:1.5})}),o.jsxs("div",{className:"min-w-0 flex-1",children:[o.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[o.jsx("span",{className:"text-base font-semibold text-secondary-900",children:u}),d&&o.jsxs("span",{className:`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none border ${c?"bg-indigo-500/15 text-indigo-600 border-indigo-300/50":"bg-emerald-500/15 text-emerald-600 border-emerald-300/50"}`,children:[o.jsx(M,{className:"h-2 w-2"}),c?"Premium":"First Class"]})]}),p&&o.jsx("div",{className:"text-xs leading-normal text-secondary-500",children:p}),i&&s&&r&&o.jsx("button",{type:"button",onClick:()=>r(s),className:"mt-0.5 text-xs font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-2",children:"View menu"})]}),m&&o.jsx("div",{className:"shrink-0 text-right",children:o.jsx("div",{className:`text-sm font-bold tabular-nums ${c?"text-indigo-600":t?"text-emerald-600":"text-secondary-700"}`,children:m})})]})}export{_e as C,ve as S,ye as a,oe as b,fe as c,we as d,xe as e,T as f,ke as g,de as h,me as i,D as j,pe as k,le as r,ge as s,be as u};
