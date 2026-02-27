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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[180px]">
            <Skeleton className="col-span-2 row-span-2 rounded-2xl lg:h-full h-[300px]" />
            <Skeleton className="hidden rounded-2xl lg:block" />
            <Skeleton className="hidden rounded-2xl lg:block" />
            <Skeleton className="rounded-2xl" />
            <Skeleton className="rounded-2xl" />
        </div>
    );
};

export default Skeleton;
