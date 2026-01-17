"use client";

interface LiveIndicatorProps {
  label?: string;
  color?: "green" | "yellow" | "purple";
}

export default function LiveIndicator({ label = "Live", color = "green" }: LiveIndicatorProps) {
  const colors = {
    green: {
      ping: "bg-green-400",
      dot: "bg-green-500",
      text: "text-green-400",
    },
    yellow: {
      ping: "bg-yellow-400",
      dot: "bg-yellow-500",
      text: "text-yellow-400",
    },
    purple: {
      ping: "bg-purple-400",
      dot: "bg-purple-500",
      text: "text-purple-400",
    },
  };

  const colorClasses = colors[color];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses.ping} opacity-75`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${colorClasses.dot}`}
        ></span>
      </span>
      <span className={`text-xs font-medium ${colorClasses.text}`}>{label}</span>
    </div>
  );
}
