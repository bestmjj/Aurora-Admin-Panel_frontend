import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotificationsReducer,
  type NotificationType,
} from "../atoms/notification";
import { copyToClipboard } from "../utils/clipboard";
import useMaybeT from "../hooks/useMaybeT";

const typeStyles: Record<NotificationType, { card: string; bar: string; barTrack: string }> = {
  success: {
    card: "bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-100 dark:ring-emerald-800",
    bar: "bg-emerald-500",
    barTrack: "bg-emerald-200 dark:bg-emerald-800",
  },
  info: {
    card: "bg-sky-50 text-sky-900 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-100 dark:ring-sky-800",
    bar: "bg-sky-500",
    barTrack: "bg-sky-200 dark:bg-sky-800",
  },
  warning: {
    card: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-100 dark:ring-amber-800",
    bar: "bg-amber-500",
    barTrack: "bg-amber-200 dark:bg-amber-800",
  },
  error: {
    card: "bg-red-50 text-red-900 ring-red-200 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-800",
    bar: "bg-red-500",
    barTrack: "bg-red-200 dark:bg-red-800",
  },
};

interface ProgressBarProps {
  duration: number;
  type: NotificationType;
  pausedState: { id: number | null; paused: boolean } | null;
}

const ProgressBar = ({ duration, type, pausedState }: ProgressBarProps) => {
  const [progress, setProgress] = useState(100);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const styles = typeStyles[type] ?? typeStyles.info;

  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (interval.current) clearInterval(interval.current);

    const shouldRun = pausedState ? !pausedState.paused : true;
    if (shouldRun) {
      interval.current = setInterval(() => {
        setProgress((prev) => Math.max(prev - 100 / (duration / 100), 0));
      }, 100);
    }
  }, [duration, pausedState]);

  return (
    <div className={cn("h-1 w-full rounded", styles.barTrack)}>
      <div
        className={cn("h-1 rounded", styles.bar)}
        style={{ width: `${progress}%`, transition: "width 100ms linear" }}
      />
    </div>
  );
};

const Notification = () => {
  const maybeT = useMaybeT();
  const { t } = useTranslation();
  const { notifications, removeNotification, addNotification } =
    useNotificationsReducer();
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const startTimes = useRef(new Map<number, number>());
  const remainingDurations = useRef(new Map<number, number>());
  const [pausedState, setPausedState] = useState<{
    id: number | null;
    paused: boolean;
  }>({ id: null, paused: false });

  const pauseTimer = (id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    remainingDurations.current.set(
      id,
      (startTimes.current.get(id) ?? 0) +
        (remainingDurations.current.get(id) ?? 0) -
        Date.now()
    );
    setPausedState({ id, paused: true });
  };

  const resumeTimer = (id: number) => {
    const timer = setTimeout(() => {
      removeNotification(id);
      timers.current.delete(id);
      startTimes.current.delete(id);
      remainingDurations.current.delete(id);
    }, remainingDurations.current.get(id) ?? 0);
    timers.current.set(id, timer);
    startTimes.current.set(id, Date.now());
    setPausedState({ id, paused: false });
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!timers.current.has(notification.id)) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
          timers.current.delete(notification.id);
          startTimes.current.delete(notification.id);
          remainingDurations.current.delete(notification.id);
        }, notification.duration);
        timers.current.set(notification.id, timer);
        startTimes.current.set(notification.id, Date.now());
        remainingDurations.current.set(notification.id, notification.duration);
      }
    });
  }, [notifications]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ul className="fixed top-16 right-8 z-[1200] flex flex-col items-end space-y-2">
      <AnimatePresence initial={false} mode="popLayout">
        {notifications.map((notification) => {
          const styles = typeStyles[notification.type] ?? typeStyles.info;

          return (
            <motion.li
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.2 },
              }}
              className="cursor-pointer"
              title={t("Click to copy")}
              onMouseEnter={() => pauseTimer(notification.id)}
              onMouseLeave={() => resumeTimer(notification.id)}
              onClick={async () => {
                const text = [notification.title, notification.body]
                  .filter(Boolean)
                  .join(": ");
                const { ok } = await copyToClipboard(text);
                if (ok) {
                  addNotification({
                    title: "",
                    body: "Copied to clipboard",
                    type: "success",
                    duration: 1000,
                  });
                } else {
                  addNotification({
                    title: "",
                    body: "Copy failed",
                    type: "error",
                    duration: 2000,
                  });
                }
              }}
            >
              <div
                className={cn(
                  "relative flex w-full max-w-xs items-center gap-2 overflow-hidden rounded-xl p-3 shadow-lg ring-1 pointer-events-auto",
                  styles.card
                )}
              >
                <div className="min-w-0 flex-1">
                  {notification.body && (
                    <div className="max-w-full overflow-hidden text-xs whitespace-pre-wrap break-all">
                      {notification.title && (
                        <span className="font-bold">
                          [{maybeT(notification.title)}]&nbsp;
                        </span>
                      )}
                      {maybeT(notification.body)}
                    </div>
                  )}
                </div>
                <button
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
                  aria-label="Close notification"
                  title="Close"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  <X className="size-3.5" />
                </button>
                <div className="absolute inset-x-0 bottom-0 z-[1200] w-full pointer-events-none">
                  <ProgressBar
                    duration={notification.duration}
                    type={notification.type}
                    pausedState={
                      pausedState.id === notification.id ? pausedState : null
                    }
                  />
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
};

export default Notification;
