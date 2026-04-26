/**
 * @fileoverview Firebase services for ImpactBridge.
 * Integrates: Firestore, Auth, Analytics, and Performance Monitoring.
 *
 * @module firebase
 * @version 1.0.0
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

let app = null;
let db = null;
let auth = null;
let analytics = null;
let perf = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
    perf = getPerformance(app);
  }
} catch (err) {
  console.warn('Firebase init skipped:', err.message);
}

// ── Analytics ─────────────────────────────────────────────────────────

/**
 * Tracks a user event in Firebase Analytics.
 * @param {string} eventName - Event name
 * @param {object} [params={}] - Event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────

const provider = new GoogleAuthProvider();

/**
 * Signs in with Google OAuth popup.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithGoogle() {
  if (!auth) throw new Error('Auth not initialized');
  trackEvent('login_attempt', { method: 'google' });
  const result = await signInWithPopup(auth, provider);
  trackEvent('login_success', { method: 'google', uid: result.user.uid });
  return result;
}

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export async function logOut() {
  if (!auth) return;
  trackEvent('logout');
  await signOut(auth);
}

/**
 * Subscribes to auth state changes.
 * @param {Function} callback - Called with user or null
 * @returns {Function} Unsubscribe function
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ── Firestore: Needs ──────────────────────────────────────────────────

/**
 * Saves extracted community needs to Firestore.
 * @param {Array<object>} needs - Array of need objects
 * @param {string} [source='manual'] - Data source
 * @returns {Promise<string>} Document ID
 */
export async function saveNeeds(needs, source = 'manual') {
  if (!db) throw new Error('Firestore not initialized');
  const ref = await addDoc(collection(db, 'needs_reports'), {
    needs,
    source,
    createdAt: serverTimestamp(),
    status: 'active',
  });
  trackEvent('needs_saved', { count: needs.length, source });
  return ref.id;
}

/**
 * Gets all active community needs from Firestore.
 * @param {number} [maxResults=50] - Max results to return
 * @returns {Promise<Array<object>>}
 */
export async function getActiveNeeds(maxResults = 50) {
  if (!db) return [];
  const q = query(
    collection(db, 'needs_reports'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(maxResults),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Firestore: Volunteers ─────────────────────────────────────────────

/**
 * Registers a volunteer in Firestore.
 * @param {object} volunteerData - Volunteer details
 * @returns {Promise<string>} Document ID
 */
export async function registerVolunteer(volunteerData) {
  if (!db) throw new Error('Firestore not initialized');
  const ref = await addDoc(collection(db, 'volunteers'), {
    ...volunteerData,
    createdAt: serverTimestamp(),
    status: 'available',
  });
  trackEvent('volunteer_registered', { skills: volunteerData.skills?.length || 0 });
  return ref.id;
}

/**
 * Gets all available volunteers.
 * @returns {Promise<Array<object>>}
 */
export async function getAvailableVolunteers() {
  if (!db) return [];
  const q = query(
    collection(db, 'volunteers'),
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Marks a need as resolved.
 * @param {string} reportId - Document ID
 * @returns {Promise<void>}
 */
export async function resolveNeed(reportId) {
  if (!db) return;
  await updateDoc(doc(db, 'needs_reports', reportId), { status: 'resolved' });
  trackEvent('need_resolved', { reportId });
}

export { db, auth, analytics, perf };
