/**
 * Taskora Pulse - Standard Enterprise Mock Data
 * Structured to strictly mirror Java Spring Boot JPA entities and DTO contracts.
 */

export const INITIAL_USERS = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah.pm@taskora.io',
    role: 'PROJECT_MANAGER',
    title: 'Lead Technical Project Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Engineering Operations',
    activeWorkload: 'OPTIMAL',
    assignedTasks: 3,
    completedTasks: 18,
    overdueTasks: 0,
    createdAt: '2026-01-15T09:30:00Z'
  },
  {
    id: 2,
    name: 'Alex Rivera',
    email: 'alex.dev@taskora.io',
    role: 'EMPLOYEE',
    title: 'Senior Full Stack Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Platform Engineering',
    activeWorkload: 'HEAVY',
    assignedTasks: 5,
    completedTasks: 24,
    overdueTasks: 1,
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'elena.admin@taskora.io',
    role: 'ADMIN',
    title: 'Chief Technology Officer / Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Executive Leadership',
    activeWorkload: 'OPTIMAL',
    assignedTasks: 2,
    completedTasks: 32,
    overdueTasks: 0,
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 4,
    name: 'Marcus Vance',
    email: 'marcus.qa@taskora.io',
    role: 'EMPLOYEE',
    title: 'QA Automation Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Quality Assurance',
    activeWorkload: 'OPTIMAL',
    assignedTasks: 3,
    completedTasks: 19,
    overdueTasks: 0,
    createdAt: '2026-03-10T11:00:00Z'
  },
  {
    id: 5,
    name: 'Devon Zhao',
    email: 'devon.pm@taskora.io',
    role: 'PROJECT_MANAGER',
    title: 'Product Delivery Manager',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    department: 'Product Delivery',
    activeWorkload: 'OPTIMAL',
    assignedTasks: 2,
    completedTasks: 14,
    overdueTasks: 0,
    createdAt: '2026-04-05T09:00:00Z'
  }
];

export const INITIAL_PROJECTS = [
  {
    id: 1,
    name: 'Cloud Architecture Modernization',
    key: 'CAM',
    description: 'Transition monolithic core services into highly scalable microservices orchestrated on AWS ECS and Kubernetes.',
    status: 'ACTIVE',
    priority: 'HIGH',
    startDate: '2026-08-01',
    dueDate: '2026-11-30',
    manager: INITIAL_USERS[0],
    memberIds: [1, 2, 4],
    createdAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 2,
    name: 'Taskora Pulse Mobile App V2',
    key: 'TPM',
    description: 'Build native iOS and Android companion applications featuring offline caching, biometric login, and push notifications.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    startDate: '2026-09-01',
    dueDate: '2026-12-15',
    manager: INITIAL_USERS[0],
    memberIds: [1, 2, 4, 5],
    createdAt: '2026-09-01T09:00:00Z'
  },
  {
    id: 3,
    name: 'Enterprise Security & SOC2 Compliance',
    key: 'SEC',
    description: 'Implement audit logging, role-based encryption at rest, SAML 2.0 single sign-on, and automated intrusion scans.',
    status: 'PLANNING',
    priority: 'HIGH',
    startDate: '2026-10-15',
    dueDate: '2027-02-28',
    manager: INITIAL_USERS[4],
    memberIds: [3, 4, 5],
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 4,
    name: 'Real-time WebSocket Notification Mesh',
    key: 'NOTIF',
    description: 'High-throughput event delivery pipeline using Spring WebFlux and STOMP over WebSockets.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    startDate: '2026-07-01',
    dueDate: '2026-09-20',
    manager: INITIAL_USERS[0],
    memberIds: [1, 2],
    createdAt: '2026-07-01T08:30:00Z'
  }
];

