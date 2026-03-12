import { Project, ProjectStats, ProjectStage, ProjectStatus, ProjectPriority, StageDefinition, MaterialFileType } from '../types/project';
import { Device, DeviceType, DeviceCategory, DeviceStatus, CollectionMethod } from '../types/device';
import { Issue, IssueStats, IssueType, IssuePriority, IssueStatus } from '../types/issue';
import { Document, DocumentTag, DocumentCategory, DocumentStatus } from '../types/document';
import { User } from '../types/common';

// 模拟用户
export const mockUsers: User[] = [
  { id: '1', name: '张经理', username: 'zhang', email: 'zhang@example.com', role: 'manager', status: 'active' },
  { id: '2', name: '李工程师', username: 'li', email: 'li@example.com', role: 'engineer', status: 'active' },
  { id: '3', name: '王工程师', username: 'wang', email: 'wang@example.com', role: 'engineer', status: 'active' },
  { id: '4', name: '赵工程师', username: 'zhao', email: 'zhao@example.com', role: 'engineer', status: 'active' },
  { id: '5', name: '刘工程师', username: 'liu', email: 'liu@example.com', role: 'engineer', status: 'active' },
  { id: '6', name: '陈工程师', username: 'chen', email: 'chen@example.com', role: 'engineer', status: 'active' },
  { id: '7', name: '周工程师', username: 'zhou', email: 'zhou@example.com', role: 'engineer', status: 'active' },
  { id: '8', name: '吴工程师', username: 'wu', email: 'wu@example.com', role: 'engineer', status: 'active' },
  { id: '9', name: '郑测试员', username: 'zheng', email: 'zheng@example.com', role: 'tester', status: 'active' },
  { id: '10', name: '孙管理员', username: 'sun', email: 'sun@example.com', role: 'admin', status: 'active' },
];

