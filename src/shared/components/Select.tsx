import ReactSelect, { type GroupBase, type StylesConfig } from 'react-select';

interface OptionType {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: OptionType[];
  value: string | number | undefined;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  required?: boolean;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  isSearchable = false,
  isClearable = false,
}: SelectProps) {
  // Find current selected option
  const selectedOption = options.find(opt => opt.value === value) || null;

  // React select custom styles to match light/dark theme perfectly
  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--select-bg, #f9fafb)',
      borderColor: state.isFocused ? '#7c3aed' : 'var(--select-border, #e5e7eb)',
      borderRadius: '0.75rem', // 12px / rounded-xl
      padding: '0.125rem 0.25rem',
      fontSize: '0.875rem', // 14px / text-sm
      boxShadow: state.isFocused ? '0 0 0 2px rgba(124, 58, 237, 0.2)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: '#8b5cf6',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 8px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--select-text, #111827)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--select-placeholder, #9ca3af)',
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--select-text, #111827)',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--select-menu-bg, #ffffff)',
      borderRadius: '1rem',
      border: '1px solid var(--select-menu-border, #e5e7eb)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      zIndex: 50,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#7c3aed'
        : state.isFocused
        ? 'var(--select-option-hover, #f3f4f6)'
        : 'transparent',
      color: state.isSelected
        ? '#ffffff'
        : 'var(--select-text, #374151)',
      fontSize: '0.875rem',
      padding: '8px 12px',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      active: {
        backgroundColor: '#6d28d9',
      },
      transition: 'background-color 0.15s, color 0.15s',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--select-placeholder, #9ca3af)',
      '&:hover': {
        color: '#7c3aed',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  return (
    <div className={`custom-select-container ${className}`}>
      <ReactSelect
        options={options}
        value={selectedOption}
        onChange={(newValue) => {
          onChange(newValue ? newValue.value : '');
        }}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        styles={customStyles}
        classNames={{
          container: () => 'react-select-container',
        }}
      />
    </div>
  );
}