export const INITIAL_TASKS = [
  {
    id: 101,
    taskCode: 'CAM-01',
    title: 'Provision AWS VPC and Security Subnets',
    description: 'Set up multi-AZ VPC, public and private subnets, NAT gateways, and least-privilege security groups via Terraform.',
    status: 'COMPLETED',
    priority: 'HIGH',
    projectId: 1,
    projectName: 'Cloud Architecture Modernization',
    assignee: INITIAL_USERS[1], // Alex
    startDate: '2026-08-05',
    dueDate: '2026-08-20',
    estimatedHours: 24,
    spentHours: 22,
    dependencyIds: [],
    dependencyTitles: [],
    createdAt: '2026-08-05T09:00:00Z'
  },
  {
    id: 102,
    taskCode: 'CAM-02',
    title: 'Deploy Redis Distributed Caching Cluster',
    description: 'Configure AWS ElastiCache cluster with multi-AZ failover and automated cache invalidation hooks in Spring Boot.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    projectId: 1,
    projectName: 'Cloud Architecture Modernization',
    assignee: INITIAL_USERS[1], // Alex
    startDate: '2026-10-01',
    dueDate: '2026-10-16', // Due in 2 days
    estimatedHours: 16,
    spentHours: 12,
    dependencyIds: [101],
    dependencyTitles: ['CAM-01: Provision AWS VPC and Security Subnets'],
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 103,
    taskCode: 'CAM-03',
    title: 'Database Read Replica Setup & Query Offloading',
    description: 'Configure Aurora PostgreSQL read replicas and configure Spring Data JPA routing datasource for read-heavy endpoints.',
    status: 'TO_DO',
    priority: 'CRITICAL',
    projectId: 1,
    projectName: 'Cloud Architecture Modernization',
    assignee: INITIAL_USERS[1], // Alex
    startDate: '2026-10-10',
    dueDate: '2026-10-17', // Due in 3 days, blocked by CAM-02!
    estimatedHours: 20,
    spentHours: 2,
    dependencyIds: [102],
    dependencyTitles: ['CAM-02: Deploy Redis Distributed Caching Cluster'],
    createdAt: '2026-10-10T08:00:00Z'
  },
  {
    id: 104,
    taskCode: 'CAM-04',
    title: 'Load Testing and Failover Stress Benchmarking',
    description: 'Execute Gatling load tests simulating 15,000 concurrent active users and verify auto-scaling response times.',
    status: 'TO_DO',
    priority: 'MEDIUM',
    projectId: 1,
    projectName: 'Cloud Architecture Modernization',
    assignee: INITIAL_USERS[3], // Marcus
    startDate: '2026-10-20',
    dueDate: '2026-11-05',
    estimatedHours: 18,
    spentHours: 0,
    dependencyIds: [103],
    dependencyTitles: ['CAM-03: Database Read Replica Setup'],
    createdAt: '2026-10-12T14:00:00Z'
  },
  {
    id: 201,
    taskCode: 'TPM-01',
    title: 'Design Dark Theme Tokens and Mobile UI Components',
    description: 'Create pixel-perfect Figma design tokens and implement React Native shared components for mobile.',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    projectId: 2,
    projectName: 'Taskora Pulse Mobile App V2',
    assignee: INITIAL_USERS[0], // Sarah
    startDate: '2026-09-10',
    dueDate: '2026-10-15', // Due tomorrow
    estimatedHours: 30,
    spentHours: 28,
    dependencyIds: [],
    dependencyTitles: [],
    createdAt: '2026-09-10T11:00:00Z'
  },
  {
    id: 202,
    taskCode: 'TPM-02',
    title: 'Implement Biometric Authentication & Keyring Storage',
    description: 'Secure biometric login using FaceID / TouchID / Android BiometricPrompt with secure hardware enclave.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    projectId: 2,
    projectName: 'Taskora Pulse Mobile App V2',
    assignee: INITIAL_USERS[1], // Alex
    startDate: '2026-09-25',
    dueDate: '2026-10-12', // OVERDUE by 2 days!
    estimatedHours: 25,
    spentHours: 18,
    dependencyIds: [201],
    dependencyTitles: ['TPM-01: Design Dark Theme Tokens'],
    createdAt: '2026-09-25T13:00:00Z'
  },
  {
    id: 301,
    taskCode: 'SEC-01',
    title: 'Audit Spring Security Filter Chain & JWT Rotation',
    description: 'Perform penetration test on JWT token revocation, CSRF headers, and CORS restrictions.',
    status: 'TO_DO',
    priority: 'HIGH',
    projectId: 3,
    projectName: 'Enterprise Security & SOC2 Compliance',
    assignee: INITIAL_USERS[2], // Elena
    startDate: '2026-10-16',
    dueDate: '2026-10-31',
    estimatedHours: 16,
    spentHours: 0,
    dependencyIds: [],
    dependencyTitles: [],
    createdAt: '2026-10-12T16:00:00Z'
  },
  {
    id: 401,
    taskCode: 'NOTIF-01',
    title: 'Implement STOMP Broker & RabbitMQ Fallback',
    description: 'Full duplex communication channel configured and load tested across 5 cluster nodes.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    projectId: 4,
    projectName: 'Real-time WebSocket Notification Mesh',
    assignee: INITIAL_USERS[1],
    startDate: '2026-07-10',
    dueDate: '2026-08-01',
    estimatedHours: 40,
    spentHours: 38,
    dependencyIds: [],
    dependencyTitles: [],
    createdAt: '2026-07-10T10:00:00Z'
  }
];

export const INITIAL_COMMENTS = [
  {
    id: 1,
    taskId: 102,
    user: INITIAL_USERS[0],
    content: 'Alex, ensure we test failover replication when the primary Redis shard is terminated.',
    createdAt: '2026-10-13T14:20:00Z'
  },
  {
    id: 2,
    taskId: 102,
    user: INITIAL_USERS[1],
    content: 'Running the chaos test now. Latency stayed below 4.5ms during failover.',
    createdAt: '2026-10-14T09:15:00Z'
  },
  {
    id: 3,
    taskId: 202,
    user: INITIAL_USERS[3],
    content: 'Biometric prompt is passing all automated unit checks on iOS 17 Simulator. Testing Samsung Galaxy S23 now.',
    createdAt: '2026-10-13T16:45:00Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    userId: 2,
    title: 'Overdue Deadline Alert',
    message: 'Task TPM-02 (Implement Biometric Authentication) is 2 days overdue.',
    type: 'ALERT',
    isRead: false,
    link: '/tasks',
    createdAt: '2026-10-14T08:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    title: 'New Comment Mention',
    message: 'Sarah Connor commented on task CAM-02: Deploy Redis Distributed Caching Cluster.',
    type: 'MENTION',
    isRead: false,
    link: '/tasks',
    createdAt: '2026-10-13T14:20:00Z'
  },
  {
    id: 3,
    userId: 1,
    title: 'Project Milestone',
    message: 'Cloud Architecture Modernization reached 66% completion.',
    type: 'PROJECT',
    isRead: true,
    link: '/projects/1',
    createdAt: '2026-10-12T17:00:00Z'
  },
  {
    id: 4,
    userId: 3,
    title: 'Security Scan Completed',
    message: 'Weekly automated dependency audit passed with 0 high CVEs.',
    type: 'SYSTEM',
    isRead: true,
    link: '/insights',
    createdAt: '2026-10-11T09:00:00Z'
  }
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: 1,
    user: INITIAL_USERS[1],
    action: 'UPDATED_STATUS',
    target: 'Task CAM-01',
    detail: 'Moved status from IN_PROGRESS to COMPLETED',
    projectId: 1,
    timestamp: '2026-10-14T10:30:00Z'
  },
  {
    id: 2,
    user: INITIAL_USERS[0],
    action: 'COMMENTED',
    target: 'Task CAM-02',
    detail: 'Added feedback on failover replication verification',
    projectId: 1,
    timestamp: '2026-10-13T14:20:00Z'
  },
  {
    id: 3,
    user: INITIAL_USERS[2],
    action: 'CREATED_PROJECT',
    target: 'Enterprise Security & SOC2 Compliance',
    detail: 'Created new project under Planning status',
    projectId: 3,
    timestamp: '2026-10-12T16:00:00Z'
  },
  {
    id: 4,
    user: INITIAL_USERS[3],
    action: 'ATTACHED_FILE',
    target: 'Task TPM-02',
    detail: 'Uploaded biometric_test_matrix_v1.pdf (2.4 MB)',
    projectId: 2,
    timestamp: '2026-10-11T11:45:00Z'
  }
];
