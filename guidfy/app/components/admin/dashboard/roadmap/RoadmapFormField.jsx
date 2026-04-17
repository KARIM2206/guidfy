// components/roadmaps/RoadmapFormField.jsx
import Textarea from '@/app/components/ui/Textarea';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';

const RoadmapFormField = ({ field, value, onChange, error, options = [] }) => {
  const commonProps = {
    name: field.name,
    value,
    onChange,
    error: error?.[field.name],
    required: field.required,
    placeholder: field.placeholder,
  };

  if (field.type === 'select') {
    return <Select label={field.label} options={options} {...commonProps} />;
  }
  if (field.type === 'textarea') {
    return <Textarea label={field.label} rows={4} {...commonProps} />;
  }

  return (
    <Input
      label={field.label}
      type={field.type || 'text'}
      {...commonProps}
    />
  );
};

export default RoadmapFormField;