import { useNotification } from '../../hooks';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-center">
      {notifications.map(notif => (
        <div 
          key={notif.id}
          className={`notification notification-${notif.type}`}
          role="alert"
        >
          <div className="notification-content">{notif.message}</div>
          <button 
            className="notification-close"
            onClick={() => removeNotification(notif.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
