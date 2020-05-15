const filters = require('../../config/nunjucks/filters')

const tablePresenters = require('./table')

const tableConfig = [
  {
    head: 'allocations::move_size',
    row: {
      attributes: {
        scope: 'row',
      },
      html: data => {
        const content = `${data.moves_count} ${filters.pluralize(
          'person',
          data.moves_count
        )}`
        return `<a href="/allocation/${data.id}">${content}</a>`
      },
    },
  },
  {
    head: 'allocations::requested',
    row: {
      text: data => filters.formatDate(data.created_at),
    },
  },
  {
    head: 'allocations::move_from',
    row: {
      text: 'from_location.title',
    },
  },
  {
    head: 'allocations::move_to',
    row: {
      text: 'to_location.title',
    },
  },
  {
    head: 'date',
    row: {
      text: data => filters.formatDate(data.date),
    },
  },
  {
    head: 'allocations::progress',
    // todo: this field does not exist yet and it might end up having a different name or format
    row: {
      text: 'progress',
    },
  },
]

function allocationsToTable(allocations) {
  return {
    headerForAllocationTable: tableConfig.map(
      tablePresenters.objectToTableHead
    ),
    rowsForAllocationTable: allocations.map(
      tablePresenters.objectToTableRow(tableConfig)
    ),
  }
}

module.exports = allocationsToTable
