import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

const assetTypeKeys = [
  'savings',
  'investments',
  'pension',
  'cash',
  'other',
] as const;

export default function AssetsStep() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [assets, setAssets] = useState(data.assets);
  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', amount: 0, type: 'savings' });

  const addAsset = () => {
    if (newAsset.amount > 0) {
      setAssets([...assets, { 
        ...newAsset, 
        name: newAsset.name || t(`onboarding.assets.types.${newAsset.type}`)
      }]);
      setNewAsset({ name: '', amount: 0, type: 'savings' });
      setShowForm(false);
    }
  };

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateData({ assets });
    setCurrentStep(6);
    navigate('/signup');
  };

  const handleBack = () => {
    setCurrentStep(4);
    navigate('/debts');
  };

  return (
    <OnboardingLayout 
      title={t('onboarding.assets.title')}
      subtitle={t('onboarding.assets.subtitle')}
    >
      <div className="space-y-4">
        {/* List of assets */}
        {assets.map((asset, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-xl">
            <div>
              <p className="font-medium text-white">{asset.name}</p>
              <p className="text-sm text-white/50">{t(`onboarding.assets.types.${asset.type}`) || asset.type}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-white">
                {asset.amount.toLocaleString('sv-SE')} kr
              </span>
              <button
                onClick={() => removeAsset(index)}
                className="p-2 text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add new asset form */}
        {showForm ? (
          <div className="space-y-3 p-4 border border-neutral-700 rounded-xl">
            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.assets.type')}</label>
              <select
                value={newAsset.type}
                onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-black border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
              >
                {assetTypeKeys.map(typeKey => (
                  <option key={typeKey} value={typeKey}>{t(`onboarding.assets.types.${typeKey}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.assets.name')}</label>
              <input
                type="text"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder={t('onboarding.assets.namePlaceholder')}
                className="w-full px-4 py-2.5 bg-black border border-neutral-700 text-white rounded-xl placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.assets.value')}</label>
              <FormattedNumberInput
                value={newAsset.amount}
                onChange={(value) => setNewAsset({ ...newAsset, amount: value })}
                placeholder="50 000"
                suffix="kr"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 text-white/60 hover:text-white"
              >
                {t('onboarding.assets.cancel')}
              </button>
              <button
                onClick={addAsset}
                disabled={newAsset.amount <= 0}
                className="flex-1 py-2.5 bg-white text-black rounded-xl font-medium disabled:bg-neutral-600 disabled:text-neutral-400"
              >
                {t('onboarding.assets.add')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-600 rounded-xl text-white/60 hover:border-white/50 hover:text-white transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('onboarding.assets.addAnother')}
          </button>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 py-4 px-6 border border-neutral-700 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-medium text-lg hover:bg-neutral-200 transition-colors"
        >
          {t('onboarding.assets.continue')}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
