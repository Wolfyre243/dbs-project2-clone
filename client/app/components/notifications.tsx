import { House, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';

interface AuditLog {
  username: string;
  entityName: string;
  entityId: number;
  actionTypeId: number;
  actionType: string;
  logText: string;
  timestamp: Date;
}

export function NotificationItem({
  notificationDetails,
}: {
  notificationDetails: AuditLog;
}) {
  const timeAgo = formatDistanceToNow(new Date(notificationDetails.timestamp), {
    addSuffix: true,
  });

  return (
    <div className='flex flex-row gap-3 h-full w-full text-sm'>
      <div className='flex flex-col justify-center items-center p-2 min-h-full rounded-full bg-accent'>
        <House className='w-6 h-6' />
      </div>
      <div className='flex flex-col w-full h-full'>
        <div className='flex flex-row justify-between'>
          <div className='flex flex-row gap-2 w-full items-center'>
            <h1>{notificationDetails.username}</h1>
            <p className='text-xs text-muted-foreground'>{timeAgo}</p>
          </div>
          {/* TODO Perform check to see if actioonType is destructive, if so put badge as destructive variant */}
          {/* <div className='flex flex-row gap-2'>
            <Badge>{notificationDetails.entityName}</Badge>
            
            <Badge>{notificationDetails.actionType}</Badge>
          </div> */}
          <Button variant={'ghost'} className='size-5'>
            <X />
          </Button>
        </div>

        <p>{notificationDetails.logText}</p>
      </div>
    </div>
  );
}

export default function NotificationList() {
  const exampleNotifList: AuditLog[] = [
    {
      username: 'Admin',
      entityName: 'Exhibit',
      entityId: 1,
      actionTypeId: 1,
      actionType: 'Create',
      logText: 'Created new exhibit',
      timestamp: new Date(),
    },
  ];

  return (
    <div className='p-2 h-full'>
      {exampleNotifList.map((notification, i) => {
        return <NotificationItem notificationDetails={notification} key={i} />;
      })}
    </div>
  );
}
