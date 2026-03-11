//src/types/node-wifi.d.ts
declare module "node-wifi" {
    interface WifiNetwork {
        ssid: string;
        mac: string;
        signal_level: number;
        quality: number;
        frequency: number;
        security: string[];
    }

    interface WifiConnection {
        ssid: string;
        mac: string;
        frequency: number;
        signal_level: number;
        quality: number;
        security: string[];
    }

    const wifi: {
        init: (opts: { iface: string | null }) => void;
        scan: () => Promise<WifiNetwork[]>;
        connect: (options: { ssid: string; password?: string }) => Promise<void>;
        disconnect: () => Promise<void>;
        getCurrentConnections: () => Promise<WifiConnection[]>;
    };

    export default wifi;
}
