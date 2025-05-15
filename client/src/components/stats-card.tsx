import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon, MegaphoneIcon, BarChart3Icon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  icon: "money" | "campaign" | "engagement";
  valuePrefix?: string;
}

export default function StatsCard({ title, value, change, icon, valuePrefix }: StatsCardProps) {
  // Format the value based on the type and magnitude
  const formattedValue = (() => {
    if (value === undefined || value === null) {
      return "0";
    } else if (valuePrefix === "$") {
      return formatCurrency(value);
    } else if (value >= 1000) {
      return formatCompactNumber(value);
    } else {
      return value.toString();
    }
  })();

  const isPositive = (change || 0) >= 0;
  
  // Icon component based on the icon type
  const IconComponent = () => {
    switch (icon) {
      case "money":
        return (
          <div className="bg-primary bg-opacity-10 p-2 rounded-lg text-primary">
            <DollarSignIcon className="h-6 w-6" />
          </div>
        );
      case "campaign":
        return (
          <div className="bg-secondary bg-opacity-10 p-2 rounded-lg text-secondary">
            <MegaphoneIcon className="h-6 w-6" />
          </div>
        );
      case "engagement":
        return (
          <div className="bg-accent bg-opacity-10 p-2 rounded-lg text-accent">
            <BarChart3Icon className="h-6 w-6" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card p-6 shadow-md">
      <CardContent className="p-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <h3 className="font-bold text-2xl mt-1">{formattedValue}</h3>
            <p className="text-xs flex items-center mt-1">
              <span className={`flex items-center ${isPositive ? 'text-secondary' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                {Math.abs(change || 0).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </p>
          </div>
          <IconComponent />
        </div>
      </CardContent>
    </Card>
  );
}
