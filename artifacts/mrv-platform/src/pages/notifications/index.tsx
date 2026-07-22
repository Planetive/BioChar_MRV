import { PageContainer } from "@/components/layout/PageContainer";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, AlertTriangle, Info, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const TypeIcons: Record<string, any> = {
  issue_flagged: { icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  deadline_approaching: { icon: Clock, color: "text-accent bg-accent/10" },
  batch_advanced: { icon: CheckCircle2, color: "text-primary bg-primary/10" },
  verification_needed: { icon: Bell, color: "text-blue-400 bg-blue-400/10" },
  allocation_complete: { icon: DollarSignIcon, color: "text-primary bg-primary/10" },
  system: { icon: Info, color: "text-muted-foreground bg-secondary" },
};

function DollarSignIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <PageContainer 
      title="System Notifications" 
      description="Alerts, compliance warnings, and pipeline events"
      action={
        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllRead.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-sm text-sm font-medium hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      }
    >
      <div className="bg-card border border-border rounded-sm max-w-4xl mx-auto h-[700px] flex flex-col">
        <div className="p-4 border-b border-border bg-sidebar/30 flex justify-between items-center">
          <div className="text-sm font-medium">
            {unreadCount} Unread Alerts
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading || !notifications ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-border/50 rounded-sm">
                  <Skeleton className="w-10 h-10 rounded-full bg-secondary shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-secondary" />
                    <Skeleton className="h-4 w-full bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Bell className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium">All caught up.</p>
              <p className="text-sm text-muted-foreground opacity-70 mt-1">No active notifications in the queue.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => {
                const config = TypeIcons[notif.type] || TypeIcons.system;
                const Icon = config.icon;
                
                return (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "p-5 flex gap-4 transition-colors relative group",
                      notif.read ? "bg-card opacity-70 hover:opacity-100" : "bg-secondary/20 hover:bg-secondary/40"
                    )}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border/50", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("text-sm font-bold", notif.read ? "text-foreground" : "text-primary")}>
                          {notif.title}
                        </h4>
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap ml-4">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {notif.body && (
                        <p className="text-sm text-muted-foreground mb-3">{notif.body}</p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {notif.batchId && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm border border-border">
                            Batch {notif.batchId}
                          </span>
                        )}
                        {notif.siteId && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm border border-border">
                            Site {notif.siteId}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!notif.read && (
                      <div className="shrink-0 flex items-center">
                        <button 
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}