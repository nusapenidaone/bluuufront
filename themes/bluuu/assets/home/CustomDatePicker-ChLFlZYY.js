import{r as b,j as m,D as P}from"./vendor-datepicker-DXD6OlhH.js";import{C as I,y as E,z as L}from"./vendor-icons-iWPEEIRt.js";function $(...r){return r.filter(Boolean).join(" ")}let T=(r,e)=>`IDR ${Number(r).toLocaleString()}`;const A=r=>{T=r};function B(r){return T(r,{fromCurrency:"IDR"})}function j(r){if(!r)return"";const e=new Date(r+"T00:00:00");return Number.isNaN(e.getTime())?r:e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function H(r,e){return!r||!e?"":`${j(r)} - ${j(e)}`}function O(r,e,p,o){if(!r||!o?.length)return null;const a=o.find(t=>Number(t.id)===Number(r));if(!a)return null;let i=e;e instanceof Date?i=e.toISOString().split("T")[0]:e&&typeof e=="object"&&e.startDate&&(i=new Date(e.startDate).toISOString().split("T")[0]);let u=a.packages?.pricelist||a.package?.pricelist||a.pricelist||[],g=Number(a.boat_price)||0;if(i&&a.pricesbydates?.length){const t=a.pricesbydates.find(c=>{const w=c.date_start,x=c.date_end;return i>=w&&i<=x});if(t){const c=t.packages||t.package;c?.pricelist&&(u=c.pricelist),t.boat_price!==void 0&&t.boat_price!==null&&(g=Number(t.boat_price))}}if(!u.length)return null;const n=String(p);let l=u.find(t=>String(t.members_count)===n);if(!l){const t=[...u].sort((c,w)=>Number(c.members_count)-Number(w.members_count));l=t.reverse().find(c=>Number(c.members_count)<=p)||t[0]}const k=Number(a.classes_id)===9||Number(a.classes_id)===10;return l?Number(l.price)+(k?0:g):null}function U(r,e,p){if(!r||!e||!p?.length)return!1;const o=p.find(i=>Number(i.id)===Number(r));if(!o?.pricesbydates?.length)return!1;let a=e;return e instanceof Date?a=e.toISOString().split("T")[0]:e&&typeof e=="object"&&e.startDate&&(a=new Date(e.startDate).toISOString().split("T")[0]),o.pricesbydates.some(i=>i.flash_sale&&a>=i.date_start&&a<=i.date_end)}function q(r,e,p,o){return b.useMemo(()=>O(r,e,p,o),[r,e,p,o])}function G(r,e=600){const[p,o]=b.useState(!1),a=Array.isArray(r)?r.join(","):"";return b.useEffect(()=>{if(!r||!r.length){o(!0);return}let i=!1;const u=[...new Set(r.filter(Boolean))];let g=0,n=!1,l=!1;const k=()=>{!i&&n&&l&&o(!0)},t=()=>{g+=1,g>=u.length&&(n=!0,k())};u.forEach(x=>{const f=new Image;f.onload=t,f.onerror=t,f.src=x});const c=setTimeout(()=>{l=!0,k()},e),w=setTimeout(()=>{i||o(!0)},5e3);return()=>{i=!0,clearTimeout(c),clearTimeout(w)}},[a,e]),p}function K({mode:r="single",selected:e,onSelect:p,minDate:o=(()=>{const t=new Date;return t.setHours(0,0,0,0),t})(),filterDate:a,onMonthChange:i,renderDayContents:u,className:g,inline:n=!1,fixedRangeDays:l=0,maxRangeDays:k=0}){const t=r==="range",[c,w]=b.useState(!1),[x,f]=b.useState(!1),[S,N]=b.useState(null);b.useEffect(()=>{const d=()=>{w(window.innerWidth<=768)};return d(),window.addEventListener("resize",d),()=>window.removeEventListener("resize",d)},[]);const z=d=>{if(t&&l>0){const[s]=d;if(s){const h=new Date(s);h.setDate(h.getDate()+l-1),p({from:s,to:h}),n||setTimeout(()=>f(!1),100)}}else if(t){const[s,h]=d;N(s&&!h?s:null);let y=h;if(h&&s&&k>0){const v=new Date(s.getTime()+(k-1)*24*60*60*1e3);h>v&&(y=v)}p({from:s,to:y}),y&&!n&&setTimeout(()=>f(!1),100)}else p(d),n||setTimeout(()=>f(!1),100)};let _=null,D=null;t?(e?.from&&(_=e.from instanceof Date?e.from:new Date(e.from)),e?.to&&(D=e.to instanceof Date?e.to:new Date(e.to))):e&&(_=e instanceof Date?e:new Date(e));const C=t&&k>0&&S&&!D?new Date(S.getTime()+(k-1)*24*60*60*1e3):void 0,M=c?1:t?2:1;return m.jsxs("div",{className:`premium-datepicker-wrapper${u?" has-custom-days":""}${n?" inline-mode":""}`,children:[m.jsx("style",{children:`
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
      `}),!n&&m.jsx(I,{className:"date-icon h-5 w-5 text-secondary-300"}),m.jsx(P,{selected:_,startDate:_,endDate:D,onChange:z,minDate:o,maxDate:C,filterDate:a,onMonthChange:i,renderDayContents:u,selectsRange:t,monthsShown:M,dateFormat:"MMM d, yyyy",placeholderText:t?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:d=>d.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:n,open:n?void 0:x,openToDate:_||new Date,onInputClick:n?void 0:()=>f(!0),onClickOutside:n?void 0:()=>f(!1),onCalendarClose:n?void 0:()=>f(!1),renderCustomHeader:({monthDate:d,decreaseMonth:s,increaseMonth:h,prevMonthButtonDisabled:y,nextMonthButtonDisabled:v})=>m.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[m.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:d.toLocaleString("en-US",{month:"long",year:"numeric"})}),m.jsxs("div",{className:"flex gap-2",children:[m.jsx("button",{type:"button",onClick:s,disabled:y,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:m.jsx(E,{className:"h-4 w-4"})}),m.jsx("button",{type:"button",onClick:h,disabled:v,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:m.jsx(L,{className:"h-4 w-4"})})]})]})})]})}export{K as C,G as a,O as b,$ as c,H as d,B as e,j as f,U as g,A as s,q as u};
