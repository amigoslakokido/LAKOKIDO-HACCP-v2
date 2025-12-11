import { AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface Hint {
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
}

interface LocalAssistantProps {
  hints: Hint[];
}

export function LocalAssistant({ hints }: LocalAssistantProps) {
  if (hints.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {hints.map((hint, index) => (
        <div
          key={index}
          className={`border-2 rounded-lg p-3 ${getBgColor(hint.type)}`}
        >
          <div className="flex items-start gap-2">
            {getIcon(hint.type)}
            <div className="flex-1">
              <div className={`font-semibold text-sm ${getTextColor(hint.type)}`}>
                {hint.title}
              </div>
              <div className={`text-xs mt-1 ${getTextColor(hint.type)} opacity-90`}>
                {hint.message}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
