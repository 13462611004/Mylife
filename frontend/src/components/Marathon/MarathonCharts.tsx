import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MarathonEvent } from '../../services/types';
import LocationMap from './LocationMap';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MarathonChartsProps {
  events: MarathonEvent[] | unknown;
}

const MarathonCharts: React.FC<MarathonChartsProps> = ({ events }) => {
  // 防御性处理，确保后续逻辑中使用的一定是数组
  const safeEvents: MarathonEvent[] = Array.isArray(events) ? events as MarathonEvent[] : [];
  console.log('MarathonCharts 接收到的 events 数据：', safeEvents);
  console.log('events 长度：', safeEvents.length);
  
  // 处理配速，将其转换为分钟数用于图表
  // 配速格式：mm:ss 或 m:ss（例如：05:30 表示每公里5分30秒）
  const convertPaceToMinutes = (pace: string): number => {
    const parts = pace.split(':');
    if (parts.length === 2) {
      const [minutes, seconds] = parts.map(Number);
      return minutes + seconds / 60;
    }
    return 0;
  };

  // 按日期排序，只取最近10场比赛
  const recentEvents = safeEvents
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(-10); // 取最后10个（最近的10场）

  // 准备折线图数据 - 配速趋势
  const lineChartData = {
    labels: recentEvents.map(event => event.event_name),
    datasets: [
      {
        label: '平均配速 (分钟/公里)',
        data: recentEvents.map(event => convertPaceToMinutes(event.pace)),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // 折线图配置
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '马拉松配速趋势（最近10场）',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '平均配速 (分钟/公里)',
        },
      },
    },
  };

  return (
    <div className="marathon-charts">
      <div style={{ height: '300px', marginBottom: '20px' }}>
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
      <div style={{ height: '500px' }}>
        <LocationMap events={safeEvents} />
      </div>
    </div>
  );
};

export default MarathonCharts;