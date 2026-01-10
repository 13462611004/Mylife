import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { MarathonEvent } from '../../services/types';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler  // 注册Filler插件以支持fill选项
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

  // 地图状态管理
  const [currentLevel, setCurrentLevel] = useState<string>('country');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentMapName, setCurrentMapName] = useState<string>('china');
  const [hoverTooltip, setHoverTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    events: MarathonEvent[];
  }>({
    show: false,
    x: 0,
    y: 0,
    events: []
  });
  
  // 地图数据缓存
  const mapDataCache = useRef<Record<string, any>>({});
  
  // 省份代码映射
  const provinceCodeMap: Record<string, string> = {
    '北京市': '110000',
    '天津市': '120000',
    '河北省': '130000',
    '山西省': '140000',
    '内蒙古自治区': '150000',
    '辽宁省': '210000',
    '吉林省': '220000',
    '黑龙江省': '230000',
    '上海市': '310000',
    '江苏省': '320000',
    '浙江省': '330000',
    '安徽省': '340000',
    '福建省': '350000',
    '江西省': '360000',
    '山东省': '370000',
    '河南省': '410000',
    '湖北省': '420000',
    '湖南省': '430000',
    '广东省': '440000',
    '广西壮族自治区': '450000',
    '海南省': '460000',
    '重庆市': '500000',
    '四川省': '510000',
    '贵州省': '520000',
    '云南省': '530000',
    '西藏自治区': '540000',
    '陕西省': '610000',
    '甘肃省': '620000',
    '青海省': '630000',
    '宁夏回族自治区': '640000',
    '新疆维吾尔自治区': '650000',
    '台湾省': '710000',
    '香港特别行政区': '810000',
    '澳门特别行政区': '820000'
  };
  
  // 城市代码映射（部分主要城市）
  const cityCodeMap: Record<string, string> = {
    // 江苏省
    '南京市': '320100',
    '无锡市': '320200',
    '徐州市': '320300',
    '常州市': '320400',
    '苏州市': '320500',
    '南通市': '320600',
    '连云港市': '320700',
    '淮安市': '320800',
    '盐城市': '320900',
    '扬州市': '321000',
    '镇江市': '321100',
    '泰州市': '321200',
    '宿迁市': '321300',
    // 上海市
    '上海市': '310000',
    // 北京市
    '北京市': '110000',
    // 天津市
    '天津市': '120000',
    // 重庆市
    '重庆市': '500000',
    // 浙江省
    '杭州市': '330100',
    '宁波市': '330200',
    '温州市': '330300',
    // 广东省
    '广州市': '440100',
    '深圳市': '440300',
    '珠海市': '440400',
    // 山东省
    '济南市': '370100',
    '青岛市': '370200',
    // 河南省
    '郑州市': '410100',
    // 湖北省
    '武汉市': '420100',
    // 湖南省
    '长沙市': '430100',
    '株洲市': '430200',
    '湘潭市': '430300',
    '衡阳市': '430400',
    '邵阳市': '430500',
    '岳阳市': '430600',
    '常德市': '430700',
    '张家界市': '430800',
    '益阳市': '430900',
    '郴州市': '431000',
    '永州市': '431100',
    '怀化市': '431200',
    '娄底市': '431300',
    '湘西土家族苗族自治州': '433100',
    // 四川省
    '成都市': '510100',
    // 福建省
    '福州市': '350100',
    '厦门市': '350200',
    // 安徽省
    '合肥市': '340100',
    // 江西省
    '南昌市': '360100',
    // 辽宁省
    '沈阳市': '210100',
    '大连市': '210200',
    // 吉林省
    '长春市': '220100',
    // 黑龙江省
    '哈尔滨市': '230100',
    // 山西省
    '太原市': '140100',
    // 陕西省
    '西安市': '610100',
    // 甘肃省
    '兰州市': '620100',
    // 河北省
    '石家庄市': '130100',
    // 云南省
    '昆明市': '530100',
    // 贵州省
    '贵阳市': '520100',
    // 广西壮族自治区
    '南宁市': '450100',
    // 海南省
    '海口市': '460100',
    // 内蒙古自治区
    '呼和浩特市': '150100',
    // 宁夏回族自治区
    '银川市': '640100',
    // 青海省
    '西宁市': '630100',
    // 新疆维吾尔自治区
    '乌鲁木齐市': '650100',
    // 西藏自治区
    '拉萨市': '540100',
    '日喀则市': '540200',
    '昌都市': '540300',
    '林芝市': '540400',
    '那曲市': '540600',
    '阿里地区': '542500'
  };
  
  // 判断是否为直辖市
  const isMunicipality = (province: string): boolean => {
    return ['北京市', '天津市', '上海市', '重庆市'].includes(province);
  };

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

  // 数据处理函数
  // 统计省份数据
  const getProvinceData = () => {
    const provinceCount: Record<string, number> = {};
    safeEvents.forEach(event => {
      if (event.province) {
        provinceCount[event.province] = (provinceCount[event.province] || 0) + 1;
      }
    });
    return Object.keys(provinceCount).map(name => ({
      name,
      value: provinceCount[name]
    }));
  };

  // 统计指定省份的城市数据
  const getCityData = (province: string) => {
    const cityCount: Record<string, number> = {};
    safeEvents.forEach(event => {
      if (event.province === province && event.city) {
        cityCount[event.city] = (cityCount[event.city] || 0) + 1;
      }
    });
    return Object.keys(cityCount).map(name => ({
      name,
      value: cityCount[name]
    }));
  };

  // 统计指定省份和城市的区县数据
  const getDistrictData = (province: string, city: string) => {
    const districtCount: Record<string, number> = {};
    safeEvents.forEach(event => {
      if (event.province === province && event.city === city && event.district) {
        districtCount[event.district] = (districtCount[event.district] || 0) + 1;
      }
    });
    return Object.keys(districtCount).map(name => ({
      name,
      value: districtCount[name]
    }));
  };

  // 获取指定区域对应的所有赛事
  const getEventsByRegion = (regionName: string): MarathonEvent[] => {
    if (currentLevel === 'country') {
      return safeEvents.filter(event => event.province === regionName);
    } else if (currentLevel === 'province' && selectedProvince) {
      return safeEvents.filter(event => event.province === selectedProvince && event.city === regionName);
    } else if (currentLevel === 'city' && selectedProvince && selectedCity) {
      return safeEvents.filter(event => event.province === selectedProvince && event.city === selectedCity && event.district === regionName);
    }
    return [];
  };

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

  // 地图加载和注册逻辑
  useEffect(() => {
    const loadMap = async () => {
      try {
        setMapLoaded(false);
        let geoJson: any = null;
        let mapName = '';
        
        if (currentLevel === 'country') {
          // 加载中国地图
          const response = await fetch('/maps/china.json');
          if (!response.ok) {
            throw new Error('加载中国地图失败');
          }
          geoJson = await response.json();
          mapName = 'china';
        } else if (currentLevel === 'province' && selectedProvince) {
          // 加载省份地图
          const provinceCode = provinceCodeMap[selectedProvince];
          if (!provinceCode) {
            throw new Error(`未找到省份代码: ${selectedProvince}`);
          }
          const response = await fetch(`/maps/${provinceCode}_full.json`);
          if (!response.ok) {
            throw new Error(`加载省份地图失败: ${selectedProvince}`);
          }
          geoJson = await response.json();
          mapName = provinceCode;
        } else if (currentLevel === 'city' && selectedProvince && selectedCity) {
          // 加载城市地图
          const cityCode = cityCodeMap[selectedCity];
          if (!cityCode) {
            throw new Error(`未找到城市代码: ${selectedCity}`);
          }
          const response = await fetch(`/maps/${cityCode}_full.json`);
          if (!response.ok) {
            throw new Error(`加载城市地图失败: ${selectedCity}`);
          }
          geoJson = await response.json();
          mapName = cityCode;
        }
        
        console.log('加载的原始GeoJSON数据:', geoJson);
        
        // 使用echarts.registerMap注册地图数据
        if (geoJson) {
          echarts.registerMap(mapName, geoJson);
          console.log('地图已注册:', mapName);
        } else {
          console.error('GeoJSON数据为空');
        }
        
        setCurrentMapName(mapName);
        setMapLoaded(true);
      } catch (error) {
        console.error('加载地图失败:', error);
        setMapLoaded(false);
      }
    };

    loadMap();
  }, [currentLevel, selectedProvince, selectedCity]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // 地图配置选项函数
  const getMapOption = () => {
    // 根据当前级别获取对应的数据
    let mapData: Array<{ name: string; value: number }> = [];
    let mapTitle = '中国马拉松赛事分布';
    
    if (currentLevel === 'country') {
      // 全国地图显示省份数据
      mapData = getProvinceData();
      mapTitle = '中国马拉松赛事分布';
    } else if (currentLevel === 'province' && selectedProvince) {
      // 省份地图显示城市数据
      mapData = getCityData(selectedProvince);
      mapTitle = `${selectedProvince}马拉松赛事分布`;
    } else if (currentLevel === 'city' && selectedProvince && selectedCity) {
      // 城市地图显示区县数据
      mapData = getDistrictData(selectedProvince, selectedCity);
      mapTitle = `${selectedCity}马拉松赛事分布`;
    }

    // 使用registerMap注册的地图，直接使用map名称
    return {
      title: {
        text: mapTitle,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        show: false, // 禁用默认tooltip，使用自定义悬浮提示
        formatter: (params: any) => {
          if (params.value > 0) {
            return `${params.name}<br/>赛事数量: ${params.value}`;
          }
          return `${params.name}<br/>暂无赛事`;
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...mapData.map(d => d.value), 1),
        left: 'left',
        top: 'bottom',
        text: ['多', '少'],
        calculable: true,
        inRange: {
          color: ['#E0E0E0', '#FFF59D', '#FFEB3B', '#FFC107', '#FF9800']
        }
      },
      series: [{
        name: '赛事数量',
        type: 'map',
        map: currentMapName,
        data: mapData,
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12
          },
          itemStyle: {
            areaColor: '#F6C12C'
          }
        },
        itemStyle: {
          borderColor: '#999',
          borderWidth: 0.5
        }
      }]
    };
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

  // 地图点击事件处理
  const handleMapClick = (params: any) => {
    console.log('地图点击事件：', params);
    console.log('当前级别:', currentLevel, '选中省份:', selectedProvince, '选中城市:', selectedCity);
    
    if (currentLevel === 'country') {
      // 点击省份，进入省份地图
      const clickedProvince = params.name;
      setSelectedProvince(clickedProvince);
      
      // 直辖市特殊处理：直接进入城市级别
      if (isMunicipality(clickedProvince)) {
        setSelectedCity(clickedProvince);
        setCurrentLevel('city');
      } else {
        setCurrentLevel('province');
      }
    } else if (currentLevel === 'province' && selectedProvince) {
      // 点击省份名称，返回全国地图
      if (params.name === selectedProvince) {
        setCurrentLevel('country');
        setSelectedProvince('');
        setSelectedCity('');
      } else {
        // 点击城市，进入城市地图
        setSelectedCity(params.name);
        setCurrentLevel('city');
      }
    } else if (currentLevel === 'city' && selectedProvince && selectedCity) {
      // 点击城市名称，返回上一级
      if (isMunicipality(selectedProvince)) {
        // 直辖市返回全国地图
        setCurrentLevel('country');
        setSelectedProvince('');
        setSelectedCity('');
      } else {
        // 其他城市返回省份地图
        setCurrentLevel('province');
        setSelectedCity('');
      }
    }
  };

  // 地图鼠标悬停事件处理
  const handleMapMouseover = (params: any) => {
    console.log('地图悬停事件：', params);
    const regionName = params.name;
    const events = getEventsByRegion(regionName);
    
    if (events.length > 0) {
      setHoverTooltip({
        show: true,
        x: params.event?.clientX || 0,
        y: params.event?.clientY || 0,
        events: events
      });
    }
  };

  // 地图鼠标移动事件处理
  const handleMapMousemove = (params: any) => {
    if (hoverTooltip.show && params.event) {
      setHoverTooltip(prev => ({
        ...prev,
        x: params.event.clientX,
        y: params.event.clientY
      }));
    }
  };

  // 地图鼠标离开事件处理
  const handleMapMouseout = () => {
    setHoverTooltip({
      show: false,
      x: 0,
      y: 0,
      events: []
    });
  };

  // 导航机制实现
  const renderNavigation = () => {
    return (
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        {currentLevel !== 'country' && (
          <button 
            onClick={() => {
              setMapLoaded(false);
              if (currentLevel === 'city') {
                if (isMunicipality(selectedProvince)) {
                  // 直辖市从城市级别直接返回全国
                  setCurrentLevel('country');
                  setSelectedProvince('');
                  setSelectedCity('');
                } else {
                  // 其他城市返回省份级别
                  setCurrentLevel('province');
                  setSelectedCity('');
                }
              } else if (currentLevel === 'province') {
                // 从省份级别返回全国
                setCurrentLevel('country');
                setSelectedProvince('');
                setSelectedCity('');
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#B22A2A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isMunicipality(selectedProvince) && currentLevel === 'city' ? '返回全国地图' : '返回上一级'}
          </button>
        )}
      </div>
    );
  };

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
      
      {/* 地图展示区域 */}
      <div style={{ height: '500px', marginTop: '20px', position: 'relative' }}>
        {renderNavigation()}
        {mapLoaded ? (
          <ReactECharts
            key={`${currentLevel}_${selectedProvince}_${selectedCity}`}
            option={getMapOption()}
            style={{ height: '100%', width: '100%' }}
            onChartReady={(echartsInstance: any) => {
              echartsInstance.on('click', handleMapClick);
              echartsInstance.on('mouseover', handleMapMouseover);
              echartsInstance.on('mousemove', handleMapMousemove);
              echartsInstance.on('mouseout', handleMapMouseout);
            }}
            notMerge={true}
            lazyUpdate={false}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f5f5f5' }}>
            <p style={{ color: '#666' }}>地图加载中...</p>
          </div>
        )}
        
        {/* 自定义悬浮提示框 */}
        {hoverTooltip.show && (
          <div
            style={{
              position: 'fixed',
              left: `${hoverTooltip.x + 10}px`,
              top: `${hoverTooltip.y + 10}px`,
              backgroundColor: 'rgba(255,255,255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              maxWidth: '300px',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#B22A2A' }}>
              {hoverTooltip.events.length > 0 ? `${hoverTooltip.events[0].province || hoverTooltip.events[0].city || hoverTooltip.events[0].district}的赛事` : '暂无赛事'}
            </div>
            {currentLevel === 'country' ? (
              <div style={{ fontSize: '12px', color: '#333' }}>
                参赛数量：{hoverTooltip.events.length}
              </div>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {hoverTooltip.events.map((event, index) => (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '4px', color: '#333' }}>
                    • {event.event_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarathonCharts;