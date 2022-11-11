import * as merge from 'lodash.merge'
import { ActionRowBuilder, ButtonBuilder, ActionRowData, ButtonInteraction } from 'discord.js'
import { Action, ActionStateConfig } from './command'

export class Actions {
  private _actions: Action[]
  private _actionRow = new ActionRowBuilder()

  public constructor(actions: Action[], interaction?: ButtonInteraction) {
    if (interaction) {
      const buttons = interaction.message.components[0].components
      const currentActions = buttons.map(b => {
        return {
          // @ts-ignore
          id: b.data.custom_id,
          state: { current: b.data }
        }
      })
      const actionsCopy = structuredClone(actions)
      console.log(actionsCopy, currentActions)
      this._actions = merge(actionsCopy, currentActions)
    } else {
      this._actions = actions
    }
  }

  public get(activeStates: string[]): ActionRowData<any> {
    this._loadActions(this._actions, activeStates)

    // @ts-ignore
    return this._actionRow
  }

  private _loadActions(actions: Action[], activeStates: string[]) {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      const state = activeStates[i]

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this._loadAction(action, action.state[state])
    }
  }

  public _loadAction(action: Action, state: ActionStateConfig): void {
    const button = new ButtonBuilder()

    this._setButtonId(button, action.id)
    this._setButtonLabel(button, state.label)
    this._setButtonStyle(button, state.style)
    this._setButtonEmoji(button, state.emoji)
    this._setButtonDisabled(button, state.disabled)
    this._actionRow.addComponents(button)
  }

  private _setButtonDisabled(button, disabled) {
    if (disabled) button.setDisabled(disabled)
  }

  private _setButtonEmoji(button, emoji) {
    if (emoji) button.setEmoji(emoji)
  }

  private _setButtonStyle(button, style) {
    if (style) button.setStyle(style)
  }

  private _setButtonId(button, id) {
    button.setCustomId(id)
  }

  private _setButtonLabel(button, label) {
    button.setLabel(label)
  }
}

export function mergeActions(actions: Action[], actionId: string, config: ActionConfig): Action[] {
  const actionsCopy = structuredClone(actions)
  const action = actionsCopy.find(a => a.id === actionId)

  merge(action, config)

  return actionsCopy
}

type ActionConfig = {
  id?: string,
  hide?: boolean,
  state?: any
}
