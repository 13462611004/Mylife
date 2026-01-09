import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Modal, List } from 'antd';
import { MarathonEvent } from '../../services/types';

interface LocationMapProps {
  events: MarathonEvent[] | unknown;
}

const LocationMap: React.FC<LocationMapProps> = ({ events }) => {
  // 防御性处理，统一为数组，避免对非数组调用 forEach / map 导致 "events is not iterable"
  const safeEvents: MarathonEvent[] = Array.isArray(events) ? events as MarathonEvent[] : [];
  const [currentLevel, setCurrentLevel] = useState<'country' | 'province'>('country');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const chartRef = useRef<ReactECharts>(null);
  
  // 新增：弹窗显示比赛列表
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedRegionEvents, setSelectedRegionEvents] = useState<MarathonEvent[]>([]);

  // 所有省份的标准化名称列表（与数据库中的格式一致）
  const allProvinces = [
    '北京', '天津', '上海', '重庆',
    '河北', '山西', '辽宁', '吉林', '黑龙江',
    '江苏', '浙江', '安徽', '福建', '江西', '山东',
    '河南', '湖北', '湖南', '广东', '广西', '海南',
    '四川', '贵州', '云南', '西藏', '陕西', '甘肃',
    '青海', '宁夏', '新疆', '内蒙古',
    '香港', '澳门', '台湾'
  ];

  // 注意：数据库中的省份、城市、区县名称已经是标准化格式（地图需要的格式）
  // 因此不需要再进行转换，直接使用即可

  const getProvinceData = () => {
    const provinceCount: Record<string, number> = {};
    
    console.log('原始赛事数据：', safeEvents);
    
    // 数据库中的省份名称已经是标准化格式，直接使用
    safeEvents.forEach(event => {
      const province = event.province || '未知';
      if (province !== '未知') {
        provinceCount[province] = (provinceCount[province] || 0) + 1;
        console.log(`省份 ${province}，当前计数：${provinceCount[province]}`);
      }
    });

    // 创建省份数据（allProvinces 已经是标准化格式，直接使用）
    const result = allProvinces.map(province => ({
      name: province, // 地图数据使用标准化名称
      value: provinceCount[province] || 0
    }));
    
    console.log('最终省份数据：', result);
    const provincesWithData = result.filter(p => p.value > 0);
    console.log('有数据的省份：', provincesWithData);
    console.log('有数据省份的详细信息（JSON）：', JSON.stringify(provincesWithData.map(p => ({ name: p.name, value: p.value }))));
    console.log('所有省份名称：', result.map(p => p.name));
    return result;
  };

  // 计算选中省份的城市数据
  const getCityData = (province: string) => {
    const cityCount: Record<string, number> = {};
    
    // 数据库中的省份和城市名称已经是标准化格式，直接使用
    safeEvents.forEach(event => {
      // 直接匹配省份名称（已经是标准化格式）
      if (event.province === province && event.city) {
        // 城市名称也已经是标准化格式（不带"市"等后缀）
        cityCount[event.city] = (cityCount[event.city] || 0) + 1;
      }
    });

    const result = Object.keys(cityCount).map(city => ({
      name: city, // 数据库中的城市名称已经是标准化格式
      value: cityCount[city]
    }));
    
    console.log('城市数据生成（JSON）：', JSON.stringify(result));
    console.log('省份名称：', province);
    return result;
  };

  // 判断是否为直辖市（数据库中的名称已经是标准化格式）
  const isMunicipality = (province: string) => {
    // 数据库中的省份名称已经是标准化格式（如"北京"而不是"北京市"）
    const municipalities = ['北京', '天津', '上海', '重庆'];
    return municipalities.includes(province);
  };

  // 获取直辖市的区县数据
  const getDistrictData = (province: string) => {
    // 对于直辖市，地图显示的是区县级别
    // 数据库中的省份和区县名称已经是标准化格式，直接使用
    const districtCount: Record<string, number> = {};
    
    safeEvents.forEach(event => {
      // 直接匹配省份名称（已经是标准化格式）
      // 只统计该省的赛事，并且有区县数据的
      if (event.province === province && event.district) {
        // 区县名称也已经是标准化格式（不带"区"、"县"等后缀）
        districtCount[event.district] = (districtCount[event.district] || 0) + 1;
      }
    });

    // 转换为ECharts需要的格式
    const result = Object.keys(districtCount).map(district => ({
      name: district, // 数据库中的区县名称已经是标准化格式
      value: districtCount[district]
    }));
    
    console.log('直辖市区县数据生成（JSON）：', JSON.stringify(result));
    console.log('省份名称：', province);
    return result;
  };

  // 获取地图配置
  const getChartOption = () => {
    // 如果地图数据还没加载完成，返回一个基本的配置，不包含 map 系列
    if (!mapLoaded) {
      console.log('地图数据未加载完成，返回基本配置');
      return {
        title: {
          text: '地图数据加载中...',
          left: 'center',
          textStyle: { fontSize: 16 }
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '正在加载地图数据...',
            fontSize: 16,
            fill: '#666'
          }
        }
      };
    }

    const provinceData = getProvinceData();
    
    // 根据是否为直辖市选择不同的数据
    let displayData: Array<{ name: string; value: number }>;
    if (currentLevel === 'province' && isMunicipality(selectedProvince)) {
      // 对于直辖市，使用区县数据（但我们的数据是城市级别，所以需要特殊处理）
      displayData = getDistrictData(selectedProvince);
    } else if (currentLevel === 'province') {
      // 对于普通省份，使用城市数据
      displayData = getCityData(selectedProvince);
    } else {
      displayData = [];
    }
    
    console.log('生成地图配置...');
    console.log('省份数据：', provinceData);
    console.log('省份数据（JSON）：', JSON.stringify(provinceData));
    console.log('显示数据：', displayData);
    console.log('显示数据（JSON）：', JSON.stringify(displayData));
    console.log('当前级别：', currentLevel);
    console.log('选中省份：', selectedProvince);
    console.log('是否为直辖市：', isMunicipality(selectedProvince));

    const option = {
      title: {
        text: currentLevel === 'country' ? '赛事地点分布（全国）' : `赛事地点分布（${selectedProvince}）`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          console.log('Tooltip触发，params：', params);
          console.log('Tooltip参数详情：', {
            name: params.name,
            value: params.value,
            dataType: typeof params.value
          });
          if (params.value > 0) {
            return `${params.name}<br/>参赛次数: ${params.value}`;
          }
          return `${params.name}<br/>未参赛`;
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...provinceData.map(d => d.value), 1),
        left: 'left',
        top: 'bottom',
        text: ['多', '少'],
        calculable: true,
        inRange: {
          // 颜色渐变：灰色（0）→ 浅黄 → 亮黄（多），营造"点亮"效果
          color: ['#E0E0E0', '#FFF59D', '#FFEB3B', '#FFC107', '#FF9800']
        },
        show: true
      },
      series: [
        {
          name: '赛事地点',
          type: 'map',
          map: currentLevel === 'country' ? 'china' : (selectedProvince || 'china'),
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
          data: currentLevel === 'country' ? provinceData : displayData
        }
      ]
    };
    
    console.log('地图配置生成完成：', option);
    return option;
  };

  // 获取某个地区的所有比赛
  const getEventsByRegion = (regionName: string): MarathonEvent[] => {
    if (currentLevel === 'country') {
      // 全国地图级别：按省份筛选（数据库中的名称已经是标准化格式）
      return safeEvents.filter(event => event.province === regionName);
    } else if (currentLevel === 'province') {
      // 省级地图级别：按城市或区县筛选
      if (isMunicipality(selectedProvince)) {
        // 直辖市：按区县筛选（数据库中的名称已经是标准化格式）
        return safeEvents.filter(event => 
          event.province === selectedProvince && event.district === regionName
        );
      } else {
        // 普通省份：按城市筛选（数据库中的名称已经是标准化格式）
        return safeEvents.filter(event => 
          event.province === selectedProvince && event.city === regionName
        );
      }
    }
    return [];
  };

  // 处理地图点击事件
  const handleChartClick = (params: any) => {
    console.log('地图点击事件：', params);
    
    if (currentLevel === 'country') {
      if (params.value > 0) {
        // 点击省份，进入省级地图
        console.log('点击省份，准备加载省级地图：', params.name);
        setMapLoaded(false); // 先设置为 false，防止地图在数据加载前渲染
        setSelectedProvince(params.name);
        setCurrentLevel('province');
      } else {
        // 点击没有数据的省份，显示弹窗
        const regionEvents = getEventsByRegion(params.name);
        if (regionEvents.length > 0) {
          setSelectedRegion(params.name);
          setSelectedRegionEvents(regionEvents);
          setIsModalVisible(true);
        }
      }
    } else if (currentLevel === 'province') {
      // 省级地图级别
      if (params.name === selectedProvince) {
        // 点击省份名称，返回全国地图
        console.log('点击返回全国地图');
        setMapLoaded(false);
        setCurrentLevel('country');
        setSelectedProvince('');
      } else {
        // 点击城市或区县，显示该地区的比赛列表
        const regionEvents = getEventsByRegion(params.name);
        if (regionEvents.length > 0) {
          setSelectedRegion(params.name);
          setSelectedRegionEvents(regionEvents);
          setIsModalVisible(true);
        }
      }
    }
  };

  // 处理图表事件
  const onChartReady = (echarts: any) => {
    echarts.on('click', handleChartClick);
  };

  // 加载地图数据
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setMapLoaded(false); // 开始加载时设置为 false
        console.log('开始加载地图数据，当前级别：', currentLevel, '选中省份：', selectedProvince);
        const echartsModule = await import('echarts');
        // echarts模块的导入方式：直接使用模块本身，不需要default
        const echarts = echartsModule;
        
        if (currentLevel === 'country') {
          // 加载中国地图数据
          console.log('加载中国地图数据...');
          try {
          const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          const chinaJson = await response.json();
            if (!chinaJson || !chinaJson.features) {
              throw new Error('地图数据格式不正确');
            }
          console.log('中国地图数据加载完成：', chinaJson);
          echarts.registerMap('china', chinaJson);
            setMapLoaded(true); // 只有成功注册后才设置为 true
          console.log('中国地图注册完成，mapLoaded 设置为 true');
          } catch (fetchError) {
            console.error('加载中国地图数据失败:', fetchError);
            // 加载失败时不设置 mapLoaded = true，保持 false，显示加载中的提示
            setMapLoaded(false);
          }
        } else if (selectedProvince) {
          // 加载省份地图数据
          // 省份代码映射：支持标准化后的名称（如"北京"、"广西"）和完整名称（如"北京市"、"广西壮族自治区"）
          const provinceCode: Record<string, string> = {
            // 标准化名称（地图数据中使用的名称）
            '北京': '110000', '天津': '120000', '上海': '310000', '重庆': '500000',
            '河北': '130000', '山西': '140000', '辽宁': '210000', '吉林': '220000', '黑龙江': '230000',
            '江苏': '320000', '浙江': '330000', '安徽': '340000', '福建': '350000', '江西': '360000', '山东': '370000',
            '河南': '410000', '湖北': '420000', '湖南': '430000', '广东': '440000', '广西': '450000', '海南': '460000',
            '四川': '510000', '贵州': '520000', '云南': '530000', '西藏': '540000', '陕西': '610000', '甘肃': '620000',
            '青海': '630000', '宁夏': '640000', '新疆': '650000', '内蒙古': '150000',
            '香港': '810000', '澳门': '820000', '台湾': '710000',
            // 完整名称（数据库中的名称，用于兼容）
            '北京市': '110000', '天津市': '120000', '上海市': '310000', '重庆市': '500000',
            '河北省': '130000', '山西省': '140000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
            '江苏省': '320000', '浙江省': '330000', '安徽省': '340000', '福建省': '350000', '江西省': '360000', '山东省': '370000',
            '河南省': '410000', '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000', '海南省': '460000',
            '四川省': '510000', '贵州省': '520000', '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
            '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000', '内蒙古自治区': '150000',
            '香港特别行政区': '810000', '澳门特别行政区': '820000', '台湾省': '710000'
          };
          
          const code = provinceCode[selectedProvince];
          if (code) {
            console.log(`加载省份地图数据，省份：${selectedProvince}，代码：${code}`);
            try {
            const response = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            const provinceJson = await response.json();
              if (!provinceJson || !provinceJson.features) {
                throw new Error('地图数据格式不正确');
              }
            console.log('省份地图数据加载完成');
            console.log('地图中的所有区域名称：', provinceJson.features.map((f: any) => f.properties.name));
            echarts.registerMap(selectedProvince, provinceJson);
              setMapLoaded(true); // 只有成功注册后才设置为 true
            console.log('省份地图注册完成，mapLoaded 设置为 true');
            } catch (fetchError) {
              console.error('加载省份地图数据失败:', fetchError);
              // 加载失败时不设置 mapLoaded = true，保持 false，显示加载中的提示
              setMapLoaded(false);
            }
          } else {
            // 如果没有找到省份代码，不设置 mapLoaded = true
            console.warn(`未找到省份代码: ${selectedProvince}`);
            setMapLoaded(false);
          }
        } else {
          // 如果没有选中省份，尝试加载全国地图
          try {
            const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const chinaJson = await response.json();
            if (!chinaJson || !chinaJson.features) {
              throw new Error('地图数据格式不正确');
            }
            echarts.registerMap('china', chinaJson);
            setMapLoaded(true);
          } catch (error) {
            console.error('加载默认地图数据失败:', error);
            setMapLoaded(false);
          }
        }
      } catch (error) {
        console.error('加载地图数据失败:', error);
        // 加载失败时不设置 mapLoaded = true，保持 false，显示加载中的提示
        setMapLoaded(false);
      }
    };

    loadMapData();
  }, [currentLevel, selectedProvince]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        {currentLevel === 'province' && (
          <button 
            onClick={() => {
              setCurrentLevel('country');
              setSelectedProvince('');
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
            返回全国地图
          </button>
        )}
      </div>
      {/* 只有在地图数据加载完成后才渲染地图 */}
      {mapLoaded ? (
        <ReactECharts
          ref={chartRef}
          option={getChartOption()}
          style={{ height: '100%', width: '100%' }}
          onChartReady={onChartReady}
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '14px'
        }}>
          <div>地图数据加载中...</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
            如果长时间未加载，请检查网络连接或刷新页面
          </div>
        </div>
      )}
      
      {/* 弹窗显示比赛列表 */}
      <Modal
        title={`${selectedRegion} 的比赛列表`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={selectedRegionEvents}
          renderItem={(event) => (
            <List.Item>
              <List.Item.Meta
                title={event.event_name}
                description={`${event.event_date} · ${event.event_type === '5km' ? '5KM' : 
                  event.event_type === '10km' ? '10KM' :
                  event.event_type === '15km' ? '15KM' :
                  event.event_type === 'half' ? '半程马拉松' : 
                  event.event_type === 'full' ? '全程马拉松' : event.event_type}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default LocationMap;
