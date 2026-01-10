import React, { useState, useEffect } from 'react';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentMapNameState, setCurrentMapNameState] = useState<string>('china');
  const [currentLevel, setCurrentLevel] = useState<'country' | 'province' | 'district'>('country');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const chartRef = React.useRef<ReactECharts>(null);
  
  console.log('MarathonCharts 接收到的 events 数据：', safeEvents);
  console.log('events 长度：', safeEvents.length);
  console.log('所有赛事的配速信息：', safeEvents.map(e => ({
    name: e.event_name,
    pace: e.pace,
    paceType: typeof e.pace,
    paceLength: e.pace ? String(e.pace).length : 0
  })));

  // 省份代码映射
  const provinceCodeMap: Record<string, string> = {
    '北京': '110000', '天津': '120000', '上海': '310000', '重庆': '500000',
    '河北': '130000', '山西': '140000', '辽宁': '210000', '吉林': '220000', '黑龙江': '230000',
    '江苏': '320000', '浙江': '330000', '安徽': '340000', '福建': '350000', '江西': '360000', '山东': '370000',
    '河南': '410000', '湖北': '420000', '湖南': '430000', '广东': '440000', '广西': '450000', '海南': '460000',
    '四川': '510000', '贵州': '520000', '云南': '530000', '西藏': '540000', '陕西': '610000', '甘肃': '620000',
    '青海': '630000', '宁夏': '640000', '新疆': '650000', '内蒙古': '150000',
    '香港': '810000', '澳门': '820000', '台湾': '710000',
    '北京市': '110000', '天津市': '120000', '上海市': '310000', '重庆市': '500000',
    '河北省': '130000', '山西省': '140000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
    '江苏省': '320000', '浙江省': '330000', '安徽省': '340000', '福建省': '350000', '江西省': '360000', '山东省': '370000',
    '河南省': '410000', '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000', '海南省': '460000',
    '四川省': '510000', '贵州省': '520000', '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
    '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000', '内蒙古自治区': '150000',
    '香港特别行政区': '810000', '澳门特别行政区': '820000', '台湾省': '710000'
  };

  // 城市代码映射（部分主要城市示例，可根据需要扩展）
  const cityCodeMap: Record<string, string> = {
    '北京市': '110000', '天津市': '120000', '上海市': '310000', '重庆市': '500000',
    '杭州市': '330100', '宁波市': '330200', '温州市': '330300', '嘉兴市': '330400',
    '湖州市': '330500', '绍兴市': '330600', '金华市': '330700', '衢州市': '330800',
    '舟山市': '330900', '台州市': '331000', '丽水市': '331100',
    '北京市市辖区': '110100', '杭州市市辖区': '330100', '东城区': '110101',
    '西城区': '110102', '朝阳区': '110105', '丰台区': '110106', '石景山区': '110107',
    '海淀区': '110108', '门头沟区': '110109', '房山区': '110111', '通州区': '110112',
    '顺义区': '110113', '昌平区': '110114', '大兴区': '110115', '怀柔区': '110116',
    '平谷区': '110117', '密云区': '110118', '延庆区': '110119'
  };

  // 地图数据缓存
  const mapDataCache = React.useRef<Record<string, any>>({});

  // 加载地图
  useEffect(() => {
    const loadMap = async () => {
      try {
        setMapLoaded(false);
        const echartsModule = await import('echarts');
        const echarts = echartsModule.default || echartsModule;
        
        if (currentLevel === 'country') {
          // 加载中国地图
          // 先检查地图是否已注册
          try {
            const existingMap = echarts.getMap('china');
            if (existingMap) {
              setCurrentMapNameState('china');
              setMapLoaded(true);
              return;
            }
          } catch (e) {
            // 地图未注册，继续加载
          }
          
          // 检查缓存
          if (mapDataCache.current['china']) {
            console.log('从缓存加载中国地图');
            echarts.registerMap('china', mapDataCache.current['china']);
            setCurrentMapNameState('china');
            setMapLoaded(true);
            return;
          }
          
          const response = await fetch('/maps/china.json');
          if (!response.ok) {
            throw new Error('加载中国地图失败');
          }
          const chinaJson = await response.json();
          if (!chinaJson || !chinaJson.features) {
            throw new Error('地图数据格式不正确');
          }
          
          // 缓存地图数据
          mapDataCache.current['china'] = chinaJson;
          echarts.registerMap('china', chinaJson);
          
          // 验证注册是否成功
          try {
            const registeredMap = echarts.getMap('china');
            if (registeredMap && registeredMap.geoJson) {
              setCurrentMapNameState('china');
              setMapLoaded(true);
            } else {
              throw new Error('地图注册失败：地图数据不完整');
            }
          } catch (e) {
            console.error('验证地图注册失败:', e);
            throw new Error('地图注册失败');
          }
        } else if (currentLevel === 'province' && selectedProvince) {
          // 加载省份地图
          const code = provinceCodeMap[selectedProvince];
          console.log(`开始加载省份地图: ${selectedProvince}, 代码: ${code}`);
          
          if (!code) {
            console.error(`未找到省份代码: ${selectedProvince}`);
            console.log('可用的省份代码映射:', Object.keys(provinceCodeMap));
            setMapLoaded(false);
            return;
          }
          
          try {
            const mapName = `province_${code}`;
            
            // 先检查地图是否已注册
            try {
              const existingMap = echarts.getMap(mapName);
              if (existingMap && existingMap.geoJson) {
                console.log(`省份地图已注册: ${mapName}`);
                setCurrentMapNameState(mapName);
                setMapLoaded(true);
                return;
              }
            } catch (e) {
              // 地图未注册，继续加载
              console.log(`省份地图未注册，开始加载: ${mapName}`);
            }
            
            // 检查缓存
            if (mapDataCache.current[mapName]) {
              console.log(`从缓存加载省份地图: ${mapName}`);
              echarts.registerMap(mapName, mapDataCache.current[mapName]);
              setCurrentMapNameState(mapName);
              setMapLoaded(true);
              return;
            }
            
            console.log(`正在获取省份地图文件: /maps/${code}.json`);
            const response = await fetch(`/maps/${code}.json`);
            
            if (!response.ok) {
              console.error(`省份地图文件不存在或无法访问: ${code}.json, 状态: ${response.status}`);
              setMapLoaded(false);
              return;
            }
            
            const provinceJson = await response.json();
            if (!provinceJson || !provinceJson.features) {
              console.error('省份地图数据格式不正确:', provinceJson);
              setMapLoaded(false);
              return;
            }
            
            // 缓存地图数据
            mapDataCache.current[mapName] = provinceJson;
            console.log(`成功加载省份地图数据: ${mapName}, features数量: ${provinceJson.features.length}`);
            
            // 使用省份代码作为地图名称，避免名称冲突
            echarts.registerMap(mapName, provinceJson);
            
            // 验证注册是否成功
            try {
              const registeredMap = echarts.getMap(mapName);
              if (registeredMap && registeredMap.geoJson) {
                console.log(`省份地图注册成功: ${mapName}`);
                setCurrentMapNameState(mapName);
                setMapLoaded(true);
              } else {
                console.error('地图注册失败：地图数据不完整');
                setMapLoaded(false);
              }
            } catch (e) {
              console.error('验证地图注册失败:', e);
              setMapLoaded(false);
            }
          } catch (error) {
            console.error(`加载省份地图失败: ${selectedProvince}`, error);
            setMapLoaded(false);
          }
        } else if (currentLevel === 'district' && selectedProvince && selectedCity) {
          // 加载区县地图
          const city = selectedCity || selectedProvince; // 如果没有选择城市，使用省份作为城市
          const code = cityCodeMap[city] || provinceCodeMap[selectedProvince];
          console.log(`开始加载区县地图: ${city}, 代码: ${code}`);
          
          if (!code) {
            console.error(`未找到城市代码: ${city}`);
            console.log('可用的城市代码映射:', Object.keys(cityCodeMap));
            setMapLoaded(false);
            return;
          }
          
          try {
            const mapName = `district_${code}`;
            
            // 先检查地图是否已注册
            try {
              const existingMap = echarts.getMap(mapName);
              if (existingMap && existingMap.geoJson) {
                console.log(`区县地图已注册: ${mapName}`);
                setCurrentMapNameState(mapName);
                setMapLoaded(true);
                return;
              }
            } catch (e) {
              // 地图未注册，继续加载
              console.log(`区县地图未注册，开始加载: ${mapName}`);
            }
            
            // 检查缓存
            if (mapDataCache.current[mapName]) {
              console.log(`从缓存加载区县地图: ${mapName}`);
              echarts.registerMap(mapName, mapDataCache.current[mapName]);
              setCurrentMapNameState(mapName);
              setMapLoaded(true);
              return;
            }
            
            console.log(`正在获取区县地图文件: /maps/${code}.json`);
            const response = await fetch(`/maps/${code}.json`);
            
            if (!response.ok) {
              console.error(`区县地图文件不存在或无法访问: ${code}.json, 状态: ${response.status}`);
              setMapLoaded(false);
              return;
            }
            
            const districtJson = await response.json();
            if (!districtJson || !districtJson.features) {
              console.error('区县地图数据格式不正确:', districtJson);
              setMapLoaded(false);
              return;
            }
            
            // 缓存地图数据
            mapDataCache.current[mapName] = districtJson;
            console.log(`成功加载区县地图数据: ${mapName}, features数量: ${districtJson.features.length}`);
            
            // 使用城市代码作为地图名称，避免名称冲突
            echarts.registerMap(mapName, districtJson);
            
            // 验证注册是否成功
            try {
              const registeredMap = echarts.getMap(mapName);
              if (registeredMap && registeredMap.geoJson) {
                console.log(`区县地图注册成功: ${mapName}`);
                setCurrentMapNameState(mapName);
                setMapLoaded(true);
              } else {
                console.error('地图注册失败：地图数据不完整');
                setMapLoaded(false);
              }
            } catch (e) {
              console.error('验证地图注册失败:', e);
              setMapLoaded(false);
            }
          } catch (error) {
            console.error(`加载区县地图失败: ${city}`, error);
            setMapLoaded(false);
          }
        }
      } catch (error) {
        console.error('加载地图失败:', error);
        setMapLoaded(false);
      }
    };
    loadMap();
  }, [currentLevel, selectedProvince, selectedCity]);
  
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

  // 统计省份数据
  const getProvinceData = () => {
    const provinceCount: Record<string, number> = {};
    safeEvents.forEach(event => {
      if (event.province && event.province.trim()) {
        const province = event.province.trim();
        provinceCount[province] = (provinceCount[province] || 0) + 1;
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
      if (event.province === province && event.city && event.city.trim()) {
        const city = event.city.trim();
        cityCount[city] = (cityCount[city] || 0) + 1;
      }
    });
    return Object.keys(cityCount).map(name => ({
      name,
      value: cityCount[name]
    }));
  };

  // 统计区县数据（如果有区县数据的话）
  const getDistrictData = () => {
    const districtCount: Record<string, number> = {};
    safeEvents.forEach(event => {
      if (event.district && event.district.trim()) {
        const district = event.district.trim();
        districtCount[district] = (districtCount[district] || 0) + 1;
      }
    });
    return Object.keys(districtCount).map(name => ({
      name,
      value: districtCount[name]
    }));
  };

  const provinceData = getProvinceData();
  const districtData = getDistrictData();

  // 根据当前级别决定显示的数据
  let mapData: Array<{ name: string; value: number }> = [];

  if (currentLevel === 'country') {
    // 全国地图显示省份数据
    mapData = provinceData;
    console.log('全国地图，使用省份数据');
  } else if (currentLevel === 'province' && selectedProvince) {
    // 省份地图显示城市数据
    const cityData = getCityData(selectedProvince);
    mapData = cityData;
    console.log(`省份地图 ${selectedProvince}，使用城市数据：`, cityData);
  } else if (currentLevel === 'district' && selectedProvince && selectedCity) {
    // 区县地图显示当前省份和城市的区县数据
    const districtData = getDistrictData(selectedProvince, selectedCity);
    mapData = districtData;
    console.log(`区县地图 ${selectedCity}，使用区县数据：`, districtData);
  }

  // 获取地图配置
  const getMapOption = () => {
    if (!mapLoaded) {
      return {
        title: {
          text: '赛事地点分布',
          left: 'center'
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '地图加载中...',
            fontSize: 16,
            fill: '#666'
          }
        },
        series: []
      };
    }

    if (mapData.length === 0) {
      return {
        title: {
          text: currentLevel === 'country' ? '赛事地点分布（全国）' : `赛事地点分布（${selectedProvince}）`,
          left: 'center'
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无地点数据',
            fontSize: 16,
            fill: '#666'
          }
        },
        series: [{
          type: 'map',
          map: currentMapNameState,
          data: []
        }]
      };
    }

    const maxValue = Math.max(...mapData.map(d => d.value), 1);

    return {
      title: {
        text: currentLevel === 'country' ? '赛事地点分布（全国）' : `赛事地点分布（${selectedProvince}）`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.value > 0) {
            return `${params.name}<br/>赛事数量: ${params.value}`;
          }
          return `${params.name}<br/>暂无赛事`;
        }
      },
      visualMap: {
        min: 0,
        max: maxValue,
        left: 'left',
        top: 'bottom',
        text: ['多', '少'],
        calculable: true,
        inRange: {
          color: ['#E0E0E0', '#FFF59D', '#FFEB3B', '#FFC107', '#FF9800']
        }
      },
      series: [{
        name: '赛事地点',
        type: 'map',
        map: currentMapNameState,
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#F6C12C'
          }
        },
        itemStyle: {
          borderColor: '#999',
          borderWidth: 0.5
        },
        data: mapData
      }]
    };
  };

  // 处理地图点击事件
  const handleMapClick = (params: any) => {
    console.log('地图点击事件：', params);
    console.log('当前级别:', currentLevel, '选中省份:', selectedProvince, '选中城市:', selectedCity);
    
    if (currentLevel === 'country') {
      // 点击省份，进入省份地图
      if (params.value > 0) {
        const provinceName = params.name;
        console.log('点击省份:', provinceName, '省份代码:', provinceCodeMap[provinceName]);
        setSelectedProvince(provinceName);
        setCurrentLevel('province');
        // 重置地图加载状态，让 useEffect 重新加载省份地图
        setMapLoaded(false);
      }
    } else if (currentLevel === 'province') {
      // 点击省份名称区域，返回全国地图
      if (params.name === selectedProvince) {
        setCurrentLevel('country');
        setSelectedProvince('');
        setSelectedCity('');
        setMapLoaded(false);
      } else if (params.value > 0) {
        // 点击城市，进入区县地图
        const cityName = params.name;
        console.log('点击城市:', cityName, '城市代码:', cityCodeMap[cityName]);
        setSelectedCity(cityName);
        setCurrentLevel('district');
        setMapLoaded(false);
      }
    } else if (currentLevel === 'district') {
      // 点击区县地图，返回省份地图
      setCurrentLevel('province');
      setSelectedCity('');
      setMapLoaded(false);
    }
  };

  // 图表准备完成后的回调
  const onChartReady = (echarts: any) => {
    echarts.on('click', handleMapClick);
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
      <div style={{ height: '500px', marginTop: '20px' }}>
        {currentLevel !== 'country' && (
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            <button 
              onClick={() => {
                if (currentLevel === 'district') {
                  // 从区县级别返回省份级别
                  setCurrentLevel('province');
                  setSelectedCity('');
                } else if (currentLevel === 'province') {
                  // 从省份级别返回全国级别
                  setCurrentLevel('country');
                  setSelectedProvince('');
                  setSelectedCity('');
                }
                setMapLoaded(false);
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
              {currentLevel === 'district' ? '返回省份地图' : '返回全国地图'}
            </button>
          </div>
        )}
        {mapLoaded && currentMapNameState ? (
          <ReactECharts
            key={`${currentLevel}_${selectedProvince}_${selectedCity}_${currentMapNameState}_${mapLoaded}`}
            ref={chartRef}
            option={getMapOption()}
            style={{ height: '100%', width: '100%' }}
            onChartReady={onChartReady}
            notMerge={true}
            lazyUpdate={false}
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#666',
            fontSize: '16px'
          }}>
            <div>地图加载中...</div>
            {currentLevel === 'province' && selectedProvince && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                正在加载 {selectedProvince} 地图
              </div>
            )}
            {currentLevel === 'district' && selectedCity && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                正在加载 {selectedCity} 地图
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarathonCharts;