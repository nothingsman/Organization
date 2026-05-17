import { School, Branch, Admin } from './types';

export const MOCK_SCHOOLS: School[] = [
  {
    id: '1',
    name: 'St. Andrews Excellence Academy',
    logo: 'https://picsum.photos/seed/school1/800/600',
    location: 'United Kingdom',
    studentCount: 1200,
    staffCount: 150,
    description: 'A leading institution focused on academic excellence and holistic development since 1920.',
    website: 'https://standrews.edu'
  },
  {
    id: '2',
    name: 'Global International School',
    logo: 'https://picsum.photos/seed/school2/800/600',
    location: 'Canada',
    studentCount: 850,
    staffCount: 95,
    description: 'Fostering global citizenship and innovation through a diverse IB curriculum.',
    website: 'https://globalinternational.ca'
  },
  {
    id: '3',
    name: 'Metropolitan Tech High',
    logo: 'https://picsum.photos/seed/school3/800/600',
    location: 'United States',
    studentCount: 2100,
    staffCount: 220,
    description: 'Empowering the next generation of engineers and technology leaders.',
    website: 'https://metrotech.edu'
  }
];

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'b1',
    schoolId: '1',
    name: 'North Campus',
    address: '123 Education Way',
    city: 'London',
    studentCount: 450,
    teacherCount: 50,
    capacity: 500,
    performance: [82, 85, 88, 91, 90, 94]
  },
  {
    id: 'b2',
    schoolId: '1',
    name: 'West Hills',
    address: '45 Scholar Road',
    city: 'Manchester',
    studentCount: 380,
    teacherCount: 42,
    capacity: 400,
    performance: [78, 80, 82, 81, 84, 85]
  },
  {
    id: 'b3',
    schoolId: '2',
    name: 'Toronto Central',
    address: '88 Maple Ave',
    city: 'Toronto',
    studentCount: 600,
    teacherCount: 70,
    capacity: 650,
    performance: [85, 88, 87, 89, 92, 91]
  }
];

export const MOCK_ADMINS: Admin[] = [
  {
    id: 'a1',
    branchId: 'b1',
    name: 'Sarah Jenkins',
    role: 'Principal',
    status: 'active',
    email: 's.jenkins@standrews.edu'
  },
  {
    id: 'a2',
    branchId: 'b1',
    name: 'Mark Thompson',
    role: 'Vice Principal',
    status: 'active',
    email: 'm.thompson@standrews.edu'
  },
  {
    id: 'a3',
    branchId: 'b2',
    name: 'Linda Wu',
    role: 'Branch Manager',
    status: 'inactive',
    email: 'l.wu@standrews.edu'
  }
];
