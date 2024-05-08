"use client";
import React, { useEffect, useState } from "react";

// Define the type for the data array
type TradeData = {
  c: number[] | null;
  p: number;
  s: string;
  t: number;
  v: number;
};

const WebSocketComponent = () => {
  const [data, setData] = useState<TradeData[]>([]);
  const [minuteData, setMinuteData] = useState([]);
  const [ohlc, setOhlc] = useState<number[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      // Parse incoming JSON data
      // console.log(event.data);
      const newData = JSON.parse(event.data);
      // Update state by appending new data to existing data
      newData["type"] !== "ping" &&
        setData((prevData) => [...prevData, ...newData.data]);
    };
    // Clear the state every 1 minute
    const clearState = setInterval(() => {
      console.log("hi");
      //To ensure that you're working with the latest state of data, you should use a functional update inside the setInterval callback.

      setData((prevData) => {
        if (prevData.length > 0) {
          // Initialize variables
          let openingPrice = prevData[0].p;
          let closingPrice = prevData[prevData.length - 1].p;
          let highestPrice = prevData[0].p;
          let lowestPrice = prevData[0].p;

          // Update variables
          prevData.forEach((trade) => {
            highestPrice = Math.max(highestPrice, trade.p);
            lowestPrice = Math.min(lowestPrice, trade.p);
          });
          setOhlc([openingPrice, closingPrice, highestPrice, lowestPrice]);
          console.log("donee");
        }
        return []; // Clear data
      });
    }, 5000); // 5 seconds for testing purpose

    return () => {
      socket.close();
      clearInterval(clearState); // Cleanup interval
    };
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Data from Server</h1>
      {/* Render data */}
      <div style={{ height: "300px", width: "100%", overflowY: "scroll" }}>
        {data
          .slice()
          .reverse()
          .map((item, index) => (
            <p style={{ fontSize: 12 }} key={index}>
              {JSON.stringify(item)}
            </p>
          ))}
      </div>
      <div>
        {ohlc && (
          <p>
            {ohlc[0]}, {ohlc[1]}, {ohlc[2]}, {ohlc[3]}
          </p>
        )}
      </div>
    </div>
  );
};

export default WebSocketComponent;
