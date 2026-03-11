import mqtt from "mqtt";
import { dataBus } from "../databus.js";

let client: mqtt.MqttClient | null = null;
let currentNbID: string | null = null;

export function mqttStart(nbID: string) {
  //console.log('entrou no start');
  if (client) return;
  //console.log('continuou iniciando');
  currentNbID = nbID;
  client = mqtt.connect("mqtt://tsapp.com.br:1883", {
    username: 'umbum',
    password: 'U4m5b7U5m4',
    clientId: 'tsapp_mob_' + Math.random().toString(16).substr(2, 8),
    clean: true,
    reconnectPeriod: 5000
  });

  client.on("connect", () => {
    client?.subscribe(`${currentNbID}/status`);
  });

  client.on("message", (topic, message) => {
    const payload = message.toString();
    
    dataBus.emit("raw", {
      source: "MQTT",
      payload
    });

    if (topic.endsWith("/status")) {
      dataBus.emit("device:status", payload);
    }
  });

  client.on("error", (err) => {
    //console.error("❌ MQTT error:", err.message);
  });

  client.on("close", () => {
    //console.warn("⚠️ MQTT desconectado");
    client = null;
  });

}

export function mqttPublishData(topic: string, payload: any) {
  if (!client || !currentNbID) return;
  //console.log(`${currentNbID}/${topic}`);
  client.publish(
    `${currentNbID}/${topic}`,
    JSON.stringify(payload),
    { qos: 1, retain: false }
  );
}

export function mqttSendCommand(cmd: string) {
  if (!client || !currentNbID) return;

  client.publish(`${currentNbID}/command`, cmd);
}

export function mqttStop() {
  client?.end(true);
  client = null;
  currentNbID = null;
}

