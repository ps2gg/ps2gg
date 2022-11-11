import {
  AutocompleteInteraction,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from 'discord.js'

export interface Command {
  name: string
  description: string
  subcommands?: SubCommand[]
  actions?: Action[]

  execute(interaction: ChatInputCommandInteraction)
  executeAction(interaction: ButtonInteraction)
  autocomplete?(interaction: AutocompleteInteraction)
}

export type SubCommand = {
  name: string
  description: string
  args: SubcommandArgument[]
}

export type SubcommandArgument = {
  type: string
  name: string
  description: string
  required?: boolean
  autocomplete?: boolean
}

export type Action = {
  id: string
  state: ActionState
}

export type ActionState = {
  default: ActionStateConfig
  processing: ActionStateConfig
  processed: ActionStateConfig
  current?: ActionStateConfig // taken from interaction
}

export type ActionStateConfig = {
  label: string
  style: ButtonStyle
  emoji?: string
  disabled?: boolean
  hide?: boolean
}