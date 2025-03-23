// src/components/SentimentChart.jsx
import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SentimentChart = ({ type = 'pie', data, title }) => {
  // Default colors for sentiment
  const colors = {
    positive: 'rgba(75, 192, 192, 0.6)',
    neutral: 'rgba(201, 203, 207, 0.6)',
    negative: 'rgba(255, 99, 132, 0.6)',
    borders: {
      positive: 'rgb(75, 192, 192)',
      neutral: 'rgb(201, 203, 207)',
      negative: 'rgb(255, 99, 132)',
    }
  };

  const prepareChartData = () => {
    if (type === 'pie') {
      return {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
          {
            data: [
              data.positive || 0,
              data.neutral || 0,
              data.negative || 0
            ],
            backgroundColor: [
              colors.positive,
              colors.neutral,
              colors.negative
            ],
            borderColor: [
              colors.borders.positive,
              colors.borders.neutral,
              colors.borders.negative
            ],
            borderWidth: 1,
          },
        ],
      };
    } else if (type === 'bar') {
      // For aspects or categories
      const labels = Object.keys(data);
      const values = Object.values(data);
      const backgroundColors = values.map(value => 
        value >= 70 ? colors.positive : 
        value >= 40 ? colors.neutral : 
        colors.negative
      );
      
      return {
        labels,
        datasets: [
          {
            label: 'Sentiment Score',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        max: 100,
      }
    } : undefined,
  };

  const chartData = prepareChartData();

  return (
    <div className="w-full h-full">
      {type === 'pie' ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default SentimentChart;