import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import { db } from './firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

import {
  startReport,
  getReport,
  clearReport,
  reportTypeKeyboard,
  locationKeyboard,
  photoKeyboard,
  confirmationKeyboard,
  createReportId,
  removeKeyboard,
} from './bot/report.js';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing from .env');
}

const bot = new Telegraf(token);

// --------------------------------------------------
// MAIN MENU
// --------------------------------------------------

function mainMenu() {
  return Markup.keyboard([
    ['Report an Incident'],
    ['Request Help'],
    ['Find Nearby Help'],
    ['My Requests'],
  ])
    .resize()
    .persistent();
}

// --------------------------------------------------
// START
// --------------------------------------------------

bot.start(async (ctx) => {
  clearReport(ctx.chat.id);

  await ctx.reply(
    `Welcome to ZIVA.

Verified disaster information and emergency assistance.

What do you need?`,
    mainMenu()
  );
});

// --------------------------------------------------
// REPORT AN INCIDENT
// --------------------------------------------------

bot.hears('Report an Incident', async (ctx) => {
  startReport(ctx.chat.id);

  await ctx.reply(
    `Let's report what happened.

What type of incident are you reporting?`,
    reportTypeKeyboard()
  );
});

// --------------------------------------------------
// INCIDENT TYPE
// --------------------------------------------------

bot.hears(
  [
    'Flood',
    'Road Blocked',
    'Fire',
    'Medical Emergency',
    'Building Damage',
    'Other',
  ],
  async (ctx) => {
    const report = getReport(ctx.chat.id);

    if (!report || report.step !== 'type') {
      return;
    }

    report.type = ctx.message.text;
    report.step = 'location';

    await ctx.reply(
      `Got it: ${report.type}

Where is the incident?

Please share the location of the incident.`,
      locationKeyboard()
    );
  }
);

// --------------------------------------------------
// LOCATION
// --------------------------------------------------

bot.on('location', async (ctx) => {
  const report = getReport(ctx.chat.id);

  if (!report || report.step !== 'location') {
    return;
  }

  report.latitude = ctx.message.location.latitude;
  report.longitude = ctx.message.location.longitude;
  report.step = 'description';

  await ctx.reply(
    `Location received.

Now briefly describe what is happening.

For example:
"Water has entered several houses."`,
    removeKeyboard()
  );
});

// --------------------------------------------------
// DESCRIPTION
// --------------------------------------------------

bot.on('text', async (ctx, next) => {
  const report = getReport(ctx.chat.id);

  if (!report || report.step !== 'description') {
    return next();
  }

  const text = ctx.message.text.trim();

  if (!text) {
    await ctx.reply('Please enter a short description.');
    return;
  }

  report.description = text;
  report.step = 'photo';

  await ctx.reply(
    `Description received.

Would you like to add a photo as evidence?`,
    photoKeyboard()
  );
});

// --------------------------------------------------
// PHOTO SKIP
// --------------------------------------------------

bot.hears('Skip Photo', async (ctx) => {
  const report = getReport(ctx.chat.id);

  if (!report || report.step !== 'photo') {
    return;
  }

  report.step = 'confirm';

  await showReportPreview(ctx);
});

// --------------------------------------------------
// PHOTO
// --------------------------------------------------

bot.on('photo', async (ctx) => {
  const report = getReport(ctx.chat.id);

  if (!report || report.step !== 'photo') {
    return;
  }

  const photos = ctx.message.photo;

  // Telegram provides several resolutions.
  // The last one is normally the highest resolution.
  const largestPhoto = photos[photos.length - 1];

  if (largestPhoto) {
    report.photoId = largestPhoto.file_id;
  }

  report.step = 'confirm';

  await showReportPreview(ctx);
});

// --------------------------------------------------
// REPORT PREVIEW
// --------------------------------------------------

