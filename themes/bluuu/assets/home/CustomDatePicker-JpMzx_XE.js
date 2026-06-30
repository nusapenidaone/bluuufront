import{r as u,j as i,D as N}from"./vendor-datepicker-DXD6OlhH.js";import{C as T,y as S,z as E}from"./vendor-icons-DhLFaV1I.js";function I(...l){return l.filter(Boolean).join(" ")}function O({mode:l="single",selected:e,onSelect:k,minDate:g=(()=>{const r=new Date;return r.setHours(0,0,0,0),r})(),filterDate:y,onMonthChange:_,renderDayContents:h,className:P,inline:p=!1,fixedRangeDays:x=0,maxRangeDays:m=0}){const r=l==="range",[v,D]=u.useState(!1),[z,o]=u.useState(!1),[f,b]=u.useState(null);u.useEffect(()=>{const t=()=>{D(window.innerWidth<=768)};return t(),window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]);const j=t=>{if(r&&x>0){const[a]=t;if(a){const n=new Date(a);n.setDate(n.getDate()+x-1),k({from:a,to:n}),p||setTimeout(()=>o(!1),100)}}else if(r){const[a,n]=t;b(a&&!n?a:null);let c=n;if(n&&a&&m>0){const s=new Date(a.getTime()+(m-1)*24*60*60*1e3);n>s&&(c=s)}k({from:a,to:c}),c&&!p&&setTimeout(()=>o(!1),100)}else k(t),p||setTimeout(()=>o(!1),100)};let d=null,w=null;r?(e?.from&&(d=e.from instanceof Date?e.from:new Date(e.from)),e?.to&&(w=e.to instanceof Date?e.to:new Date(e.to))):e&&(d=e instanceof Date?e:new Date(e));const C=r&&m>0&&f&&!w?new Date(f.getTime()+(m-1)*24*60*60*1e3):void 0,M=v?1:r?2:1;return i.jsxs("div",{className:`premium-datepicker-wrapper${h?" has-custom-days":""}${p?" inline-mode":""}`,children:[i.jsx("style",{children:`
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
      `}),!p&&i.jsx(T,{className:"date-icon h-5 w-5 text-secondary-300"}),i.jsx(N,{selected:d,startDate:d,endDate:w,onChange:j,minDate:g,maxDate:C,filterDate:y,onMonthChange:_,renderDayContents:h,selectsRange:r,monthsShown:M,dateFormat:"MMM d, yyyy",placeholderText:r?"Select date range...":"Select a date...",autoComplete:"new-password",onKeyDown:t=>t.preventDefault(),showPopperArrow:!1,popperPlacement:"bottom-start",inline:p,open:p?void 0:z,openToDate:d||new Date,onInputClick:p?void 0:()=>o(!0),onClickOutside:p?void 0:()=>o(!1),onCalendarClose:p?void 0:()=>o(!1),renderCustomHeader:({monthDate:t,decreaseMonth:a,increaseMonth:n,prevMonthButtonDisabled:c,nextMonthButtonDisabled:s})=>i.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[i.jsx("span",{className:"text-base font-extrabold text-secondary-900",children:t.toLocaleString("en-US",{month:"long",year:"numeric"})}),i.jsxs("div",{className:"flex gap-2",children:[i.jsx("button",{type:"button",onClick:a,disabled:c,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:i.jsx(S,{className:"h-4 w-4"})}),i.jsx("button",{type:"button",onClick:n,disabled:s,className:"grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30",children:i.jsx(E,{className:"h-4 w-4"})})]})]})})]})}export{O as C,I as c};
