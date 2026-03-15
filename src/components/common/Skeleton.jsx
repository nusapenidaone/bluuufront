import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const Skeleton = ({ className, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className={cn("rounded-md bg-neutral-200", className)}
            {...props}
        />
    );
};

export const CardSkeleton = ({ className }) => {
    return (
        <div className={cn("rounded-[24px] border border-neutral-100 bg-white p-5 shadow-sm", className)}>
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="mt-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <div className="pt-4">
                    <Skeleton className="h-10 w-full rounded-full" />
                </div>
            </div>
        </div>
    );
};

export const GallerySkeleton = () => {
    return (
        <>
            <div className="grid h-[340px] grid-rows-[2fr_1fr] gap-[3px] sm:hidden">
                <Skeleton className="rounded-2xl" />
                <div className="grid grid-cols-2 gap-[3px]">
                    <Skeleton className="rounded-2xl" />
                    <Skeleton className="rounded-2xl" />
                </div>
            </div>
            <div className="hidden h-[520px] grid-cols-2 gap-[3px] sm:grid">
                <Skeleton className="h-full rounded-2xl" />
                <div className="grid grid-cols-2 gap-[3px]">
                    <div className="grid min-h-0 grid-rows-[1.35fr_0.75fr] gap-[3px]">
                        <Skeleton className="h-full rounded-2xl" />
                        <Skeleton className="h-full rounded-2xl" />
                    </div>
                    <div className="grid min-h-0 grid-rows-[0.75fr_1.35fr] gap-[3px]">
                        <Skeleton className="h-full rounded-2xl" />
                        <Skeleton className="h-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Skeleton;
