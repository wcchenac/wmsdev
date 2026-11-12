import type { OptionTypeBase, SelectComponentsConfig } from "react-select";
import makeAnimated from "react-select/animated";

export function animatedSelectComponents<
  Option extends OptionTypeBase,
  IsMulti extends boolean
>(): SelectComponentsConfig<Option, IsMulti> {
  return makeAnimated() as unknown as SelectComponentsConfig<Option, IsMulti>;
}
