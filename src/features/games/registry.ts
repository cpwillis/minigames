import WordSearch, { meta as wsMeta } from './components/WordSearch'
import CaesarCipher, { meta as ccMeta } from './components/CaesarCipher'
import CodeTrivia, { meta as ctMeta } from './components/CodeTrivia'
import MemoryMatch, { meta as mmMeta } from './components/MemoryMatch'
import RiddleBox, { meta as rbMeta } from './components/RiddleBox'
import NumberGuess, { meta as ngMeta } from './components/NumberGuess'
import Hangman, { meta as hgMeta } from './components/Hangman'
import HttpStatus, { meta as hsMeta } from './components/HttpStatus'
import BugFinder, { meta as bfMeta } from './components/BugFinder'
import TypingSpeed, { meta as tsMeta } from './components/TypingSpeed'
import RegexMatch, { meta as rmMeta } from './components/RegexMatch'
import ColorHex, { meta as chMeta } from './components/ColorHex'
import JsonFix, { meta as jfMeta } from './components/JsonFix'
import GitScenario, { meta as gsMeta } from './components/GitScenario'
import BigO, { meta as boMeta } from './components/BigO'
import { GAME_IDS } from '@shared/game-ids.ts'
import type { GameMeta } from './types'

export const GAMES: GameMeta[] = [
  { ...wsMeta, component: WordSearch },
  { ...ccMeta, component: CaesarCipher },
  { ...ctMeta, component: CodeTrivia },
  { ...mmMeta, component: MemoryMatch },
  { ...rbMeta, component: RiddleBox },
  { ...ngMeta, component: NumberGuess },
  { ...hgMeta, component: Hangman },
  { ...hsMeta, component: HttpStatus },
  { ...bfMeta, component: BugFinder },
  { ...tsMeta, component: TypingSpeed },
  { ...rmMeta, component: RegexMatch },
  { ...chMeta, component: ColorHex },
  { ...jfMeta, component: JsonFix },
  { ...gsMeta, component: GitScenario },
  { ...boMeta, component: BigO },
].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

// Catches the other drift direction: an id in GAME_IDS with no game behind it (fails the build).
if (GAMES.length !== GAME_IDS.length) throw new Error("registry.ts and game-ids.ts disagree on the game list")
