import React from "react";
import Modal from "./ui/Modal";

/**
 * Reusable detail popup for transfer and cover/insurance options.
 * Props:
 *   data       – { title, subtitle?, description, image? }
 *   onClose    – function
 *   maxWidth   – optional, defaults to "max-w-3xl"
 */
export default function InfoDetailModal({ data, onClose, maxWidth = "max-w-3xl" }) {
  return (
    <Modal
      open={Boolean(data)}
      onClose={onClose}
      title={data?.title || "Details"}
      subtitle={data?.subtitle || ""}
      maxWidth={maxWidth}
    >
      {data ? (
        <div className="pb-2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {data.image ? (
              <div className="w-full shrink-0 sm:w-2/5">
                <div className="aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200">
                  <img
                    src={data.image}
                    alt={data.title || ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            ) : null}
            <div className="flex-1 overflow-y-auto">
              {data.description ? (
                <div
                  className="prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&>div]:[padding:0_!important] [&>div]:[background:none_!important]"
                  dangerouslySetInnerHTML={{ __html: data.description }}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
