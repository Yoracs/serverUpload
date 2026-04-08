import { useState } from 'react';
import '../styles/ColorPicker.css';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#d946ef', '#f43f5e', '#ffffff',
  '#94a3b8', '#64748b', '#475569', '#1e293b', '#000000'
];

const ColorPicker = ({ selectedColor, onColorSelect }) => {
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorSelect(color);
  };

  return (
    <div className="color-picker">
      <h3 className="color-picker-title">Choose Color</h3>
      
      <div className="preset-colors">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>

      <div className="custom-color">
        <label htmlFor="custom-color">Custom:</label>
        <div className="custom-color-input">
          <input
            type="color"
            id="custom-color"
            value={customColor}
            onChange={handleCustomColorChange}
          />
          <span className="color-hex">{customColor}</span>
        </div>
      </div>

      <div className="selected-color-preview">
        <span>Selected:</span>
        <div 
          className="preview-box" 
          style={{ backgroundColor: selectedColor }}
        />
        <span className="preview-hex">{selectedColor}</span>
      </div>
    </div>
  );
};

export default ColorPicker;
