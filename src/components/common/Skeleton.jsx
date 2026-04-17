import { cn } from "../../lib/utils";

const Skeleton = ({ className, ...props }) => (
    <div
        className={cn("rounded-md bg-neutral-200 animate-pulse", className)}
        {...props}
    />
);

export const CardSkeleton = ({ className }) => (
    <div className={cn("rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm", className)}>
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

export const GallerySkeleton = () => (
    <>
        <div className="grid h-[340px] grid-rows-[2fr_1fr] gap-0.75 sm:hidden">
            <Skeleton className="rounded-2xl" />
            <div className="grid grid-cols-2 gap-0.75">
                <Skeleton className="rounded-2xl" />
                <Skeleton className="rounded-2xl" />
            </div>
        </div>
        <div className="hidden h-[520px] grid-cols-2 gap-0.75 sm:grid">
            <Skeleton className="h-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-0.75">
                <div className="grid min-h-0 grid-rows-[1.35fr_0.75fr] gap-0.75">
                    <Skeleton className="h-full rounded-2xl" />
                    <Skeleton className="h-full rounded-2xl" />
                </div>
                <div className="grid min-h-0 grid-rows-[0.75fr_1.35fr] gap-0.75">
                    <Skeleton className="h-full rounded-2xl" />
                    <Skeleton className="h-full rounded-2xl" />
                </div>
            </div>
        </div>
    </>
);

export default Skeleton;
