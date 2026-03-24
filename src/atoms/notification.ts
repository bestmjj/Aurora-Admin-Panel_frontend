import { atom, getDefaultStore } from "jotai";
import { useReducerAtom } from "jotai/utils";

const DEFAULT_DURATION = 5000;

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
    id: number;
    title: string;
    body: string;
    type: NotificationType;
    duration: number;
}

interface AddNotificationInput {
    title?: string;
    body?: string;
    type?: NotificationType;
    duration?: number;
}

type NotificationAction =
    | { type: "addNotification"; payload: Notification }
    | { type: "removeNotification"; payload: number };

export const notificationsAtom = atom<Notification[]>([]);

const notificationsReducer = (prev: Notification[], action: NotificationAction): Notification[] => {
    switch (action.type) {
        case "addNotification":
            return [...prev, action.payload];
        case "removeNotification":
            return prev.filter((notification) => notification.id !== action.payload);
        default:
            throw new Error(`Unhandled action type: ${(action as { type: string }).type}`);
    }
};

export const useNotificationsReducer = () => {
    const [notifications, dispatch] = useReducerAtom(notificationsAtom, notificationsReducer);

    const addNotification = ({ title = "", body = "", type = "info", duration = DEFAULT_DURATION }: AddNotificationInput) => {
        const id = Date.now(); // Use timestamp as a unique ID
        const notification: Notification = { id, title, body, type, duration };

        dispatch({ type: "addNotification", payload: notification });

        // Automatically remove notification after the specified duration
        setTimeout(() => {
            dispatch({ type: "removeNotification", payload: id });
        }, duration);
    };

    const removeNotification = (id: number) => {
        dispatch({ type: "removeNotification", payload: id });
    };

    return {
        notifications,
        addNotification,
        removeNotification,
    };
};

// Non-hook API for triggering notifications outside React components
export const notify = ({ title = "", body = "", type = "info", duration = DEFAULT_DURATION }: AddNotificationInput) => {
    const store = getDefaultStore();
    const id = Date.now();
    const notification: Notification = { id, title, body, type, duration };

    // Add notification
    store.set(notificationsAtom, (prev) => [...prev, notification]);

    // Auto-remove after duration
    setTimeout(() => {
        store.set(notificationsAtom, (prev) => prev.filter((n) => n.id !== id));
    }, duration);
};
