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
  console.log('所有赛事的配速信息：', safeEvents.map(e => ({
    name: e.event_name,
    pace: e.pace,
    paceType: typeof e.pace,
    paceLength: e.pace ? String(e.pace).length : 0
  })));
  
  // 处理配速，将其转换为分钟数用于图表
  // 配速格式：mm:ss 或 m:ss（例如：05:30 表示每公里5分30秒）
  const convertPaceToMinutes = (pace: string | null | undefined): number | null => {
    if (!pace || typeof pace !== 'string') {
      return null;
    }
    const trimmedPace = pace.trim();
    if (trimmedPace === '' || trimmedPace === '0:00' || trimmedPace === '00:00') {
      return null;
    }
    const parts = trimmedPace.split(':');
    if (parts.length === 2) {
      const minutes = Number(parts[0]);
      const seconds = Number(parts[1]);
      if (isNaN(minutes) || isNaN(seconds)) {
        return null;
      }
      return minutes + seconds / 60;
    }
    return null;
  };

  // 按日期排序，只取最近10场比赛（包含配速数据的）
  const recentEvents = safeEvents
    .filter(event => {
      const paceMinutes = convertPaceToMinutes(event.pace);
      return paceMinutes !== null && paceMinutes > 0;
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(-10); // 取最后10个（最近的10场）

  console.log('过滤后的有配速数据的赛事数量：', recentEvents.length);
  console.log('有配速数据的赛事详情：', recentEvents.map(e => ({
    name: e.event_name,
    date: e.event_date,
    pace: e.pace
  })));

  // 准备折线图数据 - 配速趋势
  const lineChartData = {
    labels: recentEvents.map(event => {
      // 如果赛事名称太长，截断并添加省略号
      const name = event.event_name || '未知赛事';
      return name.length > 15 ? name.substring(0, 15) + '...' : name;
    }),
    datasets: [
      {
        label: '平均配速 (分钟/公里)',
        data: recentEvents.map(event => {
          const paceMinutes = convertPaceToMinutes(event.pace);
          return paceMinutes !== null ? paceMinutes : 0;
        }),
        borderColor: 'rgba(178, 42, 42, 1)', // 使用主题色 B22A2A
        backgroundColor: 'rgba(178, 42, 42, 0.1)',
        pointBackgroundColor: 'rgba(178, 42, 42, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  console.log('折线图数据：', lineChartData);

  // 折线图配置
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      title: {
        display: true,
        text: '马拉松配速趋势（最近10场）',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const minutes = Math.floor(value);
            const seconds = Math.round((value - minutes) * 60);
            const paceStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            return `配速: ${paceStr} 分钟/公里`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '平均配速 (分钟/公里)',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          callback: function(value: any) {
            const minutes = Math.floor(value);
            const seconds = Math.round((value - minutes) * 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // 如果没有数据，显示提示
  if (safeEvents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>暂无赛事数据</p>
      </div>
    );
  }

  // 检查是否有配速数据
  const hasPaceData = recentEvents.length > 0 && lineChartData.datasets[0].data.length > 0;
  console.log('是否有配速数据：', hasPaceData);
  console.log('recentEvents 数量：', recentEvents.length);
  console.log('lineChartData.datasets[0].data 长度：', lineChartData.datasets[0].data.length);
  console.log('lineChartData.datasets[0].data 内容：', lineChartData.datasets[0].data);

  return (
    <div className="marathon-charts">
      {hasPaceData ? (
      <div style={{ height: '300px', marginBottom: '20px' }}>
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          marginBottom: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '1px dashed #d9d9d9'
        }}>
          <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
            暂无配速数据，无法显示趋势图
          </p>
          <p style={{ color: '#999', fontSize: '12px', marginTop: '8px', margin: 0 }}>
            请确保赛事记录中包含配速信息（格式：mm:ss，如 05:30）
          </p>
        </div>
      )}
      <div style={{ height: '500px' }}>
        <LocationMap events={safeEvents} />
      </div>
    </div>
  );
};

export default MarathonCharts;