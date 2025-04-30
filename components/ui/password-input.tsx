import { Eye, EyeOff } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "./input";
import { Button } from "./button";

interface PasswordInputProps {
  field: any;
  showPassword: boolean;
  toggleVisibility: () => void;
  placeholder?: string;
}

const PasswordInput = ({
  field,
  showPassword,
  toggleVisibility,
  placeholder,
}: PasswordInputProps) => (
  <div className="relative">
    <Input
      type={showPassword ? "text" : "password"}
      placeholder={placeholder || "Enter password"}
      className="focus-visible:ring-0"
      {...field}
    />
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="hover:bg-background"
              onClick={toggleVisibility}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!showPassword ? "Show password" : "Hide password"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

export default PasswordInput;
