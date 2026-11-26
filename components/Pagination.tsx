"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";

type PaginationComponentProps = PaginationProps & {
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
};

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationComponentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const isPending = isLoading || isNavigating;

  const handleNavigation = (type: "prev" | "next") => {
    if (isPending) return;

    const pageNumber = type === "prev" ? page - 1 : page + 1;
    if (pageNumber < 1 || pageNumber > totalPages) return;

    if (onPageChange) {
      onPageChange(pageNumber);
      return;
    }

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: pageNumber.toString(),
    });

    startTransition(() => {
      router.push(newUrl, { scroll: false });
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("prev")}
        disabled={Number(page) <= 1 || isPending}
      >
        <Image
          src="/icons/arrow-left.svg"
          alt=""
          width={20}
          height={20}
          className="mr-2"
        />
        Prev
      </Button>

      <p className="text-14 flex items-center gap-2 px-2 tabular-nums" aria-live="polite">
        {isPending && <Loader2 size={15} className="animate-spin" />}
        {isPending ? "Loading..." : `${page} / ${totalPages}`}
      </p>

      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("next")}
        disabled={Number(page) >= totalPages || isPending}
      >
        Next
        <Image
          src="/icons/arrow-left.svg"
          alt=""
          width={20}
          height={20}
          className="ml-2 -scale-x-100"
        />
      </Button>
    </div>
  );
};
