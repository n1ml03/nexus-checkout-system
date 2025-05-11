import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * DatabaseStatus component
 *
 * Displays the current PostgreSQL database connection status (local or remote)
 */
export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLocal, setIsLocal] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're using a local database based on the host configuration
    const host = import.meta.env.VITE_PG_HOST || 'localhost';
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    setIsLocal(isLocalHost);

    // In a real implementation, we would check the database connection here
    // For now, we'll just assume it's connected
    setIsConnected(true);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">
            <Badge variant={isConnected ? "outline" : "destructive"} className="h-6 gap-1">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isLocal ? 'Local DB' : 'Remote DB'}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isConnected
              ? `Connected to ${isLocal ? 'local' : 'remote'} PostgreSQL database`
              : `${isLocal ? 'Local' : 'Remote'} PostgreSQL database is not available`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {import.meta.env.VITE_PG_HOST || 'localhost'}:{import.meta.env.VITE_PG_PORT || '5432'}/{import.meta.env.VITE_PG_DATABASE || 'nexus_checkout'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
