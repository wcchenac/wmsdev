import type { RootState } from "./state";

declare module "react-redux" {
  interface DefaultRootState extends RootState {}
}
