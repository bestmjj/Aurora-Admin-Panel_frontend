import { atomWithStorage } from 'jotai/utils'

const serverLimitAtom = atomWithStorage<number>('serverLimit', 10)

export default serverLimitAtom
