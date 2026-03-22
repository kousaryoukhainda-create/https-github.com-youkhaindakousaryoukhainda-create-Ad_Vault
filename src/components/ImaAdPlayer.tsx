import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ImaAdPlayerProps {
  onAdComplete: () => void;
  onAdError: (error: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function ImaAdPlayer({ onAdComplete, onAdError }: ImaAdPlayerProps) {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    if (!window.google || !window.google.ima) {
      onAdError('Google IMA SDK not loaded');
      return;
    }

    const adDisplayContainer = new window.google.ima.AdDisplayContainer(
      adContainerRef.current,
      videoElementRef.current
    );

    adsLoaderRef.current = new window.google.ima.AdsLoader(adDisplayContainer);

    const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
      if (!isMounted) return;

      const adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      adsManagerRef.current = adsManagerLoadedEvent.getAdsManager(
        videoElementRef.current,
        adsRenderingSettings
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        (adErrorEvent: any) => {
          console.error('Ad Error:', adErrorEvent.getError());
          onAdError(adErrorEvent.getError().getMessage());
        }
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        () => {
          if (videoElementRef.current) {
            try {
              videoElementRef.current.pause();
            } catch (e) {
              // Ignore pause errors
            }
          }
        }
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        () => {
          const playPromise = videoElementRef.current?.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Handle or ignore the play() interruption
            });
          }
          onAdComplete();
        }
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        () => onAdComplete()
      );

      adsManagerRef.current.addEventListener(
        window.google.ima.AdEvent.Type.LOADED,
        () => {
          setIsLoading(false);
          try {
            adsManagerRef.current.start();
          } catch (e) {
            console.error('Failed to start AdsManager:', e);
          }
        }
      );

      try {
        adsManagerRef.current.init(
          adContainerRef.current?.clientWidth || 320,
          adContainerRef.current?.clientHeight || 480,
          window.google.ima.ViewMode.NORMAL
        );
      } catch (adError) {
        onAdError('Failed to initialize AdsManager');
      }
    };

    adsLoaderRef.current.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );

    adsLoaderRef.current.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      (adErrorEvent: any) => {
        console.error('AdsLoader Error:', adErrorEvent.getError());
        onAdError(adErrorEvent.getError().getMessage());
      },
      false
    );

    // Request ads
    const adsRequest = new window.google.ima.AdsRequest();
    // Standard Google IMA Test Tag
    adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    adsRequest.linearAdSlotWidth = adContainerRef.current?.clientWidth || 320;
    adsRequest.linearAdSlotHeight = adContainerRef.current?.clientHeight || 480;
    adsRequest.nonLinearAdSlotWidth = adContainerRef.current?.clientWidth || 320;
    adsRequest.nonLinearAdSlotHeight = adContainerRef.current?.clientHeight || 480;

    adDisplayContainer.initialize();
    adsLoaderRef.current.requestAds(adsRequest);

    return () => {
      isMounted = false;
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
      }
      if (adsLoaderRef.current) {
        adsLoaderRef.current.contentComplete();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-slate-950">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading Google Test Ad...</p>
        </div>
      )}
      <video ref={videoElementRef} className="hidden" />
      <div ref={adContainerRef} className="w-full h-full" />
    </div>
  );
}
