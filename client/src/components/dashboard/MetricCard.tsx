import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  change: string;
  changeColor: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  change,
  changeColor,
}: MetricCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <span className={iconTextColor}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium ${changeColor} truncate`}>
              {change}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
