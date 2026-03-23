import { AdMob, RewardedAdOptions, AdLoadInfo, RewardItem, AdMobError } from '@capacitor-community/admob';

const REWARDED_AD_UNIT_ID = 'ca-app-pub-9097876174837302/5682066154';
const TEST_REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917'; // Google's standard test ID

// SET THIS TO FALSE FOR LIVE ADS
const IS_TEST_MODE = true; 

export const AdMobService = {
  async initialize() {
    try {
      console.log('Initializing AdMob...');
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        initializeForTesting: IS_TEST_MODE,
      });
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  },

  async showRewardedAd(): Promise<RewardItem | null> {
    try {
      const adId = IS_TEST_MODE ? TEST_REWARDED_AD_UNIT_ID : REWARDED_AD_UNIT_ID;
      console.log(`Preparing rewarded ad with ID: ${adId} (Test Mode: ${IS_TEST_MODE})`);

      const options: RewardedAdOptions = {
        adId: adId,
        isTesting: IS_TEST_MODE,
      };

      await AdMob.prepareRewardVideoAd(options);
      console.log('Rewarded ad prepared, showing now...');
      
      return new Promise((resolve, reject) => {
        const rewardListener = AdMob.addListener('onRewardedVideoAdReward', (reward: RewardItem) => {
          console.log('User earned reward:', reward);
          rewardListener.remove();
          resolve(reward);
        });

        const dismissListener = AdMob.addListener('onRewardedVideoAdDismissed', () => {
          console.log('Ad dismissed by user');
          dismissListener.remove();
          resolve(null);
        });

        const errorListener = AdMob.addListener('onRewardedVideoAdFailedToLoad', (error: AdMobError) => {
          console.error('Ad failed to load. Error details:', error);
          errorListener.remove();
          reject(new Error(`Ad failed to load: ${error.message}`));
        });

        AdMob.showRewardVideoAd().catch((err) => {
          console.error('Failed to show ad:', err);
          reject(err);
        });
      });
    } catch (error) {
      console.error('Error in showRewardedAd:', error);
      throw error;
    }
  }
};
