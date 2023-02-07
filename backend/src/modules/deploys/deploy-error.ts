// behavioral errors (non-500s) must be added to this
// set and have their HTTP code chosen in mapError
export enum DeployError {
  NAME_CONFLICT = 'NAME_CONFLICT',
  BAD_REPO = 'BAD_REPO',
}
