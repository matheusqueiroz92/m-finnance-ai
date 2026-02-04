import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

type ColorVariant = "emerald" | "blue" | "purple" | "indigo";

const colorClasses: Record<
  ColorVariant,
  { bgLight: string; bgDark: string; iconLight: string; iconDark: string }
> = {
  emerald: {
    bgLight: "bg-emerald-100",
    bgDark: "bg-emerald-500/20",
    iconLight: "text-emerald-600",
    iconDark: "text-emerald-400",
  },
  blue: {
    bgLight: "bg-blue-100",
    bgDark: "bg-blue-500/20",
    iconLight: "text-blue-600",
    iconDark: "text-blue-400",
  },
  purple: {
    bgLight: "bg-purple-100",
    bgDark: "bg-purple-500/20",
    iconLight: "text-purple-600",
    iconDark: "text-purple-400",
  },
  indigo: {
    bgLight: "bg-indigo-100",
    bgDark: "bg-indigo-500/20",
    iconLight: "text-indigo-600",
    iconDark: "text-indigo-400",
  },
};

interface GoalStatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  colorVariant: ColorVariant;
}

export function GoalStatCard({
  label,
  value,
  icon,
  colorVariant,
}: GoalStatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colors = colorClasses[colorVariant];
  const bgClass = isDark ? colors.bgDark : colors.bgLight;
  const iconClass = isDark ? colors.iconDark : colors.iconLight;

  return (
    <Card
      className={`border shadow transition-colors duration-200 rounded-2xl ${
        isDark
          ? "bg-white/10 backdrop-blur-sm border-white/20"
          : "bg-white border-gray-200"
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${bgClass}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center ${iconClass}`}
            >
              {icon}
            </span>
          </div>
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </h2>
          <p
            className={`text-sm ${
              isDark ? "text-zinc-400" : "text-gray-500"
            }`}
          >
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
