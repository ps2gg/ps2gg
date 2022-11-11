import { Action } from '@ps2gg/discord/command'
import { ButtonStyle } from 'discord.js'

export const updateButton: Action = {
  id: 'alt-update',
  state: {
    default: {
      label: 'Update',
      style: ButtonStyle.Secondary,
      disabled: false,
    },
    processing: {
      label: 'Updating...',
      style: ButtonStyle.Secondary,
      disabled: true,
    },
    processed: {
      label: 'Updated',
      style: ButtonStyle.Secondary,
      emoji: '✅',
      disabled: true,
    }
  }
}

export const showMoreButton: Action = {
  id: 'alt-show-more',
  state: {
    default: {
      label: 'Show More',
      style: ButtonStyle.Secondary,
      disabled: false,
    },
    processing: {
      label: 'Updating...',
      style: ButtonStyle.Secondary,
      disabled: true,
    },
    processed: {
      label: 'Low accuracy results included',
      style: ButtonStyle.Secondary,
      disabled: true,
    }
  }
}