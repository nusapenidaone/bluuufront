import React from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const PHONE_STYLE = `
.react-international-phone-input-container {
  width: 100%;
  display: flex;
}
.react-international-phone-input-container .react-international-phone-input {
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
  transition: all 0.2s;
}
.react-international-phone-input-container .react-international-phone-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.react-international-phone-input-container .react-international-phone-country-selector-button {
  height: 2.75rem;
  border-radius: 0.75rem 0 0 0.75rem;
  border: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 0 0.5rem 0 0.75rem;
  transition: all 0.2s;
}
`;

let styleInjected = false;

export default function PhoneInputComponent({ value, onChange }) {
  if (!styleInjected && typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = PHONE_STYLE;
    document.head.appendChild(style);
    styleInjected = true;
  }

  return (
    <PhoneInput
      name="phone"
      type="tel"
      defaultCountry="id"
      value={value}
      onChange={onChange}
    />
  );
}