async function showReportPreview(ctx: any) {
  const report = getReport(ctx.chat.id);

  if (!report) {
    return;
  }

  const photoStatus = report.photoId
    ? 'Photo attached'
    : 'No photo';

  await ctx.reply(
    `REVIEW YOUR REPORT

Incident
${report.type}

Location
${report.latitude?.toFixed(6)}, ${report.longitude?.toFixed(6)}

Description
${report.description}

Evidence
${photoStatus}

Status
UNVERIFIED

Submit this report?`,
    confirmationKeyboard()
  );
}

// --------------------------------------------------
// SUBMIT REPORT
// --------------------------------------------------

bot.hears('Submit Report', async (ctx) => {
  console.log('SUBMIT REPORT BUTTON PRESSED');
  const report = getReport(ctx.chat.id);

  if (!report || report.step !== 'confirm') {
    return;
  }

  const reportId = createReportId();

  try {
    // Save the report to Firestore
    await db.collection('reports').doc(reportId).set({
      reportId,

      // What happened
      type: report.type,
      description: report.description,

      // Location
      latitude: report.latitude,
      longitude: report.longitude,

      // Evidence
      photoId: report.photoId ?? null,

      // ZIVA verification state
      verificationStatus: 'UNVERIFIED',

      // Report lifecycle
      status: 'SUBMITTED',

      // Source
      source: 'TELEGRAM',

      // Citizen reference
      telegramUserId: String(ctx.from.id),

      // Server timestamps
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log('--------------------------------');
    console.log('NEW ZIVA REPORT');
    console.log('Report ID:', reportId);
    console.log('Type:', report.type);
    console.log('Latitude:', report.latitude);
    console.log('Longitude:', report.longitude);
    console.log('Description:', report.description);
    console.log('Photo:', report.photoId ? 'YES' : 'NO');
    console.log('Status: UNVERIFIED');
    console.log('Saved to Firestore: YES');
    console.log('--------------------------------');

    clearReport(ctx.chat.id);

    await ctx.reply(
      `REPORT SUBMITTED

Report ID
${reportId}

Status
UNVERIFIED

Your report has been recorded and can now be reviewed by ZIVA coordinators.

Please keep your Report ID for tracking.`,
      mainMenu()
    );

  } catch (error) {
    console.error('Failed to save ZIVA report:', error);

    await ctx.reply(
      `We could not save your report right now.

Please try submitting it again.`,
      confirmationKeyboard()
    );
  }
});

// --------------------------------------------------
// CANCEL
// --------------------------------------------------


bot.hears('Cancel', async (ctx) => {
  clearReport(ctx.chat.id);

  await ctx.reply(
    `Report cancelled.

What do you need?`,
    mainMenu()
  );
});

// --------------------------------------------------
// REQUEST HELP
// Temporary placeholder — we'll build this next.
// --------------------------------------------------

bot.hears('Request Help', async (ctx) => {
  await ctx.reply(
    `Request Help

This part of ZIVA is coming next.

For now, please use Report an Incident.`,
    mainMenu()
  );
});

// --------------------------------------------------
// FIND NEARBY HELP
// --------------------------------------------------

bot.hears('Find Nearby Help', async (ctx) => {
  await ctx.reply(
    'Please share your location so ZIVA can find nearby assistance.',
    Markup.keyboard([
      [Markup.button.locationRequest('Share My Location')],
      ['Back'],
    ]).resize()
  );
});

// --------------------------------------------------
// MY REQUESTS
// Temporary placeholder
// --------------------------------------------------

bot.hears('My Requests', async (ctx) => {
  await ctx.reply(
    'You do not have any active requests yet.',
    mainMenu()
  );
});

// --------------------------------------------------
// BACK
// --------------------------------------------------

bot.hears('Back', async (ctx) => {
  clearReport(ctx.chat.id);

  await ctx.reply(
    'What do you need?',
    mainMenu()
  );
});

// --------------------------------------------------
// START BOT
// --------------------------------------------------

bot.launch();

console.log('ZIVA Telegram bot is running.');