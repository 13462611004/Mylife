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
  
  // 城市代码映射
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
    '嘉兴市': '330400',
    '湖州市': '330500',
    '绍兴市': '330600',
    '金华市': '330700',
    '衢州市': '330800',
    '舟山市': '330900',
    '台州市': '331000',
    '丽水市': '331100',
    // 广东省
    '广州市': '440100',
    '深圳市': '440300',
    '珠海市': '440400',
    '东莞市': '441900',
    '佛山市': '440600',
    '中山市': '442000',
    '汕头市': '440500',
    '江门市': '440700',
    '湛江市': '440800',
    '茂名市': '440900',
    '肇庆市': '441200',
    '惠州市': '441300',
    '梅州市': '441400',
    '汕尾市': '441500',
    '河源市': '441600',
    '阳江市': '441700',
    '清远市': '441800',
    '韶关市': '440200',
    '揭阳市': '445200',
    '潮州市': '445100',
    '云浮市': '445300',
    // 山东省
    '济南市': '370100',
    '青岛市': '370200',
    '烟台市': '370600',
    '潍坊市': '370700',
    '威海市': '371000',
    '淄博市': '370300',
    '临沂市': '371300',
    '济宁市': '370800',
    '泰安市': '370900',
    '德州市': '371400',
    '聊城市': '371500',
    '滨州市': '371600',
    '菏泽市': '371700',
    '枣庄市': '370400',
    '东营市': '370500',
    '日照市': '371100',
    // 河南省
    '郑州市': '410100',
    '开封市': '410200',
    '洛阳市': '410300',
    '平顶山市': '410400',
    '安阳市': '410500',
    '鹤壁市': '410600',
    '新乡市': '410700',
    '焦作市': '410800',
    '许昌市': '411000',
    '漯河市': '411100',
    '三门峡市': '411200',
    '南阳市': '411300',
    '商丘市': '411400',
    '信阳市': '411500',
    '周口市': '411600',
    '驻马店市': '411700',
    '济源市': '419001',
    // 湖北省
    '武汉市': '420100',
    '黄石市': '420200',
    '十堰市': '420300',
    '宜昌市': '420500',
    '襄阳市': '420600',
    '鄂州市': '420700',
    '荆门市': '420800',
    '孝感市': '420900',
    '荆州市': '421000',
    '黄冈市': '421100',
    '咸宁市': '421200',
    '随州市': '421300',
    '恩施土家族苗族自治州': '422800',
    '仙桃市': '429004',
    '潜江市': '429005',
    '天门市': '429006',
    '神农架林区': '429021',
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
    '自贡市': '510300',
    '攀枝花市': '510400',
    '泸州市': '510500',
    '德阳市': '510600',
    '绵阳市': '510700',
    '广元市': '510800',
    '遂宁市': '510900',
    '内江市': '511000',
    '乐山市': '511100',
    '南充市': '511300',
    '眉山市': '511400',
    '宜宾市': '511500',
    '广安市': '511600',
    '达州市': '511700',
    '雅安市': '511800',
    '巴中市': '511900',
    '资阳市': '512000',
    '阿坝藏族羌族自治州': '513200',
    '甘孜藏族自治州': '513300',
    '凉山彝族自治州': '513400',
    // 福建省
    '福州市': '350100',
    '厦门市': '350200',
    '泉州市': '350500',
    '漳州市': '350600',
    '莆田市': '350300',
    '宁德市': '350900',
    '三明市': '350400',
    '南平市': '350700',
    '龙岩市': '350800',
    // 安徽省
    '合肥市': '340100',
    '芜湖市': '340200',
    '蚌埠市': '340300',
    '淮南市': '340400',
    '马鞍山市': '340500',
    '淮北市': '340600',
    '铜陵市': '340700',
    '安庆市': '340800',
    '黄山市': '341000',
    '滁州市': '341100',
    '阜阳市': '341200',
    '宿州市': '341300',
    '六安市': '341500',
    '亳州市': '341600',
    '池州市': '341700',
    '宣城市': '341800',
    // 江西省
    '南昌市': '360100',
    '景德镇市': '360200',
    '萍乡市': '360300',
    '九江市': '360400',
    '新余市': '360500',
    '鹰潭市': '360600',
    '赣州市': '360700',
    '吉安市': '360800',
    '宜春市': '360900',
    '抚州市': '361000',
    '上饶市': '361100',
    // 辽宁省
    '沈阳市': '210100',
    '大连市': '210200',
    '鞍山市': '210300',
    '抚顺市': '210400',
    '本溪市': '210500',
    '丹东市': '210600',
    '锦州市': '210700',
    '营口市': '210800',
    '阜新市': '210900',
    '辽阳市': '211000',
    '盘锦市': '211100',
    '铁岭市': '211200',
    '朝阳市': '211300',
    '葫芦岛市': '211400',
    // 吉林省
    '长春市': '220100',
    '吉林市': '220200',
    '四平市': '220300',
    '辽源市': '220400',
    '通化市': '220500',
    '白山市': '220600',
    '松原市': '220700',
    '白城市': '220800',
    '延边朝鲜族自治州': '222400',
    // 黑龙江省
    '哈尔滨市': '230100',
    '齐齐哈尔市': '230200',
    '鸡西市': '230300',
    '鹤岗市': '230400',
    '双鸭山市': '230500',
    '大庆市': '230600',
    '伊春市': '230700',
    '佳木斯市': '230800',
    '七台河市': '230900',
    '牡丹江市': '231000',
    '黑河市': '231100',
    '绥化市': '231200',
    '大兴安岭地区': '232700',
    // 山西省
    '太原市': '140100',
    '大同市': '140200',
    '阳泉市': '140300',
    '长治市': '140400',
    '晋城市': '140500',
    '朔州市': '140600',
    '晋中市': '140700',
    '运城市': '140800',
    '忻州市': '140900',
    '临汾市': '141000',
    '吕梁市': '141100',
    // 陕西省
    '西安市': '610100',
    '铜川市': '610200',
    '宝鸡市': '610300',
    '咸阳市': '610400',
    '渭南市': '610500',
    '延安市': '610600',
    '汉中市': '610700',
    '榆林市': '610800',
    '安康市': '610900',
    '商洛市': '611000',
    // 甘肃省
    '兰州市': '620100',
    '嘉峪关市': '620200',
    '金昌市': '620300',
    '白银市': '620400',
    '天水市': '620500',
    '武威市': '620600',
    '张掖市': '620700',
    '平凉市': '620800',
    '酒泉市': '620900',
    '庆阳市': '621000',
    '定西市': '621100',
    '陇南市': '621200',
    '临夏回族自治州': '622900',
    '甘南藏族自治州': '623000',
    // 河北省
    '石家庄市': '130100',
    '唐山市': '130200',
    '秦皇岛市': '130300',
    '邯郸市': '130400',
    '邢台市': '130500',
    '保定市': '130600',
    '张家口市': '130700',
    '承德市': '130800',
    '沧州市': '130900',
    '廊坊市': '131000',
    '衡水市': '131100',
    // 云南省
    '昆明市': '530100',
    '曲靖市': '530300',
    '玉溪市': '530400',
    '保山市': '530500',
    '昭通市': '530600',
    '丽江市': '530700',
    '普洱市': '530800',
    '临沧市': '530900',
    '楚雄彝族自治州': '532300',
    '红河哈尼族彝族自治州': '532500',
    '文山壮族苗族自治州': '532600',
    '西双版纳傣族自治州': '532800',
    '大理白族自治州': '532900',
    '德宏傣族景颇族自治州': '533100',
    '怒江傈僳族自治州': '533300',
    '迪庆藏族自治州': '533400',
    // 贵州省
    '贵阳市': '520100',
    '六盘水市': '520200',
    '遵义市': '520300',
    '安顺市': '520400',
    '毕节市': '520500',
    '铜仁市': '520600',
    '黔西南布依族苗族自治州': '522300',
    '黔东南苗族侗族自治州': '522600',
    '黔南布依族苗族自治州': '522700',
    // 广西壮族自治区
    '南宁市': '450100',
    '柳州市': '450200',
    '桂林市': '450300',
    '梧州市': '450400',
    '北海市': '450500',
    '防城港市': '450600',
    '钦州市': '450700',
    '贵港市': '450800',
    '玉林市': '450900',
    '百色市': '451000',
    '贺州市': '451100',
    '河池市': '451200',
    '来宾市': '451300',
    '崇左市': '451400',
    // 海南省
    '海口市': '460100',
    '三亚市': '460200',
    '三沙市': '460300',
    '儋州市': '460400',
    // 内蒙古自治区
    '呼和浩特市': '150100',
    '包头市': '150200',
    '乌海市': '150300',
    '赤峰市': '150400',
    '通辽市': '150500',
    '鄂尔多斯市': '150600',
    '呼伦贝尔市': '150700',
    '巴彦淖尔市': '150800',
    '乌兰察布市': '150900',
    '兴安盟': '152200',
    '锡林郭勒盟': '152500',
    '阿拉善盟': '152900',
    // 宁夏回族自治区
    '银川市': '640100',
    '石嘴山市': '640200',
    '吴忠市': '640300',
    '固原市': '640400',
    '中卫市': '640500',
    // 青海省
    '西宁市': '630100',
    '海东市': '630200',
    '海北藏族自治州': '632200',
    '黄南藏族自治州': '632300',
    '海南藏族自治州': '632500',
    '果洛藏族自治州': '632600',
    '玉树藏族自治州': '632700',
    '海西蒙古族藏族自治州': '632800',
    // 新疆维吾尔自治区
    '乌鲁木齐市': '650100',
    '克拉玛依市': '650200',
    '吐鲁番市': '650400',
    '哈密市': '650500',
    '昌吉回族自治州': '652300',
    '博尔塔拉蒙古自治州': '652700',
    '巴音郭楞蒙古自治州': '652800',
    '阿克苏地区': '652900',
    '克孜勒苏柯尔克孜自治州': '653000',
    '喀什地区': '653100',
    '和田地区': '653200',
    '伊犁哈萨克自治州': '654000',
    '塔城地区': '654200',
    '阿勒泰地区': '654300',
    // 西藏自治区
    '拉萨市': '540100',
    '日喀则市': '540200',
    '昌都市': '540300',
    '林芝市': '540400',
    '山南市': '540500',
    '那曲市': '540600',
    '阿里地区': '542500',
    // 香港特别行政区
    '香港特别行政区': '810000',
    // 澳门特别行政区
    '澳门特别行政区': '820000',
    // 台湾省
    '台湾省': '710000'
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
        borderColor: '#EF4444', // 激情红 - 用于重要数据（配速趋势）
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // 激情红半透明
        pointBackgroundColor: '#F59E0B', // 活力橙 - 主强调色（数据点）
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

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
        
        // 获取地图文件的完整URL - 直接使用绝对路径
        const getMapUrl = (filename: string) => {
          return `/maps/${filename}`;
        };
        
        if (currentLevel === 'country') {
          // 加载中国地图
          const response = await fetch(getMapUrl('china.json'));
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - 返回内容: ${text.substring(0, 200)}...`);
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`响应不是JSON格式 - Content-Type: ${contentType} - 返回内容: ${text.substring(0, 200)}...`);
          }
          geoJson = await response.json();
          mapName = 'china';
        } else if (currentLevel === 'province' && selectedProvince) {
          // 加载省份地图
          const provinceCode = provinceCodeMap[selectedProvince];
          if (!provinceCode) {
            throw new Error(`未找到省份代码: ${selectedProvince}`);
          }
          const response = await fetch(getMapUrl(`${provinceCode}_full.json`));
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${getMapUrl(`${provinceCode}_full.json`)} - 返回内容: ${text.substring(0, 200)}...`);
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`响应不是JSON格式 - Content-Type: ${contentType} - 返回内容: ${text.substring(0, 200)}...`);
          }
          geoJson = await response.json();
          mapName = provinceCode;
        } else if (currentLevel === 'city' && selectedProvince && selectedCity) {
          // 加载城市地图
          const cityCode = cityCodeMap[selectedCity];
          if (!cityCode) {
            throw new Error(`未找到城市代码: ${selectedCity}`);
          }
          const response = await fetch(getMapUrl(`${cityCode}_full.json`));
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${getMapUrl(`${cityCode}_full.json`)} - 返回内容: ${text.substring(0, 200)}...`);
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`响应不是JSON格式 - Content-Type: ${contentType} - 返回内容: ${text.substring(0, 200)}...`);
          }
          geoJson = await response.json();
          mapName = cityCode;
        }
        
        // 使用echarts.registerMap注册地图数据
        if (geoJson) {
          echarts.registerMap(mapName, geoJson);
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
          // 马拉松界面配色：从浅灰到活力橙/激情红的渐变
          color: ['#E5E7EB', '#FEF3C7', '#FDE68A', '#F59E0B', '#EF4444']
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
            fontSize: 12,
            color: '#1F2937' // 主文字颜色
          },
          itemStyle: {
            areaColor: '#F59E0B' // 活力橙 - 悬停时高亮
          }
        },
        itemStyle: {
          borderColor: '#D1D5DB', // 浅灰色边框
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
  // 地图点击事件处理
  const handleMapClick = (params: any) => {
    
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
    const regionName = params.name;
    const events = getEventsByRegion(regionName);
    
    // 获取鼠标坐标
    let x = 0, y = 0;
    if (params.event) {
      x = params.event.event?.clientX || params.event.clientX || 0;
      y = params.event.event?.clientY || params.event.clientY || 0;
    }
    
    // 悬浮窗始终显示
    setHoverTooltip({
      show: true,
      x: x,
      y: y,
      events: events
    });
  };

  // 地图鼠标移动事件处理
  const handleMapMousemove = (params: any) => {
    if (params.event) {
      let x = params.event.event?.clientX || params.event.clientX || 0;
      let y = params.event.event?.clientY || params.event.clientY || 0;
      setHoverTooltip(prev => ({
        ...prev,
        x: x,
        y: y
      }));
    }
  };

  // 地图鼠标离开事件处理 - 悬浮窗始终显示，不隐藏
  const handleMapMouseout = () => {
    // 不做任何处理，悬浮窗保持显示
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
              backgroundColor: '#EF4444', // 激情红
              color: 'white',
              border: 'none',
              borderRadius: '6px', // 符合设计标准
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.3s ease'
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
              left: `${Math.max(10, hoverTooltip.x - 150)}px`,
              top: `${Math.max(10, hoverTooltip.y - 100)}px`,
              backgroundColor: 'rgba(255,255,255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              maxWidth: '280px',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#EF4444' }}>
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