import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Chart, registerables } from "chart.js";
import DataLabelsPlugin from "chartjs-plugin-datalabels";
import StreamingPlugin from "chartjs-plugin-streaming";
import moment from "moment";

const socket = io("ws://localhost:8000", {
  transports: ["websocket", "polling"],
  secure: true,
});

Chart.register(...registerables, DataLabelsPlugin, StreamingPlugin);
const currentTime = moment(new Date(), "HH:mm:ss").format("HH:mm:ss");
function App() {
  const canvas = useRef();
  const increment = useRef();

  let dataChart;

  useEffect(() => {
    socket.on("topic", (arg) => {
      const { level, ts } = arg;
      if (increment.current === undefined) {
        increment.current = 0;
      }
      if (increment.current < 8) {
        increment.current = increment.current + 1;
      } else {
        removeData(dataChart);
      }
      addData(dataChart, ts, level);
    });
  }, []);

  function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(...data);
    });
    chart.update();
  }

  function removeData(chart) {
    chart.data.labels.splice(-1, 1);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.splice(0, 1);
    });
    chart.update();
  }

  const chartColors = {
    red: "rgb(255, 99, 132)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(75, 192, 192)",
    blue: "rgb(48 128 208 / 48%)",
    purple: "rgb(153, 102, 255)",
    grey: "rgb(201, 203, 207)",
  };

  const data = {
    datasets: [
      {
        label: "Wet Well Level",
        backgroundColor: "#fff",
        borderColor: chartColors.blue,
        borderWidth: 3,
        pointRadius: 3,
        pointStyle: "circle",
        radius: 0,
        fill: false,
        cubicInterpolationMode: "monotone",
        lineTension: 0,
      },
    ],
  };

  useEffect(() => {
    const ctx = canvas.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dataChart = new Chart(ctx, {
      type: "line",
      data,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Suggested Min and Max Settings",
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          x: {
            ticks: {
              callback: function (value, index, values) {
                return `${currentTime}`;
              },
            },
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: function (value, index, values) {
                return `${value} Feet`;
              },
            },
          },
        },
      },
    });

    dataChart.options.plugins = {
      annotation: false,
      datalabels: false,
      zoom: false,
    };
  }, []);

  return (
    <>
      <div className="flex justify-center px-5 py-3 ">
        <div className="w-2/4 h-2/4">
          <canvas ref={canvas} width={600} height={400}></canvas>
        </div>
      </div>

      {/* <h1>{currentLevel ? `${currentLevel[currentLevel.length - 1]}` : null}</h1> */}
    </>
  );
}

export default App;