// 模拟项目
export const mockProjects: Project[] = [
  {
    id: '1', code: 'PRJ-2024-001', name: '智能制造车间数采',
    description: '车间生产线设备数据采集系统建设',
    stage: 'construction', status: 'in_progress', priority: 'high',
    managerId: '1', teamMembers: ['1', '2', '3', '4'],
    startDate: '2024-01-15', plannedEndDate: '2024-06-30',
    progress: 45, deviceCount: 12, completedDeviceCount: 5,
    issueCount: 3, documentCount: 8,
    stageConfigs: [
      {
        stageKey: 'planning',
        weight: 20,
        status: 'completed',
        actualProgress: 100,
        taskProgress: [
          {
            taskId: 't1',
            taskKey: 'staff_config',
            taskName: '人员配置',
            completed: true,
            completedDate: '2024-01-20',
            remark: '已配置项目经理和工程师团队',
            materials: [
              {
                requirementKey: 'staff_list',
                requirementName: '人员名单',
                files: [
                  { id: 'f1', url: '/mock/staff_list.jpg', type: 'image', name: '项目人员配置表.jpg' }
                ],
                completed: true
              }
            ]
          },
          {
            taskId: 't2',
            taskKey: 'equipment_purchase',
            taskName: '设备采购',
            completed: true,
            completedDate: '2024-01-25',
            remark: '采购完成',
            materials: [
              {
                requirementKey: 'purchase_contract',
                requirementName: '采购合同',
                files: [
                  { id: 'f2', url: '/mock/contract.jpg', type: 'image', name: '设备采购合同.jpg' }
                ],
                completed: true
              }
            ]
          },
          {
            taskId: 't3',
            taskKey: 'tools_prepare',
            taskName: '工具准备',
            completed: true,
            completedDate: '2024-02-01',
            remark: '工具齐全',
            materials: [
              {
                requirementKey: 'tools_list',
                requirementName: '工具清单',
                files: [
                  { id: 'f3', url: '/mock/tools.jpg', type: 'image', name: '施工工具清单.jpg' }
                ],
                completed: true
              }
            ]
          },
          {
            taskId: 't4',
            taskKey: 'tech_plan',
            taskName: '技术方案确认',
            completed: true,
            completedDate: '2024-02-10',
            remark: '方案已确认',
            materials: [
              {
                requirementKey: 'tech_doc',
                requirementName: '技术方案文档',
                files: [
                  { id: 'f4', url: '/mock/tech_plan.jpg', type: 'image', name: '技术实施方案V1.0.jpg' }
                ],
                completed: true
              }
            ]
          },
        ],
        remark: '准备阶段已完成',
        lastReportDate: '2024-02-10T10:00:00.000Z',
      },
      {
        stageKey: 'construction',
        weight: 40,
        status: 'in_progress',
        actualProgress: 50,
        deviceProgress: [
          {
            deviceId: '1',
            deviceName: '注塑机-01',
            completed: true,
            completedDate: '2024-02-15',
            taskProgress: [
              {
                deviceId: '1',
                deviceName: '注塑机-01',
                taskId: 'task_install',
                taskKey: 'device_install',
                taskName: '设备安装',
                completed: true,
                completedDate: '2024-02-05',
                remark: '安装完成，位置正确',
                materials: [
                  {
                    requirementKey: 'before_photo',
                    requirementName: '安装前照片',
                    files: [
                      { id: 'f5', url: '/mock/before1.jpg', type: 'image', name: '安装前照片1.jpg' },
                      { id: 'f6', url: '/mock/before2.jpg', type: 'image', name: '安装前照片2.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'after_photo',
                    requirementName: '安装后照片',
                    files: [
                      { id: 'f7', url: '/mock/after1.jpg', type: 'image', name: '安装后照片1.jpg' },
                      { id: 'f8', url: '/mock/after2.jpg', type: 'image', name: '安装后照片2.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'location_doc',
                    requirementName: '位置确认单',
                    files: [
                      { id: 'f9', url: '/mock/location1.jpg', type: 'image', name: '位置确认单_注塑机01.jpg' }
                    ],
                    completed: true
                  }
                ]
              },
              {
                deviceId: '1',
                deviceName: '注塑机-01',
                taskId: 'task_wiring',
                taskKey: 'network_wiring',
                taskName: '网络布线',
                completed: true,
                completedDate: '2024-02-08',
                remark: '布线完成，网络连通',
                materials: [
                  {
                    requirementKey: 'wiring_photo',
                    requirementName: '布线照片',
                    files: [
                      { id: 'f10', url: '/mock/wiring1.jpg', type: 'image', name: '布线照片1.jpg' },
                      { id: 'f11', url: '/mock/wiring2.jpg', type: 'image', name: '布线照片2.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'connection_test',
                    requirementName: '连通性测试',
                    files: [
                      { id: 'f12', url: '/mock/test1.jpg', type: 'image', name: 'ping测试结果.jpg' }
                    ],
                    completed: true
                  }
                ]
              },
              {
                deviceId: '1',
                deviceName: '注塑机-01',
                taskId: 'task_debug',
                taskKey: 'hardware_debug',
                taskName: '硬件调试',
                completed: true,
                completedDate: '2024-02-15',
                remark: '调试完成，数据采集正常',
                materials: [
                  {
                    requirementKey: 'test_report',
                    requirementName: '测试报告',
                    files: [
                      { id: 'f13', url: '/mock/test_report1.pdf', type: 'image', name: '硬件调试报告_注塑机01.pdf' }
                    ],
                    completed: true
                  }
                ]
              }
            ]
          },
          {
            deviceId: '2',
            deviceName: '注塑机-02',
            completed: true,
            completedDate: '2024-02-18',
            taskProgress: [
              {
                deviceId: '2',
                deviceName: '注塑机-02',
                taskId: 'task_install',
                taskKey: 'device_install',
                taskName: '设备安装',
                completed: true,
                completedDate: '2024-02-06',
                remark: '安装完成',
                materials: [
                  {
                    requirementKey: 'before_photo',
                    requirementName: '安装前照片',
                    files: [
                      { id: 'f14', url: '/mock/before3.jpg', type: 'image', name: '安装前照片_注塑机02.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'after_photo',
                    requirementName: '安装后照片',
                    files: [
                      { id: 'f15', url: '/mock/after3.jpg', type: 'image', name: '安装后照片_注塑机02.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'location_doc',
                    requirementName: '位置确认单',
                    files: [
                      { id: 'f16', url: '/mock/location2.pdf', type: 'image', name: '位置确认单_注塑机02.pdf' }
                    ],
                    completed: true
                  }
                ]
              },
              {
                deviceId: '2',
                deviceName: '注塑机-02',
                taskId: 'task_wiring',
                taskKey: 'network_wiring',
                taskName: '网络布线',
                completed: true,
                completedDate: '2024-02-10',
                remark: '布线完成',
                materials: [
                  {
                    requirementKey: 'wiring_photo',
                    requirementName: '布线照片',
                    files: [
                      { id: 'f17', url: '/mock/wiring3.jpg', type: 'image', name: '布线照片_注塑机02.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'connection_test',
                    requirementName: '连通性测试',
                    files: [
                      { id: 'f18', url: '/mock/test2.jpg', type: 'image', name: '连通性测试_注塑机02.jpg' }
                    ],
                    completed: true
                  }
                ]
              },
              {
                deviceId: '2',
                deviceName: '注塑机-02',
                taskId: 'task_debug',
                taskKey: 'hardware_debug',
                taskName: '硬件调试',
                completed: true,
                completedDate: '2024-02-18',
                remark: '调试完成',
                materials: [
                  {
                    requirementKey: 'test_report',
                    requirementName: '测试报告',
                    files: [
                      { id: 'f19', url: '/mock/test_report2.pdf', type: 'image', name: '硬件调试报告_注塑机02.pdf' }
                    ],
                    completed: true
                  }
                ]
              }
            ]
          },
          {
            deviceId: '3',
            deviceName: '装配机器人-01',
            completed: false,
            taskProgress: [
              {
                deviceId: '3',
                deviceName: '装配机器人-01',
                taskId: 'task_install',
                taskKey: 'device_install',
                taskName: '设备安装',
                completed: true,
                completedDate: '2024-02-20',
                remark: '安装完成',
                materials: [
                  {
                    requirementKey: 'before_photo',
                    requirementName: '安装前照片',
                    files: [
                      { id: 'f20', url: '/mock/before_robot1.jpg', type: 'image', name: '安装前_机器人01.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'after_photo',
                    requirementName: '安装后照片',
                    files: [
                      { id: 'f21', url: '/mock/after_robot1.jpg', type: 'image', name: '安装后_机器人01.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'location_doc',
                    requirementName: '位置确认单',
                    files: [
                      { id: 'f22', url: '/mock/location_robot1.pdf', type: 'image', name: '位置确认单_机器人01.pdf' }
                    ],
                    completed: true
                  }
                ]
              },
              {
                deviceId: '3',
                deviceName: '装配机器人-01',
                taskId: 'task_wiring',
                taskKey: 'network_wiring',
                taskName: '网络布线',
                completed: true,
                completedDate: '2024-02-22',
                remark: '布线完成，连接稳定',
                materials: [
                  {
                    requirementKey: 'wiring_photo',
                    requirementName: '布线照片',
                    files: [
                      { id: 'f23', url: '/mock/wiring_robot1.jpg', type: 'image', name: '布线照片_机器人01.jpg' }
                    ],
                    completed: true
                  },
                  {
                    requirementKey: 'connection_test',
                    requirementName: '连通性测试',
                    files: [
                      { id: 'f24', url: '/mock/test_robot1.jpg', type: 'image', name: '连通性测试_机器人01.jpg' }
                    ],
                    completed: true
                  }
                ]
              },
              {
                deviceId: '3',
                deviceName: '装配机器人-01',
                taskId: 'task_debug',
                taskKey: 'hardware_debug',
                taskName: '硬件调试',
                completed: false,
                remark: '调试进行中，OPC UA连接偶尔不稳定',
                materials: []
              }
            ]
          },
          {
            deviceId: '4',
            deviceName: '装配机器人-02',
            completed: false,
            taskProgress: [
              {
                deviceId: '4',
                deviceName: '装配机器人-02',
                taskId: 'task_install',
                taskKey: 'device_install',
                taskName: '设备安装',
                completed: false,
                remark: '等待安装',
                materials: []
              },
              {
                deviceId: '4',
                deviceName: '装配机器人-02',
                taskId: 'task_wiring',
                taskKey: 'network_wiring',
                taskName: '网络布线',
                completed: false,
                remark: '待施工',
                materials: []
              },
              {
                deviceId: '4',
                deviceName: '装配机器人-02',
                taskId: 'task_debug',
                taskKey: 'hardware_debug',
                taskName: '硬件调试',
                completed: false,
                remark: '未开始',
                materials: []
              }
            ]
          }
        ],
        remark: '施工进行中，已完成2台设备，第3台调试中',
        lastReportDate: '2024-02-22T16:30:00.000Z',
      },
      {
        stageKey: 'configuration',
        weight: 25,
        status: 'not_started',
        actualProgress: 0,
        deviceProgress: [],
        remark: '尚未开始',
        lastReportDate: undefined,
      },
      {
        stageKey: 'verification',
        weight: 15,
        status: 'not_started',
        actualProgress: 0,
        taskProgress: [],
        remark: '尚未开始',
        lastReportDate: undefined,
      },
    ],
    createTime: '2024-01-10 10:00:00', updateTime: '2024-02-01 14:30:00', creator: '张经理',
  },
  {
    id: '2', code: 'PRJ-2024-002', name: '装配线数字化改造',
    description: '装配线设备联网与数据采集',
    stage: 'configuration', status: 'in_progress', priority: 'medium',
    managerId: '2', teamMembers: ['2', '3', '5'],
    startDate: '2024-02-01', plannedEndDate: '2024-05-31',
    progress: 75, deviceCount: 8, completedDeviceCount: 6,
    issueCount: 1, documentCount: 5,
    stageConfigs: [
      { stageKey: 'planning', weight: 20, status: 'completed' },
      { stageKey: 'construction', weight: 40, status: 'completed' },
      { stageKey: 'configuration', weight: 25, status: 'in_progress' },
      { stageKey: 'verification', weight: 15, status: 'not_started' },
    ],
    createTime: '2024-01-25 09:00:00', updateTime: '2024-02-03 16:00:00', creator: '李工程师',
  },
  {
    id: '3', code: 'PRJ-2024-003', name: '焊接机器人数采',
    description: '焊接工作站数据采集与监控',
    stage: 'planning', status: 'not_started', priority: 'low',
    managerId: '3', teamMembers: ['3', '6'],
    startDate: '2024-03-01', plannedEndDate: '2024-07-31',
    progress: 0, deviceCount: 5, completedDeviceCount: 0,
    issueCount: 0, documentCount: 2,
    stageConfigs: [
      { stageKey: 'planning', weight: 20, status: 'not_started' },
      { stageKey: 'construction', weight: 40, status: 'not_started' },
      { stageKey: 'configuration', weight: 25, status: 'not_started' },
      { stageKey: 'verification', weight: 15, status: 'not_started' },
    ],
    createTime: '2024-02-01 11:00:00', updateTime: '2024-02-01 11:00:00', creator: '王工程师',
  },
  {
    id: '4', code: 'PRJ-2024-004', name: 'CNC加工中心联网',
    description: 'CNC设备状态监控与程序管理',
    stage: 'construction', status: 'in_progress', priority: 'high',
    managerId: '4', teamMembers: ['4', '7', '8'],
    startDate: '2024-01-20', plannedEndDate: '2024-04-30',
    progress: 60, deviceCount: 10, completedDeviceCount: 6,
    issueCount: 2, documentCount: 6,
    stageConfigs: [
      { stageKey: 'planning', weight: 20, status: 'completed' },
      { stageKey: 'construction', weight: 40, status: 'in_progress' },
      { stageKey: 'configuration', weight: 25, status: 'not_started' },
      { stageKey: 'verification', weight: 15, status: 'not_started' },
    ],
    createTime: '2024-01-15 14:00:00', updateTime: '2024-02-02 10:00:00', creator: '赵工程师',
  },
  {
    id: '5', code: 'PRJ-2023-015', name: '老厂区设备数采',
    description: '老厂区关键设备数据采集',
    stage: 'completed', status: 'completed', priority: 'medium',
    managerId: '1', teamMembers: ['1', '2', '9'],
    startDate: '2023-09-01', endDate: '2023-12-31', plannedEndDate: '2023-12-31',
    progress: 100, deviceCount: 15, completedDeviceCount: 15,
    issueCount: 0, documentCount: 12,
    stageConfigs: [
      { stageKey: 'planning', weight: 20, status: 'completed' },
      { stageKey: 'construction', weight: 40, status: 'completed' },
      { stageKey: 'configuration', weight: 25, status: 'completed' },
      { stageKey: 'verification', weight: 15, status: 'completed' },
    ],
    createTime: '2023-08-25 10:00:00', updateTime: '2023-12-31 17:00:00', creator: '张经理',
  },
  {
    id: '6', code: 'PRJ-2024-005', name: '涂装线设备监控',
    description: '涂装生产线设备状态采集',
    stage: 'verification', status: 'in_progress', priority: 'medium',
    managerId: '5', teamMembers: ['5', '6'],
    startDate: '2024-02-10', plannedEndDate: '2024-06-15',
    progress: 85, deviceCount: 6, completedDeviceCount: 5,
    issueCount: 1, documentCount: 3,
    stageConfigs: [
      { stageKey: 'planning', weight: 20, status: 'completed' },
      { stageKey: 'construction', weight: 40, status: 'completed' },
      { stageKey: 'configuration', weight: 25, status: 'completed' },
      { stageKey: 'verification', weight: 15, status: 'in_progress' },
    ],
    createTime: '2024-02-05 13:00:00', updateTime: '2024-02-04 09:30:00', creator: '刘工程师',
  },
  {
    id: '7', code: 'PRJ-2024-006', name: '热处理车间数采',
    description: '热处理设备温度采集系统',
    stage: 'presale', status: 'on_hold', priority: 'low',
    managerId: '6', teamMembers: ['6', '7'],
    startDate: '2024-04-01', plannedEndDate: '2024-08-31',
    progress: 0, deviceCount: 8, completedDeviceCount: 0,
    issueCount: 0, documentCount: 1,
    stageConfigs: [],
    createTime: '2024-01-30 15:00:00', updateTime: '2024-02-01 10:00:00', creator: '陈工程师',
  },
  {
    id: '8', code: 'PRJ-2024-007', name: '装配线二期数采',
    description: '装配线二期设备扩展',
    stage: 'acceptance', status: 'in_progress', priority: 'medium',
    managerId: '2', teamMembers: ['2', '3', '4'],
    startDate: '2024-05-01', plannedEndDate: '2024-09-30',
    progress: 95, deviceCount: 10, completedDeviceCount: 10,
    issueCount: 0, documentCount: 15,
    stageConfigs: [
      { stageKey: 'planning', weight: 20, status: 'completed' },
      { stageKey: 'construction', weight: 40, status: 'completed' },
      { stageKey: 'configuration', weight: 25, status: 'completed' },
      { stageKey: 'verification', weight: 15, status: 'completed' },
    ],
    createTime: '2024-02-03 11:00:00', updateTime: '2024-02-03 11:00:00', creator: '李工程师',
  },
];

// 模拟设备类型 - 电池制造设备
export const mockDeviceTypes: DeviceType[] = [
  {
    id: '1', name: '制带机', code: 'ZD',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '用于制造铅酸电池板栅的设备',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '2', name: '连冲机', code: 'LC',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '连续冲压成型设备，用于板栅生产',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '3', name: '连铸机', code: 'LZ',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '连续铸造设备，用于板栅铸造',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '4', name: '球磨机', code: 'QM',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '用于铅粉研磨的设备',
    defaultCollectionMethod: 'Modbus_TCP',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '5', name: '连涂机', code: 'LT',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '用于板栅涂膏的连续涂装设备',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '6', name: '和膏机', code: 'HG',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '用于铅膏混合制备的设备',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '7', name: '固化室', code: 'GH',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_1', processName: '极板',
    category: 'Other', description: '用于极板固化的专用设备',
    defaultCollectionMethod: 'Modbus_TCP',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '8', name: '柱焊机', code: 'ZH',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_2', processName: '组装',
    category: 'Other', description: '用于极柱焊接的设备',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '9', name: '短路检测', code: 'DL',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_2', processName: '组装',
    category: 'Other', description: '用于电池短路检测的测试设备',
    defaultCollectionMethod: 'Modbus_TCP',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '10', name: '点胶机', code: 'DJ',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_2', processName: '组装',
    category: 'Other', description: '用于电池密封点胶的设备',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '11', name: '气密检测', code: 'QMJC',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_2', processName: '组装',
    category: 'Other', description: '用于电池气密性检测的设备',
    defaultCollectionMethod: 'Modbus_TCP',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
  {
    id: '12', name: '加酸机', code: 'JS',
    projectId: '1', projectName: '智能制造车间数采',
    processId: 'process_2', processName: '组装',
    category: 'Other', description: '用于电池加酸的专用设备',
    defaultCollectionMethod: 'OPC_UA',
    createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00',
  },
];

// 模拟设备
export const mockDevices: Device[] = [
  {
    id: '1', code: 'DEV-001', name: '注塑机-01', projectId: '1', projectName: '智能制造车间数采',
    typeId: '1', typeName: '西门子PLC S7-1200', category: 'PLC',
    status: 'completed', ip: '192.168.1.101', port: 102, location: '车间A区', workshop: '车间A区',
    manufacturer: '西门子', model: 'S7-1214C', serialNumber: 'SN20240101',
    collectionMethod: 'OPC_UA', pointCount: 50, collectedPointCount: 50, progress: 100,
    responsiblePersonId: '2', responsiblePerson: '李工程师',
    startDate: '2024-01-20', completedDate: '2024-02-01',
    issues: 0, documents: 2,
    createTime: '2024-01-15 10:00:00', updateTime: '2024-02-01 14:00:00', creator: '张经理',
  },
  {
    id: '2', code: 'DEV-002', name: '注塑机-02', projectId: '1', projectName: '智能制造车间数采',
    typeId: '1', typeName: '西门子PLC S7-1200', category: 'PLC',
    status: 'completed', ip: '192.168.1.102', port: 102, location: '车间A区', workshop: '车间A区',
    manufacturer: '西门子', model: 'S7-1214C', serialNumber: 'SN20240102',
    collectionMethod: 'OPC_UA', pointCount: 50, collectedPointCount: 48, progress: 96,
    responsiblePersonId: '2', responsiblePerson: '李工程师',
    startDate: '2024-01-20', completedDate: '2024-02-01',
    issues: 1, documents: 2,
    createTime: '2024-01-15 10:00:00', updateTime: '2024-02-02 09:00:00', creator: '张经理',
  },
  {
    id: '3', code: 'DEV-003', name: '装配机器人-01', projectId: '1', projectName: '智能制造车间数采',
    typeId: '4', typeName: 'ABB机器人', category: 'Robot',
    status: 'in_progress', ip: '192.168.1.201', location: '车间B区', workshop: '车间B区',
    manufacturer: 'ABB', model: 'IRB-1200', serialNumber: 'SN20240103',
    collectionMethod: 'OPC_UA', pointCount: 80, collectedPointCount: 50, progress: 62,
    responsiblePersonId: '3', responsiblePerson: '王工程师',
    startDate: '2024-01-25',
    issues: 1, documents: 1,
    createTime: '2024-01-20 14:00:00', updateTime: '2024-02-03 10:30:00', creator: '张经理',
  },
  {
    id: '4', code: 'DEV-004', name: 'CNC加工中心-01', projectId: '4', projectName: 'CNC加工中心联网',
    typeId: '3', typeName: '发那科CNC', category: 'CNC',
    status: 'completed', ip: '192.168.1.151', location: '加工车间', workshop: '加工车间',
    manufacturer: '发那科', model: '0i-MF', serialNumber: 'SN20240104',
    collectionMethod: 'OPC_UA', pointCount: 100, collectedPointCount: 100, progress: 100,
    responsiblePersonId: '4', responsiblePerson: '赵工程师',
    startDate: '2024-01-22', completedDate: '2024-02-01',
    issues: 0, documents: 3,
    createTime: '2024-01-18 09:00:00', updateTime: '2024-02-01 16:00:00', creator: '赵工程师',
  },
  {
    id: '5', code: 'DEV-005', name: 'CNC加工中心-02', projectId: '4', projectName: 'CNC加工中心联网',
    typeId: '3', typeName: '发那科CNC', category: 'CNC',
    status: 'in_progress', ip: '192.168.1.152', location: '加工车间', workshop: '加工车间',
    manufacturer: '发那科', model: '0i-MF', serialNumber: 'SN20240105',
    collectionMethod: 'OPC_UA', pointCount: 100, collectedPointCount: 70, progress: 70,
    responsiblePersonId: '7', responsiblePerson: '周工程师',
    startDate: '2024-01-25',
    issues: 1, documents: 2,
    createTime: '2024-01-18 09:00:00', updateTime: '2024-02-03 11:00:00', creator: '赵工程师',
  },
  {
    id: '6', code: 'DEV-006', name: '装配线PLC-01', projectId: '2', projectName: '装配线数字化改造',
    typeId: '1', typeName: '西门子PLC S7-1200', category: 'PLC',
    status: 'completed', ip: '192.168.2.101', port: 102, location: '装配车间', workshop: '装配车间',
    manufacturer: '西门子', model: 'S7-1215C', serialNumber: 'SN20240106',
    collectionMethod: 'OPC_UA', pointCount: 60, collectedPointCount: 60, progress: 100,
    responsiblePersonId: '5', responsiblePerson: '刘工程师',
    startDate: '2024-02-02', completedDate: '2024-02-05',
    issues: 0, documents: 2,
    createTime: '2024-01-28 10:00:00', updateTime: '2024-02-05 15:00:00', creator: '李工程师',
  },
  {
    id: '7', code: 'DEV-007', name: '温控设备-01', projectId: '6', projectName: '涂装线设备监控',
    typeId: '5', typeName: '温度传感器', category: 'Sensor',
    status: 'in_progress', location: '涂装车间', workshop: '涂装车间',
    manufacturer: '国产', model: 'TH-100', serialNumber: 'SN20240107',
    collectionMethod: 'Modbus_RTU', pointCount: 20, collectedPointCount: 12, progress: 60,
    responsiblePersonId: '6', responsiblePerson: '陈工程师',
    startDate: '2024-02-08',
    issues: 0, documents: 1,
    createTime: '2024-02-05 14:00:00', updateTime: '2024-02-04 08:00:00', creator: '刘工程师',
  },
  {
    id: '8', code: 'DEV-008', name: '装配机器人-02', projectId: '1', projectName: '智能制造车间数采',
    typeId: '4', typeName: 'ABB机器人', category: 'Robot',
    status: 'not_started', location: '车间B区', workshop: '车间B区',
    manufacturer: 'ABB', model: 'IRB-1200', serialNumber: 'SN20240108',
    collectionMethod: 'OPC_UA', pointCount: 80, collectedPointCount: 0, progress: 0,
    responsiblePersonId: '3', responsiblePerson: '王工程师',
    startDate: '2024-02-15',
    issues: 0, documents: 0,
    createTime: '2024-02-01 11:00:00', updateTime: '2024-02-01 11:00:00', creator: '张经理',
  },
  {
    id: '9', code: 'DEV-009', name: 'CNC加工中心-03', projectId: '4', projectName: 'CNC加工中心联网',
    typeId: '3', typeName: '发那科CNC', category: 'CNC',
    status: 'completed', ip: '192.168.1.153', location: '加工车间', workshop: '加工车间',
    manufacturer: '发那科', model: '0i-MF', serialNumber: 'SN20240109',
    collectionMethod: 'OPC_UA', pointCount: 100, collectedPointCount: 100, progress: 100,
    responsiblePersonId: '8', responsiblePerson: '吴工程师',
    startDate: '2024-01-28', completedDate: '2024-02-03',
    issues: 0, documents: 2,
    createTime: '2024-01-20 14:00:00', updateTime: '2024-02-03 17:00:00', creator: '赵工程师',
  },
  {
    id: '10', code: 'DEV-010', name: 'CNC加工中心-04', projectId: '4', projectName: 'CNC加工中心联网',
    typeId: '3', typeName: '发那科CNC', category: 'CNC',
    status: 'in_progress', ip: '192.168.1.154', location: '加工车间', workshop: '加工车间',
    manufacturer: '发那科', model: '0i-MD', serialNumber: 'SN20240110',
    collectionMethod: 'OPC_UA', pointCount: 100, collectedPointCount: 75, progress: 75,
    responsiblePersonId: '4', responsiblePerson: '赵工程师',
    startDate: '2024-02-01',
    issues: 1, documents: 1,
    createTime: '2024-01-25 10:00:00', updateTime: '2024-02-04 09:30:00', creator: '赵工程师',
  },
];

// 模拟问题
export const mockIssues: Issue[] = [
  {
    id: '1', code: 'ISSUE-2024-001', title: '注塑机02部分点位采集失败',
    type: 'device', priority: 'high', status: 'in_progress',
    description: '注塑机-02的温度和压力数据无法正常读取，可能PLC地址配置错误',
    projectId: '2', projectName: '装配线数字化改造',
    deviceId: '2', deviceName: '注塑机-02',
    reporterId: '2', reporter: '李工程师',
    assigneeId: '2', assignee: '李工程师',
    dueDate: '2024-02-10',
    createTime: '2024-02-02 10:00:00', updateTime: '2024-02-03 14:30:00',
  },
  {
    id: '2', code: 'ISSUE-2024-002', title: '装配机器人OPC UA连接不稳定',
    type: 'technical', priority: 'medium', status: 'open',
    description: '装配机器人-01的OPC UA连接经常断开，需要检查网络配置',
    projectId: '1', projectName: '智能制造车间数采',
    deviceId: '3', deviceName: '装配机器人-01',
    reporterId: '3', reporter: '王工程师',
    assigneeId: '3', assignee: '王工程师',
    dueDate: '2024-02-15',
    createTime: '2024-02-03 09:00:00', updateTime: '2024-02-03 09:00:00',
  },
  {
    id: '3', code: 'ISSUE-2024-003', title: 'CNC设备人员不足',
    type: 'resource', priority: 'high', status: 'assigned',
    description: 'CNC加工中心联网项目需要额外的工程师配合现场调试',
    projectId: '4', projectName: 'CNC加工中心联网',
    reporterId: '4', reporter: '赵工程师',
    assigneeId: '1', assignee: '张经理',
    dueDate: '2024-02-08',
    createTime: '2024-02-01 15:00:00', updateTime: '2024-02-02 11:00:00',
  },
  {
    id: '4', code: 'ISSUE-2024-004', title: '温控设备数据异常',
    type: 'device', priority: 'medium', status: 'resolved',
    description: '温控设备-01采集的温度数据波动异常',
    projectId: '6', projectName: '涂装线设备监控',
    deviceId: '7', deviceName: '温控设备-01',
    reporterId: '6', reporter: '陈工程师',
    assigneeId: '6', assignee: '陈工程师',
    resolvedAt: '2024-02-04 10:00:00',
    createTime: '2024-02-03 08:00:00', updateTime: '2024-02-04 10:00:00',
  },
  {
    id: '5', code: 'ISSUE-2023-045', title: '老厂区项目验收文档不完整',
    type: 'plan', priority: 'low', status: 'closed',
    description: '老厂区数采项目缺少部分验收文档',
    projectId: '5', projectName: '老厂区设备数采',
    reporterId: '9', reporter: '郑测试员',
    assigneeId: '2', assignee: '李工程师',
    resolvedAt: '2023-12-28 16:00:00', closedAt: '2023-12-31 10:00:00',
    createTime: '2023-12-25 14:00:00', updateTime: '2023-12-31 10:00:00',
  },
];

// 模拟文档标签
export const mockDocumentTags: DocumentTag[] = [
  { id: '1', name: '需求文档', color: '#1890ff', category: '文档类型', isSystem: true, usageCount: 15, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '2', name: '设计文档', color: '#52c41a', category: '文档类型', isSystem: true, usageCount: 12, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '3', name: '操作手册', color: '#faad14', category: '文档类型', isSystem: true, usageCount: 8, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '4', name: '测试报告', color: '#f5222d', category: '文档类型', isSystem: true, usageCount: 10, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '5', name: '重要', color: '#ff4d4f', category: '优先级', isSystem: true, usageCount: 20, createTime: '2024-01-01 00:00:00', updateTime: '2024-01-01 00:00:00' },
  { id: '6', name: 'PLC配置', color: '#722ed1', category: '技术', isSystem: false, usageCount: 6, createTime: '2024-01-15 10:00:00', updateTime: '2024-01-15 10:00:00' },
  { id: '7', name: 'CNC程序', color: '#13c2c2', category: '技术', isSystem: false, usageCount: 4, createTime: '2024-01-18 14:00:00', updateTime: '2024-01-18 14:00:00' },
];

// 模拟文档
export const mockDocuments: Document[] = [
  {
    id: '1', code: 'DOC-2024-001', name: '智能制造车间数采需求说明书',
    type: 'requirement', status: 'approved',
    projectId: '1', projectName: '智能制造车间数采',
    version: 'V1.2', fileUrl: '/docs/requirement-001.pdf', fileSize: 2048576, fileType: 'pdf',
    tags: ['需求文档', '重要'],
    description: '项目需求规格说明书',
    uploaderId: '1', uploader: '张经理', reviewerId: '1', reviewer: '张经理',
    downloadCount: 25,
    createTime: '2024-01-10 10:00:00', updateTime: '2024-01-15 14:30:00', creator: '张经理',
  },
  {
    id: '2', code: 'DOC-2024-002', name: 'PLC采集点配置表',
    type: 'design', status: 'approved',
    projectId: '1', projectName: '智能制造车间数采',
    version: 'V2.0', fileUrl: '/docs/design-002.xlsx', fileSize: 102400, fileType: 'xlsx',
    tags: ['设计文档', 'PLC配置'],
    description: '西门子PLC采集点位配置表',
    uploaderId: '2', uploader: '李工程师', reviewerId: '1', reviewer: '张经理',
    downloadCount: 18,
    createTime: '2024-01-12 09:00:00', updateTime: '2024-01-20 11:00:00', creator: '李工程师',
  },
  {
    id: '3', code: 'DOC-2024-003', name: '设备操作手册',
    type: 'manual', status: 'approved',
    projectId: '1', projectName: '智能制造车间数采',
    version: 'V1.0', fileUrl: '/docs/manual-003.pdf', fileSize: 5242880, fileType: 'pdf',
    tags: ['操作手册'],
    description: '数采系统操作手册',
    uploaderId: '3', uploader: '王工程师', reviewerId: '1', reviewer: '张经理',
    downloadCount: 42,
    createTime: '2024-01-18 14:00:00', updateTime: '2024-01-25 10:00:00', creator: '王工程师',
  },
  {
    id: '4', code: 'DOC-2024-004', name: 'CNC设备测试报告',
    type: 'test', status: 'review',
    projectId: '4', projectName: 'CNC加工中心联网',
    deviceId: '4', deviceName: 'CNC加工中心-01',
    version: 'V1.0', fileUrl: '/docs/test-004.pdf', fileSize: 1572864, fileType: 'pdf',
    tags: ['测试报告'],
    description: 'CNC加工中心-01现场测试报告',
    uploaderId: '9', uploader: '郑测试员', reviewerId: '4', reviewer: '赵工程师',
    downloadCount: 8,
    createTime: '2024-02-01 16:00:00', updateTime: '2024-02-03 09:30:00', creator: '郑测试员',
  },
];

// 项目统计
export const mockProjectStats: ProjectStats = {
  totalProjects: 8,
  inProgressProjects: 4,
  completedProjects: 1,
  overdueProjects: 1,
  totalDevices: 70,
  completedDevices: 45,
  totalIssues: 5,
  resolvedIssues: 2,
  criticalIssues: 2,
};

// 问题统计
export const mockIssueStats: IssueStats = {
  total: 5,
  open: 1,
  assigned: 1,
  inProgress: 1,
  resolved: 1,
  closed: 1,
  byType: {
    device: 2,
    plan: 1,
    technical: 1,
    resource: 1,
    other: 0,
  },
  byPriority: {
    low: 1,
    medium: 2,
    high: 2,
    urgent: 0,
  },
  avgResolutionTime: 48,
};

// 辅助函数：根据ID获取用户
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

// 辅助函数：根据ID获取项目
export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(p => p.id === id);
};

// 辅助函数：根据ID获取设备
export const getDeviceById = (id: string): Device | undefined => {
  return mockDevices.find(d => d.id === id);
};

// 辅助函数：根据ID获取问题
export const getIssueById = (id: string): Issue | undefined => {
  return mockIssues.find(i => i.id === id);
};

// 辅助函数：根据ID获取文档
export const getDocumentById = (id: string): Document | undefined => {
  return mockDocuments.find(d => d.id === id);
};

// 模拟项目计划
import { ProjectPlan } from '../types/project';

export const mockProjectPlans: ProjectPlan[] = [
  {
    id: 'plan-1',
    projectId: '1',
    name: '智能制造车间数采实施计划',
    description: '车间生产线设备数据采集系统建设的完整实施计划',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    stages: [
      {
        stage: 'planning',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        managerId: '1',
        participantIds: ['1', '2', '3'],
      },
      {
        stage: 'construction',
        startDate: '2024-02-16',
        endDate: '2024-03-20',
        managerId: '2',
        participantIds: ['2', '3', '4'],
      },
      {
        stage: 'configuration',
        startDate: '2024-03-21',
        endDate: '2024-04-10',
        managerId: '3',
        participantIds: ['2', '3'],
      },
      {
        stage: 'verification',
        startDate: '2024-04-11',
        endDate: '2024-04-30',
        managerId: '2',
        participantIds: ['2', '3', '9'],
      },
    ],
    tasks: [
      {
        id: 'task-1',
        name: '人员配置',
        description: '确定项目经理和工程师团队',
        stage: 'planning',
        status: 'completed',
        startDate: '2024-02-01',
        endDate: '2024-02-03',
        progress: 100,
        assignees: ['1', '2'],
      },
      {
        id: 'task-2',
        name: '设备采购',
        description: '采购必要的数采设备和工具',
        stage: 'planning',
        status: 'completed',
        startDate: '2024-02-04',
        endDate: '2024-02-08',
        progress: 100,
        assignees: ['2'],
      },
      {
        id: 'task-3',
        name: '工具准备',
        description: '准备调试工具和软件',
        stage: 'planning',
        status: 'completed',
        startDate: '2024-02-09',
        endDate: '2024-02-12',
        progress: 100,
        assignees: ['3'],
      },
      {
        id: 'task-4',
        name: '技术方案确认',
        description: '与客户确认最终技术方案',
        stage: 'planning',
        status: 'completed',
        startDate: '2024-02-13',
        endDate: '2024-02-15',
        progress: 100,
        assignees: ['1', '2'],
      },
      {
        id: 'task-5',
        name: '设备安装',
        description: '安装PLC通讯模块和网关设备',
        stage: 'construction',
        status: 'completed',
        startDate: '2024-02-16',
        endDate: '2024-02-25',
        progress: 100,
        assignees: ['2', '3'],
      },
      {
        id: 'task-6',
        name: '网络布线',
        description: '完成设备间网络布线',
        stage: 'construction',
        status: 'in_progress',
        startDate: '2024-02-26',
        endDate: '2024-03-05',
        progress: 80,
        assignees: ['3'],
      },
      {
        id: 'task-7',
        name: '硬件调试',
        description: '调试硬件连接和通讯',
        stage: 'construction',
        status: 'in_progress',
        startDate: '2024-03-06',
        endDate: '2024-03-15',
        progress: 40,
        assignees: ['2', '4'],
      },
      {
        id: 'task-8',
        name: '现场测试',
        description: '现场设备连通性测试',
        stage: 'construction',
        status: 'pending',
        startDate: '2024-03-16',
        endDate: '2024-03-20',
        progress: 0,
        assignees: ['2', '3', '4'],
      },
    ],
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-02-01 10:00:00',
  },
  {
    id: 'plan-2',
    projectId: '2',
    name: '装配线数字化改造实施计划',
    description: '装配线设备联网与数据采集项目实施计划',
    startDate: '2024-02-01',
    endDate: '2024-05-31',
    stages: [
      {
        stage: 'configuration',
        startDate: '2024-02-01',
        endDate: '2024-05-31',
        managerId: '2',
        participantIds: ['2', '3', '5'],
      },
    ],
    tasks: [
      {
        id: 'task-9',
        name: '点位配置',
        description: '配置数据采集点位',
        stage: 'configuration',
        status: 'completed',
        startDate: '2024-04-16',
        endDate: '2024-04-25',
        progress: 100,
        assignees: ['2'],
      },
      {
        id: 'task-10',
        name: '协议配置',
        description: '配置OPC UA和Modbus协议',
        stage: 'configuration',
        status: 'in_progress',
        startDate: '2024-04-26',
        endDate: '2024-05-05',
        progress: 60,
        assignees: ['3'],
      },
    ],
    createTime: '2024-01-25 09:00:00',
    updateTime: '2024-02-03 16:00:00',
  },
];

// 内置阶段定义
export const mockStageDefinitions: StageDefinition[] = [
  {
    id: 'stage-planning',
    key: 'planning',
    name: '准备阶段',
    description: '项目前期准备工作，包括需求确认、资源准备等',
    icon: 'ProjectOutlined',
    color: '#1890ff',
    progressMode: 'by_task',
    isSystem: true,
    defaultWeight: 20,
    defaultTasks: ['人员配置', '设备采购', '工具准备', '技术方案确认'],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
  {
    id: 'stage-construction',
    key: 'construction',
    name: '施工阶段',
    description: '现场施工实施，包括设备安装、网络部署等',
    icon: 'SyncOutlined',
    color: '#52c41a',
    progressMode: 'by_device',
    isSystem: true,
    defaultWeight: 40,
    defaultTasks: ['设备安装', '网络布线', '硬件调试'],
    // 新增：任务模板配置
    taskTemplates: [
      {
        id: 'task_install',
        key: 'device_install',
        name: '设备安装',
        description: '安装数据采集设备到指定位置',
        defaultWeight: 40,
        materialRequirements: [
          {
            key: 'before_photo',
            name: '安装前照片',
            description: '安装前现场环境照片',
            fileType: MaterialFileType.IMAGE,
            required: true,
            minCount: 1,
            maxCount: 5,
          },
          {
            key: 'after_photo',
            name: '安装后照片',
            description: '安装完成后设备照片',
            fileType: MaterialFileType.IMAGE,
            required: true,
            minCount: 1,
            maxCount: 5,
          },
          {
            key: 'location_doc',
            name: '位置确认单',
            description: '设备安装位置确认签字文档',
            fileType: MaterialFileType.DOCUMENT,
            required: true,
            minCount: 1,
            maxCount: 1,
          },
        ],
      },
      {
        id: 'task_wiring',
        key: 'network_wiring',
        name: '网络布线',
        description: '网络布线及连接',
        defaultWeight: 30,
        materialRequirements: [
          {
            key: 'wiring_photo',
            name: '布线照片',
            description: '网络布线完成后的照片',
            fileType: MaterialFileType.IMAGE,
            required: true,
            minCount: 1,
            maxCount: 10,
          },
          {
            key: 'connection_test',
            name: '连通性测试',
            description: '网络连通性测试截图',
            fileType: MaterialFileType.IMAGE,
            required: true,
            minCount: 1,
            maxCount: 3,
          },
        ],
      },
      {
        id: 'task_debug',
        key: 'hardware_debug',
        name: '硬件调试',
        description: '硬件设备调试与测试',
        defaultWeight: 30,
        materialRequirements: [
          {
            key: 'test_report',
            name: '测试报告',
            description: '硬件调试测试报告',
            fileType: MaterialFileType.DOCUMENT,
            required: true,
            minCount: 1,
            maxCount: 1,
          },
        ],
      },
    ],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
  {
    id: 'stage-configuration',
    key: 'configuration',
    name: '配置阶段',
    description: '系统配置与调试，包括参数设置、功能测试等',
    icon: 'ClockCircleOutlined',
    color: '#faad14',
    progressMode: 'by_device',
    isSystem: true,
    defaultWeight: 25,
    defaultTasks: ['点位配置', '协议配置', '状态逻辑配置'],
    // 新增：任务模板配置
    taskTemplates: [
      {
        id: 'task_point_config',
        key: 'point_config',
        name: '点位配置',
        description: '配置数据采集点位',
        defaultWeight: 35,
        materialRequirements: [
          {
            key: 'point_list',
            name: '点位配置表',
            description: '数据采集点位配置清单',
            fileType: MaterialFileType.SPREADSHEET,
            required: true,
            minCount: 1,
            maxCount: 1,
          },
          {
            key: 'screenshot',
            name: '配置截图',
            description: '系统配置界面截图',
            fileType: MaterialFileType.IMAGE,
            required: true,
            minCount: 1,
            maxCount: 5,
          },
        ],
      },
      {
        id: 'task_protocol_config',
        key: 'protocol_config',
        name: '协议配置',
        description: '配置通信协议参数',
        defaultWeight: 35,
        materialRequirements: [
          {
            key: 'protocol_doc',
            name: '协议配置文档',
            description: '通信协议配置说明文档',
            fileType: MaterialFileType.DOCUMENT,
            required: true,
            minCount: 1,
            maxCount: 1,
          },
        ],
      },
      {
        id: 'task_logic_config',
        key: 'logic_config',
        name: '状态逻辑配置',
        description: '配置设备状态逻辑',
        defaultWeight: 30,
        materialRequirements: [
          {
            key: 'logic_diagram',
            name: '逻辑图',
            description: '状态逻辑配置图',
            fileType: MaterialFileType.DOCUMENT,
            required: true,
            minCount: 1,
            maxCount: 3,
          },
          {
            key: 'test_result',
            name: '测试结果',
            description: '逻辑配置测试结果记录',
            fileType: MaterialFileType.SPREADSHEET,
            required: true,
            minCount: 1,
            maxCount: 1,
          },
        ],
      },
    ],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
  {
    id: 'stage-verification',
    key: 'verification',
    name: '核对阶段',
    description: '数据核对与验证，确保采集数据准确无误',
    icon: 'CheckCircleOutlined',
    color: '#722ed1',
    progressMode: 'by_task',
    isSystem: true,
    defaultWeight: 15,
    defaultTasks: ['数据核对', '准确性验证', '完整性检查'],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
];

// 导入阶段进度辅助函数（实际使用时需要导入）
// import { generatePlanningStageProgress, generateConstructionStageProgress, generateConfigurationStageProgress, generateVerificationStageProgress } from '../utils/mockDataHelpers';

// 为项目1添加详细的阶段进度数据（示例）
// 实际使用时，可以在项目初始化时调用这些函数生成阶段配置数据
export const exampleStageProgressData = {
  projectId: '1',
  stageConfigs: [
    {
      stageKey: 'planning',
      weight: 20,
      status: 'completed' as const,
      actualProgress: 100,
      taskProgress: [
        { taskId: 't1', taskName: '人员配置', completed: true, completedDate: '2024-01-20', remark: '已配置项目经理和工程师团队' },
        { taskId: 't2', taskName: '设备采购', completed: true, completedDate: '2024-01-25', remark: '采购完成' },
        { taskId: 't3', taskName: '工具准备', completed: true, completedDate: '2024-02-01', remark: '工具齐全' },
        { taskId: 't4', taskName: '技术方案确认', completed: true, completedDate: '2024-02-10', remark: '方案已确认' },
      ],
      remark: '准备阶段已完成',
      lastReportDate: '2024-02-10T10:00:00.000Z',
    },
    {
      stageKey: 'construction',
      weight: 40,
      status: 'in_progress' as const,
      actualProgress: 50,
      deviceProgress: [
        { deviceId: '1', deviceName: '注塑机-01', completed: true, completedDate: '2024-02-01' },
        { deviceId: '2', deviceName: '注塑机-02', completed: true, completedDate: '2024-02-01' },
        { deviceId: '3', deviceName: '装配机器人-01', completed: false },
        { deviceId: '4', deviceName: '装配机器人-02', completed: false },
      ],
      remark: '设备安装进行中，已完成2台设备',
      lastReportDate: '2024-02-05T14:30:00.000Z',
    },
    {
      stageKey: 'configuration',
      weight: 25,
      status: 'not_started' as const,
      actualProgress: 0,
      deviceProgress: [],
      remark: '',
    },
    {
      stageKey: 'verification',
      weight: 15,
      status: 'not_started' as const,
      actualProgress: 0,
      taskProgress: [
        { taskId: 'v1', taskName: '数据核对', completed: false },
        { taskId: 'v2', taskName: '准确性验证', completed: false },
        { taskId: 'v3', taskName: '完整性检查', completed: false },
      ],
      remark: '',
    },
  ],
};

// 导入Process类型
import { Process } from '../types/process';

// 模拟工序数据
export const mockProcesses: Process[] = [
  {
    id: 'process_1',
    name: '极板',
    projectId: '1',
    projectName: '智能制造车间数采',
    code: 'JB',
    sortOrder: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
  {
    id: 'process_2',
    name: '组装',
    projectId: '1',
    projectName: '智能制造车间数采',
    code: 'ZZ',
    sortOrder: 2,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
];

// 导入Workshop类型
import { Workshop } from '../types/workshop';

// 模拟车间数据
export const mockWorkshops: Workshop[] = [
  {
    id: 'workshop_1',
    name: '动力车间',
    projectId: '1',
    projectName: '智能制造车间数采',
    code: 'DL',
    description: '负责动力供应和能源管理',
    sortOrder: 1,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
  {
    id: 'workshop_2',
    name: '组装车间',
    projectId: '1',
    projectName: '智能制造车间数采',
    code: 'ZZ',
    description: '负责产品组装工序',
    sortOrder: 2,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
  {
    id: 'workshop_3',
    name: '包装车间',
    projectId: '1',
    projectName: '智能制造车间数采',
    code: 'BZ',
    description: '负责产品包装工序',
    sortOrder: 3,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
  },
];

// 导入DeviceResearch类型
import type { DeviceResearch } from '../types/device';

// 模拟设备调研数据
export const mockDeviceResearches: DeviceResearch[] = [
  {
    id: 'research_1',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '制带机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 2,
    deviceManufacturer: '东顺',
    basic: { deviceType: '制带机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 2, deviceManufacturer: '东顺' },
    controller: { controllerBrand: '西门子', controllerModel: 'S7 1500', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: '西门子' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_2',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '连冲机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 4,
    deviceManufacturer: '东顺',
    basic: { deviceType: '连冲机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 4, deviceManufacturer: '东顺' },
    controller: { controllerBrand: '魏德米勒', controllerModel: '魏德米勒', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: '西门子' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_3',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '连铸机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 3,
    deviceManufacturer: '衡远',
    basic: { deviceType: '连铸机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 3, deviceManufacturer: '衡远' },
    controller: { controllerBrand: '西门子', controllerModel: 'S7 1200', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'proface' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_4',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '球磨机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 7,
    deviceManufacturer: '三环',
    basic: { deviceType: '球磨机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 7, deviceManufacturer: '三环' },
    controller: { controllerBrand: '西门子', controllerModel: 'S7 200', interfaceType: 'serial', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'proface' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_5',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '球磨机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 7,
    deviceManufacturer: '金帆',
    basic: { deviceType: '球磨机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 7, deviceManufacturer: '金帆' },
    controller: { controllerBrand: '三菱', controllerModel: 'FX3U', interfaceType: 'serial', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'MCGS' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_6',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '球磨机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 1,
    deviceManufacturer: '金帆',
    basic: { deviceType: '球磨机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 1, deviceManufacturer: '金帆' },
    controller: { controllerBrand: '三菱', controllerModel: 'FX3U', interfaceType: 'serial', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'Fuji' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_7',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '铅粉称重',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 12,
    deviceManufacturer: '国产',
    basic: { deviceType: '铅粉称重', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 12, deviceManufacturer: '国产' },
    controller: { controllerBrand: 'tcp', controllerModel: 'TCP', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'TCP' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_8',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '连涂机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 9,
    deviceManufacturer: '东顺',
    basic: { deviceType: '连涂机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 9, deviceManufacturer: '东顺' },
    controller: { controllerBrand: '西门子', controllerModel: 'S7 1200', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: '西门子' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_9',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '收板机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 1,
    deviceManufacturer: '清时智能',
    basic: { deviceType: '收板机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 1, deviceManufacturer: '清时智能' },
    controller: { controllerBrand: '汇川', controllerModel: 'H5U', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: '汇川' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_10',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '收板机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 1,
    deviceManufacturer: '新东远',
    basic: { deviceType: '收板机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 1, deviceManufacturer: '新东远' },
    controller: { controllerBrand: '汇川', controllerModel: 'H5U', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: '汇川' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_11',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '合膏机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 8,
    deviceManufacturer: '三环',
    basic: { deviceType: '合膏机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 8, deviceManufacturer: '三环' },
    controller: { controllerBrand: '西门子', controllerModel: 'S7 200', interfaceType: 'serial', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'proface' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_12',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '合膏机',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 4,
    deviceManufacturer: '衡远',
    basic: { deviceType: '合膏机', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 4, deviceManufacturer: '衡远' },
    controller: { controllerBrand: '西门子', controllerModel: 'S7 1500', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'proface' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_13',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '固化室',
    workshop: '动力车间',
    processId: 'process_1',
    processName: '极板',
    quantity: 32,
    deviceManufacturer: '金帆',
    basic: { deviceType: '固化室', workshop: '动力车间', processId: 'process_1', processName: '极板', quantity: 32, deviceManufacturer: '金帆' },
    controller: { controllerBrand: '汇川', controllerModel: 'H2u', interfaceType: 'serial', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'MCGS' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_14',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '装槽机',
    workshop: '动力车间',
    processId: 'process_2',
    processName: '组装',
    quantity: 18,
    deviceManufacturer: '创为',
    basic: { deviceType: '装槽机', workshop: '动力车间', processId: 'process_2', processName: '组装', quantity: 18, deviceManufacturer: '创为' },
    controller: { controllerBrand: '信捷', controllerModel: 'XDH', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'MCGS' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_15',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '铸焊机',
    workshop: '动力车间',
    processId: 'process_2',
    processName: '组装',
    quantity: 9,
    deviceManufacturer: '海悦',
    basic: { deviceType: '铸焊机', workshop: '动力车间', processId: 'process_2', processName: '组装', quantity: 9, deviceManufacturer: '海悦' },
    controller: { controllerBrand: '欧姆龙', controllerModel: 'MX-ECC20M', interfaceType: 'network', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'MCGS' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
  {
    id: 'research_16',
    projectName: '智能制造车间数采',
    projectId: '1',
    deviceCode: '',
    deviceType: '铸焊机',
    workshop: '动力车间',
    processId: 'process_2',
    processName: '组装',
    quantity: 4,
    deviceManufacturer: '海悦',
    basic: { deviceType: '铸焊机', workshop: '动力车间', processId: 'process_2', processName: '组装', quantity: 4, deviceManufacturer: '海悦' },
    controller: { controllerBrand: '西门子', controllerModel: 's7 200', interfaceType: 'serial', isInterfaceOccupied: true, hasTouchScreen: true, touchScreenBrand: 'MCGS' },
    collection: {},
    basicCompleted: true,
    controllerCompleted: true,
    collectionCompleted: false,
    researchProgress: 66,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
  },
];
