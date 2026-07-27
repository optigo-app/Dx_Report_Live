"use client";

import { createContext, useContext, useState } from "react";

const DeviceStatusContext = createContext();

export const DeviceStatusProvider = ({ children }) => {
  const [deviceStatus, setDeviceStatus] = useState(null);
  return (
    <DeviceStatusContext.Provider value={{ deviceStatus, setDeviceStatus }}>
      {children}
    </DeviceStatusContext.Provider>
  );
};

export const useDeviceStatus = () => useContext(DeviceStatusContext);