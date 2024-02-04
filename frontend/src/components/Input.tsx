import { ForwardRefRenderFunction, forwardRef } from "react";

interface IInput {
  placeholder: string;
  type: string;
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, IInput> = (
  { placeholder, type, ...rest },
  ref
) => {
  return (
    <div className="w-full">
      <input
        className="px-3 py-2 bg-gray-950 rounded-md w-full"
        ref={ref}
        type={type}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
};

export const Input = forwardRef(InputBase);
