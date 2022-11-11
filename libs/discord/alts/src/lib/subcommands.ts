import { SubCommand } from '@ps2gg/discord/command'

export const matchSubCommand: SubCommand = {
  name: 'match',
  description: 'Shows all alt characters of a given player',
  args: [
    {
      type: 'string',
      name: 'name',
      description: 'ingame name',
      required: true,
      autocomplete: true,
    },
    {
      type: 'boolean',
      name: 'full',
      description: 'show stats for all classes',
    },
  ],
}
