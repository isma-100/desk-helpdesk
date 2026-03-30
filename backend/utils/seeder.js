require('dotenv').config();
const mongoose = require('mongoose');

// ─── CONNECT FIRST, THEN SEED ────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\n❌ ERROR: MONGO_URI is not set!');
  console.error('Run the command like this:\n');
  console.error('  Windows PowerShell:');
  console.error('  $env:MONGO_URI="your-connection-string"; node utils/seeder.js\n');
  console.error('  Mac/Linux:');
  console.error('  MONGO_URI="your-connection-string" node utils/seeder.js\n');
  process.exit(1);
}

console.log('\n🔌 Connecting to MongoDB...');
console.log('   URI:', MONGO_URI.replace(/:([^@]+)@/, ':****@')); // hide password in logs

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected!\n');
  runSeed();
})
.catch((err) => {
  console.error('\n❌ Connection failed:', err.message);
  console.error('\n── TROUBLESHOOTING GUIDE ──────────────────────────');
  console.error('');
  console.error('If you see "ECONNREFUSED" or "querySrv":');
  console.error('');
  console.error('Step 1: Go to https://cloud.mongodb.com');
  console.error('Step 2: Left menu → "Network Access"');
  console.error('Step 3: Click "Add IP Address"');
  console.error('Step 4: Click "Allow Access from Anywhere" (0.0.0.0/0)');
  console.error('Step 5: Click "Confirm" and wait 1 minute');
  console.error('Step 6: Try this command again');
  console.error('');
  console.error('If problem continues, your ISP/network may block');
  console.error('MongoDB port 27017. Try:');
  console.error('  - Turn off VPN if you have one');
  console.error('  - Try a mobile hotspot instead of WiFi');
  console.error('  - Try from a different network');
  console.error('───────────────────────────────────────────────────\n');
  process.exit(1);
});

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const User   = require('../models/User');
const Ticket = require('../models/Ticket');
const { Comment, Notification, AuditLog } = require('../models/index');

const USERS_DATA = [
  { name: 'Sarah Johnson',  email: 'sarah@company.com',  password: 'password123', role: 'employee',   department: 'Marketing' },
  { name: 'Michael Chen',   email: 'mike@company.com',   password: 'password123', role: 'employee',   department: 'Finance' },
  { name: 'Lindiwe Dube',   email: 'lindi@company.com',  password: 'password123', role: 'employee',   department: 'HR' },
  { name: 'Nomsa Khumalo',  email: 'nomsa@company.com',  password: 'password123', role: 'employee',   department: 'Sales' },
  { name: 'Alex Rivera',    email: 'alex@company.com',   password: 'password123', role: 'technician', department: 'IT' },
  { name: 'Priya Nair',     email: 'priya@company.com',  password: 'password123', role: 'technician', department: 'IT' },
  { name: 'David Mokoena',  email: 'david@company.com',  password: 'password123', role: 'admin',      department: 'IT' },
];

