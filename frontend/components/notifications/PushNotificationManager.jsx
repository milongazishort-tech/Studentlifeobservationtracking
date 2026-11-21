'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Bell, BellOff, CheckCircle2, ShieldCheck } from 'lucide-react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
        });
      }).catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  const handleSubscribe = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured on client.');
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      const subJson = subscription.toJSON();
      await api.post('/notifications/subscribe', {
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth
        }
      });

      setIsSubscribed(true);
      setMessage('Web Push Notifications successfully enabled on this browser!');
    } catch (err) {
      console.error('Push subscription failed:', err);
      setError(err.message || 'Failed to enable push notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await api.delete('/notifications/unsubscribe', {
          data: { endpoint: subscription.endpoint }
        });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setMessage('Web Push Notifications disabled.');
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
      setError(err.message || 'Failed to unsubscribe.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
        Push notifications are not supported in your current browser environment.
      </div>
    );
  }

  return (
    <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            {isSubscribed ? <Bell className="w-5 h-5 text-blue-600" /> : <BellOff className="w-5 h-5 text-slate-400" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Browser Push Alerts</h4>
            <p className="text-xs text-slate-500">
              {isSubscribed
                ? 'Device registered. You will receive nightly check-in reminders.'
                : 'Receive daily check-in reminders directly in your browser.'}
            </p>
          </div>
        </div>

        <div>
          {isSubscribed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUnsubscribe}
              loading={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              Disable
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleSubscribe}
              loading={isLoading}
              className="text-xs"
            >
              Enable Alerts
            </Button>
          )}
        </div>
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}
    </div>
  );
}
