/**
 * Game content for primary & secondary: single list of games/offers; some are scams.
 * Play games: no choice (just Flip or Roll); offers: Buy.
 */

export type GameItemType = 'play' | 'offer'

export interface GameItem {
  id: string
  type: GameItemType
  name: string
  cost: number
  description: string
  /** Only for type 'offer' */
  isScam?: boolean
  resultMessage?: string
}

export const GAME_ITEMS: GameItem[] = [
  {
    id: 'flip',
    type: 'play',
    name: 'Coin Flip',
    cost: 5,
    description: 'Flip the coin. If it’s heads you win 8 coins!',
  },
  {
    id: 'dice',
    type: 'play',
    name: 'Lucky Dice',
    cost: 10,
    description: 'Roll the dice. Get a 6 and win 20 coins!',
  },
  {
    id: 'offer1',
    type: 'offer',
    name: 'Double Your Coins!',
    cost: 20,
    description: 'Pay 20 coins and we will give you 40! Really!',
    isScam: true,
    resultMessage: 'Oh no – you paid 20 coins but got nothing back. This was a scam. Remember: if it sounds too good, check twice!',
  },
  {
    id: 'offer2',
    type: 'offer',
    name: 'Extra Life',
    cost: 5,
    description: 'Buy one extra life for the puzzle game.',
    isScam: false,
    resultMessage: 'You got an extra life. Fair deal!',
  },
  {
    id: 'offer3',
    type: 'offer',
    name: 'Super Upgrade – Half Price!',
    cost: 50,
    description: 'Normally 100 coins, now only 50! Get it before it\'s gone!',
    isScam: true,
    resultMessage: 'You paid 50 coins but nothing happened. This was a scam. Real offers give you something you can use.',
  },
]