async function runSeed() {
  try {
    console.log('🌱 Starting database seed...\n');

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
    const admin       = createdUsers.find(u  => u.role === 'admin');

    // Ticket templates
    const TICKETS = [
      {
        title: 'Laptop will not turn on',
        description: 'My laptop completely stopped responding this morning. No power light, no fan sound. I have a client presentation in 2 hours and urgently need it working.',
        category: 'Hardware', priority: 'Urgent', status: 'In Progress',
        subIdx: 0, techIdx: 0, location: 'Floor 2, Desk 14',
        comment: { text: 'Hi Sarah, on my way to your desk now. Checking power adapter and battery.', internal: false },
      },
      {
        title: 'Cannot access shared drive',
        description: 'Since yesterday I cannot access the Marketing shared drive. Error says Access Denied.',
        category: 'Account/Access', priority: 'High', status: 'Open',
        subIdx: 1, techIdx: null, location: 'Floor 1, Desk 5',
      },
      {
        title: 'Outlook crashes after a few minutes',
        description: 'Outlook crashes about 5 minutes after opening. Started after Monday Windows update. Reinstalled Office but still happens.',
        category: 'Software', priority: 'Medium', status: 'Open',
        subIdx: 0, techIdx: null, location: 'Floor 2, Desk 14',
      },
      {
        title: 'Printer in meeting room 3B offline',
        description: 'HP LaserJet in meeting room 3B shows offline. Cannot print from any computer.',
        category: 'Hardware', priority: 'Low', status: 'Resolved',
        subIdx: 1, techIdx: 1, location: 'Meeting Room 3B',
        resolution: 'Cleared paper jam from fuser unit. Printer back online.',
        comment: { text: 'Found a paper jam deep in the fuser unit. Cleared it — all working now!', internal: false },
      },
      {
        title: 'Internet very slow on Floor 2',
        description: 'All staff on Floor 2 reporting very slow internet since this morning. Video calls keep dropping.',
        category: 'Network', priority: 'Urgent', status: 'In Progress',
        subIdx: 2, techIdx: 0, location: 'Floor 2',
        comment: { text: 'Investigating switch SW-FLOOR2. Broadcast storm from misconfigured device.', internal: false },
      },
      {
        title: 'Locked out of Windows account',
        description: 'Too many incorrect password attempts. Account is now locked. Cannot log in at all.',
        category: 'Account/Access', priority: 'High', status: 'Closed',
        subIdx: 1, techIdx: 1, location: 'Floor 1, Desk 5',
        resolution: 'Reset via Active Directory. User confirmed access restored.',
        comment: { text: 'Password reset via Active Directory. Temp password sent via SMS.', internal: false },
      },
      {
        title: 'Need Adobe Acrobat Pro installed',
        description: 'Need Adobe Acrobat Pro to review and digitally sign contracts. Manager approved.',
        category: 'Software', priority: 'Medium', status: 'On Hold',
        subIdx: 2, techIdx: 1, location: 'Floor 3, Desk 2',
        comment: { text: 'On hold pending procurement approval for the Adobe license.', internal: false },
      },
      {
        title: 'VPN not connecting from home',
        description: 'Cannot connect to company VPN from home laptop. Error: Authentication failed. Was working last week.',
        category: 'Network', priority: 'High', status: 'Open',
        subIdx: 0, techIdx: null, location: 'Remote / Work from Home',
      },
    ];

    let ticketCount = 0;
    for (const [i, tmpl] of TICKETS.entries()) {
      const submitter = employees[tmpl.subIdx] || employees[0];
      const tech      = tmpl.techIdx !== null ? technicians[tmpl.techIdx] : null;

      const statusHistory = [
        { status: 'Open', changedBy: submitter._id, changedAt: new Date(Date.now() - (8-i) * 24*60*60*1000) }
      ];
      if (tech && tmpl.status !== 'Open') {
        statusHistory.push({
          status: tmpl.status,
          changedBy: tech._id,
          changedAt: new Date(Date.now() - (7-i) * 24*60*60*1000)
        });
      }

      const ticket = await Ticket.create({
        title:          tmpl.title,
        description:    tmpl.description,
        category:       tmpl.category,
        priority:       tmpl.priority,
        status:         tmpl.status,
        submittedBy:    submitter._id,
        assignedTo:     tech ? tech._id : null,
        location:       tmpl.location,
        resolutionNotes: tmpl.resolution || '',
        statusHistory,
        createdAt: new Date(Date.now() - (8-i) * 24*60*60*1000),
      });

      await AuditLog.create({
        action:      'ticket_created',
        performedBy: submitter._id,
        ticket:      ticket._id,
        description: `Ticket ${ticket.ticketId} created: "${ticket.title}"`,
        createdAt:   ticket.createdAt,
      });

      if (tmpl.comment && tech) {
        await Comment.create({
          ticket:     ticket._id,
          author:     tech._id,
          content:    tmpl.comment.text,
          isInternal: tmpl.comment.internal || false,
          createdAt:  new Date(Date.now() - (6-i) * 24*60*60*1000),
        });
      }

      await Notification.create({
        recipient: submitter._id,
        type:      'ticket_created',
        title:     'Ticket Submitted',
        message:   `Your ticket ${ticket.ticketId} has been submitted successfully.`,
        ticket:    ticket._id,
        isRead:    i > 2,
        createdAt: ticket.createdAt,
      });

      ticketCount++;
    }

    console.log(`✅ Created ${ticketCount} tickets with comments and notifications`);
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('─────────────────────────────────────────────');
    console.log('  Login credentials:');
    USERS_DATA.forEach(u => {
      const role = u.role.padEnd(11);
      const email = u.email.padEnd(26);
      console.log(`  ${role}  ${email}  password123`);
    });
    console.log('─────────────────────────────────────────────\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Seed error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}
