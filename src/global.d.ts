// global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      onNBStatus: (callback: (status: boolean) => void) => () => void;
      onNBData: (callback: (data: any) => void) => void;
      sendNBCommand: (cmd: string) => Promise<any>;

      getInternetStatus: () => Promise<boolean>;
      startMonitoring: () => Promise<boolean>;
      stopMonitoring: () => Promise<boolean>;
      getModeStatus: () => Promise<boolean>;
      getNBStatus: () => Promise<boolean>;
      getNBID: () => Promise<string>;
      ping: () => Promise<string>;

      platform: string;

      db: {
        getLastEvents: (limit?: number) => Promise<any>;
        saveEvent: (eventData: any) => Promise<any>;
        getConfig: () => Promise<any>;
        setConfig: (eventData: any) => Promise<any>;
        clean: () => Promise<void>;
        close: () => Promise<void>;
      };
    };
  }
}
