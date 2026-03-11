// src/main/databus.ts
import { EventEmitter } from "events";

export type RawNBData = {
  source: "UART" | "MQTT";
  payload: string;
};

export type DeviceStatus = "ONLINE" | "OFFLINE";

class DataBus extends EventEmitter {}

export const dataBus = new DataBus();
