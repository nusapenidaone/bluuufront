import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Premium Custom Date Picker using react-datepicker
 * Dropdown style with luxury Bluuu aesthetic.
 */
export default function CustomDatePicker({
  mode = "single", // "single" | "range"
  selected, // Date for single, { from, to } for range
  onSelect,
  minDate = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(),
  filterDate, // optional: (date: Date) => boolean — return false to disable
  onMonthChange, // optional: (date: Date) => void — called when month is navigated
  renderDayContents, // optional: (dayOfMonth: number, date: Date) => ReactNode
  className,
  inline = false, // when true, renders calendar directly (no input field)
}) {
  const isRange = mode === "range";

  // Track if mobile view
  const [isMobile, setIsMobile] = useState(false);

  // Track if calendar is open (only used in dropdown mode)
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle change for both modes
  const handleChange = (dates) => {
    if (isRange) {
      const [from, to] = dates;
      onSelect({ from, to });
      // Close calendar after selecting end date (dropdown mode only)
      if (to && !inline) {
        setTimeout(() => setIsOpen(false), 100);
      }
    } else {
      onSelect(dates);
      // Close calendar immediately for single date (dropdown mode only)
      if (!inline) {
        setTimeout(() => setIsOpen(false), 100);
      }
    }
  };

  // Parse selected dates - handle both Date objects and ISO strings
  let selectedDate = null;
  let endDate = null;

  if (isRange) {
    // Range mode: selected is { from: Date|string, to: Date|string }
    if (selected?.from) {
      selectedDate = selected.from instanceof Date ? selected.from : new Date(selected.from);
    }
    if (selected?.to) {
      endDate = selected.to instanceof Date ? selected.to : new Date(selected.to);
    }
  } else {
    // Single mode: selected is Date|string
    if (selected) {
      selectedDate = selected instanceof Date ? selected : new Date(selected);
    }
  }

  // Determine how many months to show: 1 on mobile, 2 on desktop (for range only)
  const monthsToShow = isMobile ? 1 : (isRange ? 2 : 1);

  return (
    <div className={`premium-datepicker-wrapper${renderDayContents ? " has-custom-days" : ""}`}>
      <style>{`
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
            max-width: 300px;
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
            width: 32px;
            font-size: 0.625rem;
          }

          .premium-datepicker-wrapper .react-datepicker__day {
            width: 32px;
            height: 32px;
            line-height: 32px;
            font-size: 0.75rem;
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
      `}</style>
      {!inline && <CalendarIcon className="date-icon h-5 w-5 text-secondary-300" />}
      <DatePicker
        selected={selectedDate}
        startDate={selectedDate}
        endDate={endDate}
        onChange={handleChange}
        minDate={minDate}
        filterDate={filterDate}
        onMonthChange={onMonthChange}
        renderDayContents={renderDayContents}
        selectsRange={isRange}
        monthsShown={monthsToShow}
        dateFormat={isRange ? "MMM d, yyyy" : "MMM d, yyyy"}
        placeholderText={isRange ? "Select date range..." : "Select a date..."}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        inline={inline}
        open={inline ? undefined : isOpen}
        openToDate={selectedDate || new Date()}
        onInputClick={inline ? undefined : () => setIsOpen(true)}
        onClickOutside={inline ? undefined : () => setIsOpen(false)}
        onCalendarClose={inline ? undefined : () => setIsOpen(false)}
        renderCustomHeader={({
          monthDate,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-4 pb-2">
            <span className="text-base font-extrabold text-secondary-900">
              {monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="grid h-8 w-8 place-items-center rounded-full border border-neutral-100 bg-white text-secondary-600 transition hover:border-primary-600 hover:text-primary-600 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
