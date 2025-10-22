import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const SchoolCard = ({ school, isSelected, onSelect }) => {
  return (
    <div
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-700'}`}
      onClick={() => onSelect(school.id)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 text-blue-500 bg-white rounded-full">
          <FaCheckCircle size={24} />
        </div>
      )}
      <img src={school.college_banner} alt={`${school.name} Banner`} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-white">{school.name}</h3>
        <p className="text-sm text-gray-400">{school.location}</p>
        <p className="mt-2 text-sm text-gray-300">{school.summarized_intro}</p>
      </div>
    </div>
  );
};

export default SchoolCard;
