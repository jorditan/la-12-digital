import { SelectDropdown, type SelectOption } from '../ui/SelectDropdown';
import { FORMATIONS_PRESETS } from './utils/formations';

interface FormacionSelectorProps {
  formationId: string;
  onChange: (id: string) => void;
}

export function FormacionSelector({ formationId, onChange }: FormacionSelectorProps) {
  const options: SelectOption[] = FORMATIONS_PRESETS.map((f) => ({
    value: f.id,
    label: f.label,
  }));

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-sans text-text-muted font-semibold shrink-0">
        Formación:
      </span>
      <SelectDropdown
        options={options}
        value={formationId}
        onChange={onChange}
        className="w-56"
      />
    </div>
  );
}
