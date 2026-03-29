require('dotenv').config();
const mongoose = require('mongoose');
const User   = require('../models/User');
const Ticket = require('../models/Ticket');
const { Comment, Notification, AuditLog } = require('../models/index');

const connectDB = require('../config/database');

const USERS_DATA = [
  { name: 'Sarah Johnson',   email: 'sarah@company.com',  password: 'password123', role: 'employee',   department: 'Marketing' },
  { name: 'Michael Chen',    email: 'mike@company.com',   password: 'password123', role: 'employee',   department: 'Finance' },
  { name: 'Lindiwe Dube',    email: 'lindi@company.com',  password: 'password123', role: 'employee',   department: 'HR' },
  { name: 'Nomsa Khumalo',   email: 'nomsa@company.com',  password: 'password123', role: 'employee',   department: 'Sales' },
  { name: 'Alex Rivera',     email: 'alex@company.com',   password: 'password123', role: 'technician', department: 'IT' },
  { name: 'Priya Nair',      email: 'priya@company.com',  password: 'password123', role: 'technician', department: 'IT' },
  { name: 'David Mokoena',   email: 'david@company.com',  password: 'password123', role: 'admin',      department: 'IT' },
];

const TICKET_TEMPLATES = [
  {
    title: 'Laptop will not turn on',
    description: 'My laptop completely stopped responding this morning. No power light, no fan sound. I have a client presentation in 2 hours and urgently need it working.',
    category: 'Hardware', priority: 'Urgent', status: 'In Progress',
    location: 'Floor 2, Desk 14',
    comments: [
      { role: 'technician', content: 'Hi, I am on my way to your desk now. This looks like a dead battery or failed power adapter. Will bring spares.', isInternal: false },
      { role: 'technician', content: 'Internal: Swapped adapter — confirmed the original adapter is faulty. Ordering replacement.', isInternal: true },
    ]
  },
  {
    title: 'Cannot access the shared marketing drive',
    description: 'Since yesterday afternoon I cannot access the Marketing shared drive at //FILESERVER/Marketing. Error says Access Denied. I have not changed any settings on my end.',
    category: 'Account/Access', priority: 'High', status: 'Open',
    location: 'Floor 1, Desk 5',
    comments: []
  },
  {
    title: 'Outlook crashes after a few minutes',
    description: 'Microsoft Outlook crashes about 5 minutes after I open it. This started after the Windows update on Monday. I reinstalled Office but the problem continues. Very urgent as I cannot receive emails.',
    category: 'Software', priority: 'Medium', status: 'Open',
    location: 'Floor 2, Desk 14',
    comments: []
  },
  {
    title: 'Printer in meeting room 3B is offline',
    description: 'The HP LaserJet in meeting room 3B shows as offline. Cannot print from any computer in the building. Important board meeting tomorrow morning needs it working.',
    category: 'Hardware', priority: 'Low', status: 'Resolved',
    location: 'Meeting Room 3B',
    resolution: 'Found a paper jam deep inside the fuser unit. Cleared the jam and ran 10 test pages successfully. Printer is back online.',
    comments: [
      { role: 'technician', content: 'Found a paper jam deep inside the fuser unit. Cleared it and ran test prints — all working now!', isInternal: false },
    ]
  },
  {
    title: 'Internet extremely slow on entire Floor 2',
    description: 'All staff on Floor 2 reporting very slow internet since this morning. Video calls keep dropping and web pages are timing out. This is affecting the entire floor, not just one machine.',
    category: 'Network', priority: 'Urgent', status: 'In Progress',
    location: 'Floor 2',
    comments: [
      { role: 'technician', content: 'Investigating switch SW-FLOOR2. Seeing abnormal traffic patterns — possible broadcast storm from a misconfigured device.', isInternal: false },
      { role: 'technician', content: 'Internal: Port 14 on SW-FLOOR2 is the culprit. The NIC on the workstation at Desk 14 is flooding the network. Will replace after hours.', isInternal: true },
    ]
  },
  {
    title: 'Locked out of Windows — too many password attempts',
    description: 'I entered my password incorrectly too many times and my account is now locked. I cannot log into my computer at all.',
    category: 'Account/Access', priority: 'High', status: 'Closed',
    location: 'Floor 1, Desk 5',
    resolution: 'Reset user account via Active Directory console. Sent temporary password via SMS. User confirmed login successful.',
    comments: [
      { role: 'technician', content: 'Password reset via Active Directory. Temporary password sent via SMS. Please change it on next login.', isInternal: false },
    ]
  },
  {
    title: 'Need Adobe Acrobat Pro installed',
    description: 'I need Adobe Acrobat Pro installed on my machine to review and digitally sign contracts. My line manager has already approved this request (approval ref: MGMT-2024-045).',
    category: 'Software', priority: 'Medium', status: 'On Hold',
    location: 'Floor 3, Desk 2',
    comments: [
      { role: 'technician', content: 'Ticket placed on hold pending procurement approval for the Adobe license. Escalated to IT Admin.', isInternal: false },
    ]
  },
  {
    title: 'VPN not connecting from home',
    description: 'I cannot connect to the company VPN from my home laptop. Error message says Authentication failed. It was working fine last week. I need access to work on a confidential report from home today.',
    category: 'Network', priority: 'High', status: 'Open',
    location: 'Remote / Work from Home',
    comments: []
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Ticket.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = await User.create(USERS_DATA);
    console.log(`✅ Created ${createdUsers.length} users`);

    const employees   = createdUsers.filter(u => u.role === 'employee');
    const technicians = createdUsers.filter(u => u.role === 'technician');
    const admin       = createdUsers.find(u => u.role === 'admin');

    // Create tickets
    let ticketCount = 0;
    for (const [i, tmpl] of TICKET_TEMPLATES.entries()) {
      const submitter = employees[i % employees.length];
      const tech      = tmpl.status !== 'Open' ? technicians[i % technicians.length] : null;

      const statusHistory = [
        { status: 'Open', changedBy: submitter._id, changedAt: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000) }
      ];
      if (tech && tmpl.status !== 'Open') {
        statusHistory.push({
          status: tmpl.status, changedBy: tech._id,
          changedAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000)
        });
      }

      const ticket = await Ticket.create({
        title: tmpl.title,
        description: tmpl.description,
        category: tmpl.category,
        priority: tmpl.priority,
        status: tmpl.status,
        submittedBy: submitter._id,
        assignedTo: tech ? tech._id : null,
        location: tmpl.location,
        resolutionNotes: tmpl.resolution || '',
        statusHistory,
        createdAt: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000),
      });

      // Create audit log for ticket creation
      await AuditLog.create({
        action: 'ticket_created',
        performedBy: submitter._id,
        ticket: ticket._id,
        description: `Ticket ${ticket.ticketId} created: "${ticket.title}"`,
        createdAt: ticket.createdAt,
      });

      // Create comments
      for (const cmtTmpl of (tmpl.comments || [])) {
        const author = cmtTmpl.role === 'technician' ? (tech || technicians[0]) : submitter;
        await Comment.create({
          ticket: ticket._id,
          author: author._id,
          content: cmtTmpl.content,
          isInternal: cmtTmpl.isInternal || false,
          createdAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        });
        await AuditLog.create({
          action: 'comment_added',
          performedBy: author._id,
          ticket: ticket._id,
          description: `${cmtTmpl.isInternal ? 'Internal note' : 'Comment'} added to ticket ${ticket.ticketId}`,
          createdAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        });
      }

      // Notification for submitter
      await Notification.create({
        recipient: submitter._id,
        type: 'ticket_created',
        title: 'Ticket Submitted',
        message: `Your ticket ${ticket.ticketId} has been submitted successfully.`,
        ticket: ticket._id,
        isRead: i > 2,
        createdAt: ticket.createdAt,
      });

      ticketCount++;
    }

    console.log(`✅ Created ${ticketCount} tickets with comments and audit logs`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login credentials:');
    USERS_DATA.forEach(u => {
      const roleLabel = u.role.padEnd(11);
      console.log(`  ${roleLabel}  ${u.email.padEnd(25)}  password: ${u.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
