import type { CanalYoutube } from "../../data/canalesYoutube";
import { SelectDropdown } from "../ui/SelectDropdown";

interface CanalSelectorProps {
  canales: CanalYoutube[];
  selected: CanalYoutube;
  onChange: (canal: CanalYoutube) => void;
}

export function CanalSelector({
  canales,
  selected,
  onChange,
}: CanalSelectorProps) {
  const options = canales.map((c) => ({ value: c.id, label: c.label }));

  function handleChange(value: string) {
    const canal = canales.find((c) => c.id === value);
    if (canal) onChange(canal);
  }

  return (
    <SelectDropdown
      options={options}
      value={selected.id}
      onChange={handleChange}
    />
  );
}
