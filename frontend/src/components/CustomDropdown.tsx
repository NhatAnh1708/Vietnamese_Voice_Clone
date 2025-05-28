"use client";
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface Option {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function CustomDropdown({ 
  label, 
  value, 
  options, 
  onChange, 
  disabled = false,
  compact = false 
}: CustomDropdownProps) {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();

  // Find the current option to display its name
  const currentOption = options.find(option => option.id === value);
  const displayName = currentOption?.name || value;

  return (
    <div>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <>
            <Listbox.Label className={`block text-sm font-medium mb-1 ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            } ${disabled ? 'opacity-50' : ''}`}>
              {label}
            </Listbox.Label>
            
            <div className="relative">
              <Listbox.Button className={`relative w-full ${
                compact ? 'py-2' : 'py-2.5'
              } pl-3 pr-10 text-left rounded-lg shadow-sm cursor-default ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border ${
                disabled 
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : ''
              }`}>
                <span className="block truncate">{displayName}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className={`h-5 w-5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    } ${disabled ? 'opacity-50' : ''}`}
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-300'
                } py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm`}>
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
                          active
                            ? darkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                              ? 'text-gray-200'
                              : 'text-gray-900'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                      }
                      value={option.id}
                    >
                      {({ selected, active }) => (
                        <span className={`block truncate ${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}>
                          {option.name}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}