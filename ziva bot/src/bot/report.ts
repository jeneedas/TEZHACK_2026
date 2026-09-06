import { Markup } from 'telegraf';

type ReportState = {
  step: 'type' | 'location' | 'description' | 'photo' | 'confirm';
  type?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  photoId?: string;
};

const reports = new Map<number, ReportState>();

export function startReport(chatId: number) {
  reports.set(chatId, {
    step: 'type',
  });
}

export function getReport(chatId: number) {
  return reports.get(chatId);
}

export function clearReport(chatId: number) {
  reports.delete(chatId);
}

export function reportTypeKeyboard() {
  return Markup.keyboard([
    ['Flood', 'Road Blocked'],
    ['Fire', 'Medical Emergency'],
    ['Building Damage', 'Other'],
    ['Cancel'],
  ]).resize();
}

export function locationKeyboard() {
  return Markup.keyboard([
    [Markup.button.locationRequest('Share Location')],
    ['Cancel'],
  ]).resize();
}

export function photoKeyboard() {
  return Markup.keyboard([
    ['Skip Photo'],
    ['Cancel'],
  ]).resize();
}

export function confirmationKeyboard() {
  return Markup.keyboard([
    ['Submit Report'],
    ['Cancel'],
  ]).resize();
}

export function createReportId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ZV-RPT-${random}`;
}

export function removeKeyboard() {
  return Markup.removeKeyboard();
}