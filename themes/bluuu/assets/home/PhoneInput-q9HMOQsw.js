import{j as t}from"./vendor-motion-wRSbqP8r.js";import{Y as a}from"./vendor-phone-SWYFwGOa.js";const i=`
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
`;let n=!1;function p({value:r,onChange:o}){if(!n&&typeof document<"u"){const e=document.createElement("style");e.textContent=i,document.head.appendChild(e),n=!0}return t.jsx(a,{value:r,type:"tel",name:"phone",onChange:o,disableDialCodePrefill:!0})}export{p as P};
