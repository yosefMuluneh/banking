import Image from "next/image";
import Link from "next/link";
import React from "react";
import BankCard from "./BankCard";
import { countTransactionCategories } from "@/lib/utils";
import { Category } from "./Category";

const RightSidebar = ({
  user,
  transactions = [],
  banks = [],
}: RightSidebarProps) => {
  const categories: CategoryCount[] = countTransactionCategories(transactions);

  return (
    <aside className="right-sidebar">
      <section className="flex min-w-0 flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile min-w-0">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">
              {user.firstName?.[0] || "U"}
            </span>
          </div>
          <div className="profile-details min-w-0">
            <h1 className="profile-name break-words">
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-email break-all">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="banks min-w-0">
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          <h2 className="header-2">My Banks</h2>
          <Link href="/my-banks" className="flex shrink-0 items-center gap-2">
            <Image src="/icons/plus.svg" height={20} width={20} alt="plus" />
            <span className="text-14 font-semibold text-gray-600">Add Bank</span>
          </Link>
        </div>

        {banks.length > 0 && (
          <div className="relative flex min-h-[222px] w-full min-w-0 flex-1 flex-col items-center justify-center gap-5">
            <div className="relative z-10 w-full max-w-[320px]">
              <BankCard
                key={banks[0].$id}
                account={banks[0]}
                userName={`${user.firstName} ${user.lastName}`}
                showBalance={false}
              />
            </div>
            {banks[1] && (
              <div className="absolute right-0 top-8 z-0 w-[90%] max-w-[288px]">
                <BankCard
                  key={banks[1].$id}
                  account={banks[1]}
                  userName={`${user.firstName} ${user.lastName}`}
                  showBalance={false}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex min-w-0 flex-1 flex-col gap-4">
          <h2 className="header-2">Top categories</h2>
          <div className="space-y-4">
            {categories.map((category) => (
              <Category key={category.name} category={category} />
            ))}
            {categories.length === 0 && (
              <p className="text-14 text-gray-500">Your spending categories will appear here.</p>
            )}
          </div>
        </div>
      </section>
    </aside>
  );
};

export default RightSidebar;
