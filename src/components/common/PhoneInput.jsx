import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const STYLE = `
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
`;

let styleInjected = false;

export default function PhoneInputComponent({ value, onChange }) {
  if (!styleInjected && typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);
    styleInjected = true;
  }

  return (
    <PhoneInput
      className="bluuu-phone"
      international
      defaultCountry="ID"
      value={value}
      onChange={onChange}
      limitMaxLength={false}
    />
  );
}
