import React from 'react';
import { Scissors, CopyMinus, Type, CaseLower } from 'lucide-react';

interface Props {
  onAction: (actionType: string) => void;
  disabled: boolean;
}

const QuickToolbar: React.FC<Props> = ({ onAction, disabled }) => {
  const actions = [
    { id: 'trim', label: 'Trim Whitespace', icon: Scissors, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200' },
    { id: 'dedupe', label: 'Remove Duplicates', icon: CopyMinus, color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200' },
    { id: 'lowercase', label: 'To Lowercase', icon: CaseLower, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200' },
  ];

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap
            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : action.color}`}
        >
          <action.icon size={16} />
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickToolbar;
