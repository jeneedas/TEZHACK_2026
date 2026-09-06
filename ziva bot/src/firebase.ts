import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const serviceAccountPath = resolve(
  process.cwd(),
  'serviceAccountKey.json'
);

const serviceAccount = JSON.parse(
  readFileSync(serviceAccountPath, 'utf-8')
);

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert(serviceAccount),
      });

export const db = getFirestore(firebaseApp);