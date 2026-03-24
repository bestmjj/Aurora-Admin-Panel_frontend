import { useFieldArray } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FieldsRenderer from "./FieldsRenderer";
import FieldShell from "./FieldShell";

interface ListFieldProps {
  name: string;
  label?: string;
  itemSchema: Record<string, unknown>;
  parent?: string | null;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  errors: FieldErrors;
  setValue: UseFormSetValue<FieldValues>;
  className?: string;
}

const ListField = ({ name, label, itemSchema, parent, register, control, errors, setValue, className }: ListFieldProps) => {
  const fullName = parent ? `${parent}.${name}` : name;
  const fieldArray = useFieldArray({ control, name: fullName });

  return (
    <FieldShell className={className} label={label}>
      <div className="mb-2 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => fieldArray.append("")}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <div className="flex w-full flex-col space-y-2">
        {fieldArray.fields.map((item, index) => (
          <div className="flex w-full flex-row items-start" key={item.id}>
            <div className="flex-1">
              <FieldsRenderer
                schema={{ [index]: itemSchema } as Record<string, unknown>}
                parent={fullName}
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:text-destructive"
              onClick={() => fieldArray.remove(index)}
              aria-label="Remove"
            >
              <Trash className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </FieldShell>
  );
};

export default ListField;
