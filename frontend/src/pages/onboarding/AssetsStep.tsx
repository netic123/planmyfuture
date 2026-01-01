import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight, ArrowLeft, Plus, X, PiggyBank } from 'lucide-react';

const assetTypes = [
  'Sparkonto',
  'Investeringar',
  'Pension',
  'Kontanter',
  'Övrigt',
];

export default function AssetsStep() {
  const navigate = useNavigate();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [assets, setAssets] = useState(data.assets);
  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', amount: 0, type: 'Sparkonto' });

  const addAsset = () => {
    if (newAsset.amount > 0) {
      setAssets([...assets, { ...newAsset, name: newAsset.name || newAsset.type }]);
      setNewAsset({ name: '', amount: 0, type: 'Sparkonto' });
      setShowForm(false);
    }
  };

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateData({ assets });
    setCurrentStep(6);
    navigate('/onboarding/signup');
  };

  const handleBack = () => {
    setCurrentStep(4);
    navigate('/onboarding/debts');
  };

  const handleNoAssets = () => {
    updateData({ assets: [] });
    setCurrentStep(6);
    navigate('/onboarding/signup');
  };

  return (
    <OnboardingLayout 
      title="Ditt sparande"
      subtitle="Sparkonton, investeringar, pension..."
    >
      {assets.length === 0 && !showForm ? (
        // Initial choice
        <div className="space-y-3">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-4 p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition-colors"
          >
            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-neutral-900">Ja, lägg till tillgång</p>
              <p className="text-sm text-neutral-500">Du kan lägga till flera</p>
            </div>
          </button>

          <button
            onClick={handleNoAssets}
            className="w-full p-4 text-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Hoppa över för nu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List of assets */}
          {assets.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-900">{asset.name}</p>
                <p className="text-sm text-neutral-500">{asset.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-neutral-900">
                  {asset.amount.toLocaleString('sv-SE')} kr
                </span>
                <button
                  onClick={() => removeAsset(index)}
                  className="p-2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add new asset form */}
          {showForm ? (
            <div className="space-y-3 p-4 border border-neutral-200 rounded-xl">
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">Typ</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl"
                >
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">Namn (valfritt)</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="T.ex. Avanza ISK"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">Värde</label>
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
                  className="flex-1 py-2.5 text-neutral-600 hover:text-neutral-900"
                >
                  Avbryt
                </button>
                <button
                  onClick={addAsset}
                  disabled={newAsset.amount <= 0}
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-medium disabled:opacity-40"
                >
                  Lägg till
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Lägg till tillgång
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 py-4 px-6 border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {(assets.length > 0 || showForm) && (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-colors"
          >
            Fortsätt
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}

