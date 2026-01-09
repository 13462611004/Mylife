import React from 'react';
import { Table, Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { MarathonEvent } from '../../services/types';

interface MarathonTableProps {
  data: MarathonEvent[];
  onEdit?: (record: MarathonEvent) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  onViewCertificate?: (record: MarathonEvent) => void;
}

const MarathonTable: React.FC<MarathonTableProps> = ({
  data,
  onEdit,
  onDelete,
  onViewDetails,
  onViewCertificate,
}) => {
  // 表格列配置
  const columns = [
    {
      title: '赛事名称',
      dataIndex: 'event_name',
      key: 'event_name',
      sorter: (a: MarathonEvent, b: MarathonEvent) => a.event_name.localeCompare(b.event_name),
    },
    {
      title: '赛事日期',
      dataIndex: 'event_date',
      key: 'event_date',
      sorter: (a: MarathonEvent, b: MarathonEvent) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      sorter: (a: MarathonEvent, b: MarathonEvent) => a.location.localeCompare(b.location),
    },
    {
      title: '赛事类型',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (text: string) => {
        const eventTypeMap: { [key: string]: string } = {
          '5km': '5KM',
          '10km': '10KM',
          '15km': '15KM',
          'half': '半程马拉松',
          'full': '全程马拉松',
        };
        return eventTypeMap[text] || text;
      },
    },
    {
      title: '完赛时间',
      dataIndex: 'finish_time',
      key: 'finish_time',
      sorter: (a: MarathonEvent, b: MarathonEvent) => a.finish_time.localeCompare(b.finish_time),
    },
    {
      title: '配速(分/公里)',
      dataIndex: 'pace',
      key: 'pace',
    },
    {
      title: '完赛证书',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (text: string | null, record: MarathonEvent) => (
        <Button 
          type="link" 
          icon={<SafetyCertificateOutlined />} 
          disabled={!text} 
          onClick={() => onViewCertificate && onViewCertificate(record)}
        >
          {text ? '查看证书' : '无证书'}
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MarathonEvent) => (
        <Space size="middle">
          {onEdit && (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
          )}
          {onDelete && (
            <Popconfirm
              title="确定要删除这条记录吗？"
              onConfirm={() => onDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => onViewDetails && onViewDetails(record.id)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="marathon-table">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default MarathonTable;
