import { FormContainer, FormSection } from '@/shared/ui/forms';
import type { FormTranslations } from '@/shared/ui/forms';

console.log('FormContainer:', FormContainer);
console.log('FormTranslations type available:', true);

const test: FormTranslations = {
  selectOption: 'test'
};

export default function Test() {
  return <div>Test</div>;
}