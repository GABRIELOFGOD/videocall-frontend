interface ControlButtonProps {
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: () => void;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  icon: Icon, 
  active, 
  onClick, 
  className = '' 
}) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-full transition-all ${
      active 
        ? 'bg-blue-500 text-white hover:bg-blue-600' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } ${className}`}
  >
    <Icon size={20} />
  </button>
);

export default ControlButton