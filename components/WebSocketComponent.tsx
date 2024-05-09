"use client";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

interface KlineDataPoint {
  x: Date;
  y: number[];
}

interface SeriesData {
  data: KlineDataPoint[];
}

const WebSocketComponent = () => {
  const [data, setData] = useState<any[]>([]);
  const [series, setSeries] = useState<SeriesData[]>([{ data: [] }]);
  const tablet = useMediaQuery("(min-width:960px)");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      if (newData.e === "trade") {
        var date = new Date(newData.E * 1000);

        // Extract hours, minutes, and seconds
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        newData.date = hours + ":" + minutes + ":" + seconds;
        console.log(newData);
        // Add to data if it's a kline event, regardless of "x" status
        setData((prevData) => [...prevData, newData]);
      } else if (newData.e === "kline") {
        if (newData.k.x === true) {
          setSeries((prevSeries) => [
            {
              data: [
                ...prevSeries[0].data,
                {
                  x: new Date(newData.E), // Convert UNIX timestamp to JavaScript Date object
                  y: [
                    parseFloat(newData.k.o), // open
                    parseFloat(newData.k.h), // high
                    parseFloat(newData.k.l), // low
                    parseFloat(newData.k.c), // close
                  ],
                },
              ],
            },
          ]);
        }
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "candlestick", // Use 'candlestick' instead of 'string'
      height: 350,
    },
    // title: {
    //   text: "CandleStick Chart",
    //   align: "left",
    // },
    xaxis: {
      type: "datetime", // Correctly specified as 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <Box
      display={"flex"}
      alignContent={"center"}
      flexDirection={tablet ? "row" : "column"}
    >
      <Box width={tablet ? "50%" : "100%"}>
        <ReactApexChart
          options={options}
          series={series}
          type="candlestick"
          height={350}
        />
      </Box>

      {/* Render data */}
      <Box
        height={"300px"}
        width={tablet ? "50%" : "100%"}
        overflow={"scroll"}
        alignSelf={"center"}
      >
        {data
          .slice()
          .reverse()
          .map((item, index) => (
            <p style={{ fontSize: 12 }} key={index}>
              {item.date}: {item.s} was bought for {item.p} at volume {item.q}
            </p>
          ))}
      </Box>
    </Box>
  );
};

export default WebSocketComponent;
