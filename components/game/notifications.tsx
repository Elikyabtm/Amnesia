"use client";

import { useEffect, useState } from "react";
import { X, Mail, Calendar, Bell } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

const iconMap = {
  mail: Mail,
  calendar: Calendar,
  system: Bell,
};

export function NotificationCenter() {
  const { notifications, dismissNotification, openWindow } = useGame();
  const { playSound } = useSound();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Show new notifications with animation
    notifications.forEach((notif) => {
      if (!visibleNotifications.includes(notif.id)) {
        playSound("notification");
        setVisibleNotifications((prev) => [...prev, notif.id]);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          dismissNotification(notif.id);
        }, 5000);
      }
    });
  }, [notifications, visibleNotifications, dismissNotification, playSound]);

  const handleClick = (notifId: string, icon: string) => {
    playSound("click");
    dismissNotification(notifId);
    
    // Open relevant app
    if (icon === "mail") {
      openWindow("mail");
    } else if (icon === "calendar") {
      openWindow("calendar");
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[3000] flex flex-col gap-2 pointer-events-none">
      {notifications.slice(0, 3).map((notif, index) => {
        const Icon = iconMap[notif.icon];
        return (
          <div
            key={notif.id}
            className="pointer-events-auto bg-[#2d2d2d]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-4 w-80 animate-slide-in-right cursor-pointer hover:bg-[#353535]/95 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleClick(notif.id, notif.icon)}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-[#0078d4]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#0078d4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{notif.title}</p>
                <p className="text-xs text-white/60 mt-0.5">{notif.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notif.id);
                }}
                className="text-white/40 hover:text-white p-1 -m-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
