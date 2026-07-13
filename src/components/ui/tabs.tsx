"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.id);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full items-center justify-center p-1 bg-gray-100/50 rounded-xl mb-8 border border-gray-100 p-1 mx-auto max-w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-6 py-2.5 text-sm font-medium rounded-lg transition-colors outline-none",
              activeTab === tab.id
                ? "text-gray-950"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab.content}
              </motion.div>
            )
        )}
      </div>
    </div>
  );
}
